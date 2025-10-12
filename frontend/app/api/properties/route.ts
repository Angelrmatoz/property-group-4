import { NextResponse } from "next/server";
import { proxyToBackend, parseSetCookie } from "@/lib/proxy-helper";

type Property = { id: string; title: string; price?: number };

// Very small in-memory store for demo purposes
const store: Property[] = [];

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (backend) {
    return await proxyToBackend(`${backend}/api/properties`, {
      method: "GET",
    });
  }
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      // To avoid CSRF mismatches (client token vs secret cookie), perform
      // a server-side CSRF handshake: request a fresh token from backend
      // and merge the returned _csrf secret cookie with the incoming auth
      // cookie (token) before proxying the POST. This mirrors the login
      // proxy flow where the server obtains the token and includes cookies
      // in the same request to the backend.

      // Read raw body so multipart/form-data is forwarded unchanged
      let bodyBuffer: ArrayBuffer | null = null;
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        bodyBuffer = null;
      }

      // Get a fresh CSRF token from backend (this sets a new _csrf cookie)
      const csrfRes = await fetch(`${backend}/api/csrf-token`, {
        credentials: "include",
      });

      let csrfToken: string | undefined = undefined;
      const csrfSetCookies: string[] = [];
      if (csrfRes.ok) {
        try {
          const json = await csrfRes.json();
          csrfToken = json.csrfToken;
        } catch {}

        csrfRes.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") csrfSetCookies.push(value);
        });
      }

      // Build Cookie header for backend: merge incoming cookies with new _csrf
      const incomingCookie = req.headers.get("cookie") || "";
      const cookieMap = new Map<string, string>();
      // Parse incoming cookies into map
      for (const part of incomingCookie.split(";")) {
        const p = part.trim();
        if (!p) continue;
        const idx = p.indexOf("=");
        if (idx <= 0) continue;
        const name = p.slice(0, idx);
        const value = p.slice(idx + 1);
        cookieMap.set(name, value);
      }

      // Override/add cookies coming from csrf endpoint (usually _csrf)
      for (const sc of csrfSetCookies) {
        try {
          // sc might be like '_csrf=abc; Path=/; HttpOnly'
          const first = sc.split(";")[0];
          const eq = first.indexOf("=");
          if (eq > 0) {
            const name = first.slice(0, eq);
            const value = first.slice(eq + 1);
            cookieMap.set(name, value);
          }
        } catch {}
      }

      // Rebuild cookie header
      const cookiePairs: string[] = [];
      cookieMap.forEach((v, k) => cookiePairs.push(`${k}=${v}`));

      // Prepare headers to forward
      const forwarded: Record<string, string> = {};
      // Preserve content-type so backend can parse multipart boundary
      const incomingContentType = req.headers.get("content-type");
      if (incomingContentType) forwarded["content-type"] = incomingContentType;
      if (csrfToken) forwarded["x-csrf-token"] = csrfToken;
      if (cookiePairs.length) forwarded["Cookie"] = cookiePairs.join("; ");

      const res = await fetch(`${backend}/api/properties`, {
        method: "POST",
        headers: forwarded,
        body: bodyBuffer,
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";

      // Collect headers to forward back to the client (except hop-by-hop)
      const respHeaders: Record<string, string> = {};
      const setCookies: string[] = [];

      res.headers.forEach((value, key) => {
        const k = key.toLowerCase();
        if (k === "set-cookie") {
          setCookies.push(value);
          return;
        }
        if (k === "location" || k === "content-location") return;
        if (
          [
            "transfer-encoding",
            "connection",
            "keep-alive",
            "upgrade",
            "content-encoding",
            "content-length",
          ].includes(k)
        )
          return;
        respHeaders[key] = value;
      });

      let nextRes: NextResponse;

      if (contentType.includes("application/json")) {
        try {
          const json = await res.json();
          nextRes = NextResponse.json(json, {
            status: res.status,
            headers: respHeaders,
          });
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON from backend" },
            { status: 502 }
          );
        }
      } else {
        // Non-JSON response
        const text = await res.text();
        nextRes = new NextResponse(text, {
          status: res.status,
          headers: respHeaders,
        });
      }

      // Forward Set-Cookie headers (preserve attributes)
      for (const sc of setCookies) {
        try {
          const parsed = parseSetCookie(sc);
          if (parsed) {
            nextRes.cookies.set(
              parsed.name,
              parsed.value,
              parsed.options as any
            );
          }
        } catch {}
      }

      return nextRes;
    } catch {
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }

  const body = await req.json().catch(() => ({}));
  const { title, price } = body || {};
  const newItem: Property = {
    id: String(Date.now()),
    title: title || "Untitled",
    price,
  };
  store.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}
