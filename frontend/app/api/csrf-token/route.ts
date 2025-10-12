import { NextResponse } from "next/server";
import { parseSetCookie } from "@/lib/proxy-helper";

export async function GET(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );
  }

  // DEV DEBUG: log if incoming request contained any forwarded headers
  if (process.env.NODE_ENV === "development") {
    try {
      const incomingForwarded = [
        "x-forwarded-for",
        "forwarded",
        "x-real-ip",
        "x-forwarded-host",
        "x-forwarded-proto",
      ].filter((h) => req.headers.has(h));
      if (incomingForwarded.length) {
        console.log(
          "[csrf-token proxy] Incoming request had forwarded headers:",
          incomingForwarded.join(", ")
        );
        // log values for debugging
        for (const h of incomingForwarded) {
          console.log(`[csrf-token proxy] ${h}:`, req.headers.get(h));
        }
      }
    } catch {
      // ignore
    }
  }

  try {
    // Request CSRF token from backend using fetch
    const res = await fetch(`${backend}/api/csrf-token`, {
      credentials: "include",
    });

    console.log("[csrf-token proxy] Backend response status:", res.status);

    const contentType = res.headers.get("content-type") || "";

    const forwarded: Record<string, string> = {};
    const setCookies: string[] = [];

    // Extract headers
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

    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        console.log("[csrf-token proxy] Backend response data:", json);

        const nextRes = NextResponse.json(json, {
          status: res.status,
          headers: forwarded,
        });

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
          { error: "Invalid JSON from backend" },
          { status: 502 }
        );
      }
    }

    // Non-JSON response
    const text = await res.text();
    const nextRes = new NextResponse(text, {
      status: res.status,
      headers: forwarded,
    });

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
