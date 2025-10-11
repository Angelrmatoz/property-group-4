import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );
  }

  try {
    // Request CSRF token from backend using axios so we can access headers
    const res = await axios.get(`${backend}/api/csrf-token`, {
      // In Node, axios exposes Set-Cookie headers in res.headers['set-cookie']
      withCredentials: true,
      responseType: "text",
      validateStatus: () => true, // handle non-2xx manually
    });

    const text =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    const contentType = (res.headers &&
      (res.headers["content-type"] || "")) as string;

    const forwarded: Record<string, string> = {};
    const setCookies: string[] = [];

    for (const [key, value] of Object.entries(res.headers || {})) {
      const k = key.toLowerCase();
      if (k === "set-cookie") {
        if (Array.isArray(value)) setCookies.push(...(value as string[]));
        else if (value) setCookies.push(String(value));
        continue;
      }
      if (
        ["transfer-encoding", "connection", "keep-alive", "upgrade"].includes(k)
      )
        continue;
      if (value !== undefined && value !== null) forwarded[key] = String(value);
    }

    if (contentType.includes("application/json")) {
      try {
        const json = JSON.parse(text);
        const nextRes = NextResponse.json(json, {
          status: res.status,
          headers: forwarded,
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

    const nextRes = new NextResponse(text, {
      status: res.status,
      headers: forwarded,
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
  } catch (err) {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
