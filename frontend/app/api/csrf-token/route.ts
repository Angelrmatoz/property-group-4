import { NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );
  }

  try {
    // Fetch CSRF token from backend and forward Set-Cookie headers
    const res = await fetch(`${backend}/api/csrf-token`, {
      method: "GET",
      // include credentials so backend can set the csurf secret cookie
      credentials: "include",
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    const forwarded: Record<string, string> = {};
    const setCookies: string[] = [];
    res.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "set-cookie") {
        setCookies.push(value);
        return;
      }
      if (
        ["transfer-encoding", "connection", "keep-alive", "upgrade"].includes(k)
      )
        return;
      forwarded[key] = value;
    });

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
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
