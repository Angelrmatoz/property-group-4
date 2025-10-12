import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxyToBackend, parseSetCookie } from "@/lib/proxy-helper";

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );

  const cookieStore = await cookies();
  return await proxyToBackend(
    `${backend}/api/users`,
    {
      method: "GET",
    },
    cookieStore
  );
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
    if (incomingCsrf) headers["x-csrf-token"] = incomingCsrf;
    if (cookiePairs.length) headers["Cookie"] = cookiePairs.join("; ");

    const res = await fetch(`${backend}/api/users`, {
      method: "POST",
      headers,
      body: bodyText,
      credentials: "include",
    });

    const forwarded: Record<string, string> = {};
    const setCookies: string[] = [];

    res.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "set-cookie") {
        setCookies.push(value);
        return;
      }
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
      forwarded[key] = value;
    });

    const contentType = res.headers.get("content-type") || "";
    let nextRes: NextResponse;

    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        nextRes = NextResponse.json(json, {
          status: res.status,
          headers: forwarded,
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
        headers: forwarded,
      });
    }

    for (const sc of setCookies) {
      try {
        const parsed = parseSetCookie(sc);
        if (parsed) {
          nextRes.cookies.set(parsed.name, parsed.value, parsed.options as any);
        }
      } catch {}
    }

    return nextRes;
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
