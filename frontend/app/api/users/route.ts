import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );

  try {
    const cookieStore = await cookies();
    const cookiePairs: string[] = [];
    cookieStore
      .getAll()
      .forEach((c) => cookiePairs.push(`${c.name}=${c.value}`));

    const res = await fetch(`${backend}/api/users`, {
      method: "GET",
      credentials: "include",
      headers: cookiePairs.length
        ? { Cookie: cookiePairs.join("; ") }
        : undefined,
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

export async function POST(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );

  try {
    const bodyText = await req.text().catch(() => "");
    const cookieStore = await cookies();
    const cookiePairs: string[] = [];
    cookieStore
      .getAll()
      .forEach((c) => cookiePairs.push(`${c.name}=${c.value}`));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // forward incoming CSRF header if present
    const incomingCsrf = req.headers.get("x-csrf-token");
    if (incomingCsrf) headers["X-CSRF-Token"] = incomingCsrf;
    if (cookiePairs.length) headers["Cookie"] = cookiePairs.join("; ");

    const res = await fetch(`${backend}/api/users`, {
      method: "POST",
      headers,
      body: bodyText,
      credentials: "include",
    });

    const text = await res.text();
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

    const contentType = res.headers.get("content-type") || "";
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
