import { NextResponse } from "next/server";
import { proxyToBackend, parseSetCookie } from "@/lib/proxy-helper";

type Property = { id: string; title: string; price?: number };

// Small in-memory fallback store used when BACKEND_URL is not set
const store: Property[] = [];

export async function GET(req: Request, context: any) {
  const { id } = (await context.params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    return await proxyToBackend(`${backend}/api/properties/${id}`, {
      method: "GET",
      headers: { ...(req.headers as any) },
    });
  }

  const item = store.find((s) => s.id === id);
  if (!item)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, context: any) {
  const { id } = (await context.params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      // Read raw body so multipart/form-data is forwarded unchanged
      let bodyBuffer: ArrayBuffer | null = null;
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        bodyBuffer = null;
      }

      // Request a fresh CSRF token from backend
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

      // Merge incoming cookies with csrf set-cookie values
      const incomingCookie = req.headers.get("cookie") || "";
      const cookieMap = new Map<string, string>();
      for (const part of incomingCookie.split(";")) {
        const p = part.trim();
        if (!p) continue;
        const idx = p.indexOf("=");
        if (idx <= 0) continue;
        const name = p.slice(0, idx);
        const value = p.slice(idx + 1);
        cookieMap.set(name, value);
      }
      for (const sc of csrfSetCookies) {
        try {
          const first = sc.split(";")[0];
          const eq = first.indexOf("=");
          if (eq > 0) {
            const name = first.slice(0, eq);
            const value = first.slice(eq + 1);
            cookieMap.set(name, value);
          }
        } catch {}
      }
      const cookiePairs: string[] = [];
      cookieMap.forEach((v, k) => cookiePairs.push(`${k}=${v}`));

      // Prepare headers to forward: preserve content-type and include csrf token
      const forwarded: Record<string, string> = {};
      const incomingContentType = req.headers.get("content-type");
      if (incomingContentType) forwarded["content-type"] = incomingContentType;
      if (csrfToken) forwarded["x-csrf-token"] = csrfToken;
      if (cookiePairs.length) forwarded["Cookie"] = cookiePairs.join("; ");

      const res = await fetch(`${backend}/api/properties/${id}`, {
        method: "PUT",
        headers: forwarded,
        body: bodyBuffer,
        credentials: "include",
      });

      // Collect response headers and set-cookies
      const contentType = res.headers.get("content-type") || "";
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
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Fallback to in-memory store when no backend is configured
  const body = await req.json().catch(() => ({}));
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...body };
  return NextResponse.json(store[idx]);
}

export async function DELETE(req: Request, context: any) {
  const { id } = (await context.params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    // forward CSRF header and Cookie if present
    const headers: Record<string, string> = {};
    const csrfToken = req.headers.get("x-csrf-token");
    if (csrfToken) headers["x-csrf-token"] = csrfToken;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["Cookie"] = cookie;

    return await proxyToBackend(`${backend}/api/properties/${id}`, {
      method: "DELETE",
      headers,
    });
  }

  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
