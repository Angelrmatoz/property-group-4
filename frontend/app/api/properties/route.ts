import { NextResponse } from "next/server";
import axios from "axios";

type Property = { id: string; title: string; price?: number };

// Very small in-memory store for demo purposes
const store: Property[] = [];

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      const res = await axios.get(`${backend}/api/properties`, {
        validateStatus: () => true,
        responseType: "text",
      });
      const contentType = (res.headers &&
        (res.headers["content-type"] || "")) as string;
      const text =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      // Prefer to return parsed JSON to the client so we don't forward raw
      // backend headers (which may contain relative Location values that
      // break the RSC parser). If the backend responded with JSON, parse
      // and return it safely. Otherwise return the raw text body.
      if (contentType.includes("application/json")) {
        try {
          const json = JSON.parse(text);
          return NextResponse.json(json, { status: res.status });
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON from backend" },
            { status: 502 }
          );
        }
      }

      return new NextResponse(text, { status: res.status });
    } catch {
      // Return a safe error response so RSC doesn't throw a parse error
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      // Forward incoming headers except hop-by-hop headers
      const forwarded: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        const k = key.toLowerCase();
        if (
          [
            "connection",
            "keep-alive",
            "transfer-encoding",
            "upgrade",
            "host",
          ].includes(k)
        )
          return;
        forwarded[key] = value;
      });

      // Explicitly forward CSRF token if present
      const csrfToken = req.headers.get("x-csrf-token");
      const csrfTokenUpper = req.headers.get("X-CSRF-Token");
      const actualCsrf = csrfToken || csrfTokenUpper;

      // DEBUG: Log what we received
      console.log("[properties POST proxy] Incoming headers check:");
      console.log(
        "  x-csrf-token (lowercase):",
        csrfToken ? "PRESENT" : "MISSING"
      );
      console.log(
        "  X-CSRF-Token (uppercase):",
        csrfTokenUpper ? "PRESENT" : "MISSING"
      );
      console.log(
        "  Actual CSRF token to forward:",
        actualCsrf ? actualCsrf.substring(0, 10) + "..." : "NONE"
      );

      if (actualCsrf) {
        forwarded["X-CSRF-Token"] = actualCsrf;
        forwarded["x-csrf-token"] = actualCsrf;
      } else {
        console.error(
          "[properties POST proxy] NO CSRF TOKEN FOUND IN INCOMING REQUEST!"
        );
      }

      // Forward cookie if present
      const cookie = req.headers.get("cookie");
      if (cookie) forwarded["Cookie"] = cookie;

      // Read raw body so multipart/form-data is forwarded unchanged
      let bodyBuffer: ArrayBuffer | null = null;
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        bodyBuffer = null;
      }

      const res = await axios.post(`${backend}/api/properties`, bodyBuffer, {
        headers: forwarded as any,
        validateStatus: () => true,
        responseType: "text",
      });

      const contentType = (res.headers &&
        (res.headers["content-type"] || "")) as string;
      const text =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      // Collect headers to forward back to the client (except hop-by-hop)
      const respHeaders: Record<string, string> = {};
      const setCookies: string[] = [];
      for (const [key, value] of Object.entries(res.headers || {})) {
        const k = key.toLowerCase();
        if (k === "set-cookie") {
          if (Array.isArray(value)) setCookies.push(...(value as string[]));
          else if (value) setCookies.push(String(value));
          continue;
        }
        if (k === "location" || k === "content-location") continue;
        if (
          ["transfer-encoding", "connection", "keep-alive", "upgrade"].includes(
            k
          )
        )
          continue;
        if (value !== undefined && value !== null)
          respHeaders[key] = String(value);
      }

      if (contentType.includes("application/json")) {
        try {
          const json = JSON.parse(text);
          const nextRes = NextResponse.json(json, {
            status: res.status,
            headers: respHeaders,
          });
          for (const sc of setCookies) {
            const first = sc.split(";")[0];
            const idx = first.indexOf("=");
            if (idx > 0) {
              const name = first.slice(0, idx);
              const value = first.slice(idx + 1);
              try {
                nextRes.cookies.set(name, value);
              } catch {}
            }
          }
          return nextRes;
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON from backend" },
            { status: 502 }
          );
        }
      }

      // Non-JSON response
      const nextRes = new NextResponse(text, {
        status: res.status,
        headers: respHeaders,
      });
      for (const sc of setCookies) {
        const first = sc.split(";")[0];
        const idx = first.indexOf("=");
        if (idx > 0) {
          const name = first.slice(0, idx);
          const value = first.slice(idx + 1);
          try {
            nextRes.cookies.set(name, value);
          } catch {}
        }
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
