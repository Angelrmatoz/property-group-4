import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

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

    const res = await axios.get(`${backend}/api/users`, {
      withCredentials: true,
      headers: cookiePairs.length
        ? { Cookie: cookiePairs.join("; ") }
        : undefined,
      validateStatus: () => true,
      responseType: "text",
    });

    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    const contentType = (res.headers && (res.headers["content-type"] || "")) as string;

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

    const res = await axios.post(`${backend}/api/users`, bodyText, {
      headers,
      withCredentials: true,
      validateStatus: () => true,
      responseType: "text",
    });

    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
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

    const contentType = (res.headers && (res.headers["content-type"] || "")) as string;
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
