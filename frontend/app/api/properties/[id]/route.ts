import { NextResponse } from "next/server";
import axios from "axios";

type Property = { id: string; title: string; price?: number };

// Reference the same simple in-memory store as route.ts (note: in dev this lives per server instance)
const store: Property[] = [];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const backend = process.env.BACKEND_URL;
  // await params in case it's a Promise-like object provided by Next
  const { id } = (await params) as { id: string };
  if (backend) {
    try {
      const res = await axios.get(`${backend}/api/properties/${id}`, {
        validateStatus: () => true,
        responseType: "text",
      });
      const contentType = (res.headers && (res.headers["content-type"] || "")) as string;
      const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

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
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }
  const item = store.find((s) => s.id === id);
  if (!item)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = (await params) as { id: string };
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

      // If the client sent cookies, forward them to the backend
      const cookie = req.headers.get("cookie");
      if (cookie) forwarded["Cookie"] = cookie;

      // Read raw body (works for JSON and multipart/form-data). Use arrayBuffer
      // so we forward the exact bytes received to the backend.
      let bodyBuffer: ArrayBuffer | null = null;
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        bodyBuffer = null;
      }

      // The client already fetches /api/csrf-token and includes the
      // X-CSRF-Token header and cookies when calling this route.
      // Forward the incoming headers (including Cookie and X-CSRF-Token)
      // directly to the backend. Do not request a new token server-side
      // because that would generate a different secret and cause a mismatch.

      const res = await axios.put(`${backend}/api/properties/${id}`, bodyBuffer, {
        headers: forwarded as any,
        validateStatus: () => true,
        responseType: "text",
      });

      const contentType = (res.headers && (res.headers["content-type"] || "")) as string;
      const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

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
        if (value !== undefined && value !== null) respHeaders[key] = String(value);
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

  // Fallback to in-memory store when no backend is configured
  const body = await req.json().catch(() => ({}));
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...body };
  return NextResponse.json(store[idx]);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = (await params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
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
      const cookie = req.headers.get("cookie");
      if (cookie) forwarded["Cookie"] = cookie;

      const res = await axios.delete(`${backend}/api/properties/${id}`, {
        headers: forwarded as any,
        validateStatus: () => true,
        responseType: "text",
      });

      const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

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
        if (value !== undefined && value !== null) respHeaders[key] = String(value);
      }

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

  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
