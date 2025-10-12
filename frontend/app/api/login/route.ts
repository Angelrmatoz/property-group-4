import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxyToBackend, parseSetCookie } from "@/lib/proxy-helper";

export async function GET() {
  const backend = process.env.BACKEND_URL;
  // If backend is configured, proxy to backend /api/auth/me so we get a
  // structured user object (including admin flag). This requires
  // credentials so the backend can read the httpOnly token cookie.
  if (backend) {
    const cookieStore = await cookies();
    return await proxyToBackend(
      `${backend}/api/auth/me`,
      {
        method: "GET",
      },
      cookieStore
    );
  }

  // No backend configured: fallback to reading token from cookie (dev/demo)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return NextResponse.json({
    admin: Boolean(token && token.includes("admin")),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};

  // If a backend is configured, proxy the request
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      // DEV DEBUG: check if incoming request contains forwarded headers
      // In development we may receive forwarded headers; do not log them here to avoid leaking IPs.

      // First fetch CSRF token from backend so we can include it in the login request.
      // We must include credentials so the backend can set/read the csurf secret cookie.
      const csrfRes = await fetch(`${backend}/api/csrf-token`, {
        credentials: "include",
      });

      let csrfToken: string | undefined = undefined;
      // Capture any Set-Cookie headers the backend sent so we can forward the
      // csurf secret cookie in the subsequent login request.
      const csrfSetCookies: string[] = [];

      if (csrfRes.ok) {
        try {
          const csrfData = await csrfRes.json();
          csrfToken = csrfData.csrfToken;
        } catch {
          // ignore
        }

        // Extract Set-Cookie headers
        csrfRes.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            csrfSetCookies.push(value);
          }
        });
      }

      // backend auth routes are mounted under /api/auth
      const loginHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (csrfToken) loginHeaders["X-CSRF-Token"] = csrfToken;
      if (csrfSetCookies.length) {
        // Forward cookies returned by csrf endpoint in the Cookie header for the
        // subsequent login request so csurf can validate tokens.
        // Join into a single Cookie header (take only name=value parts).
        const cookiePairs = csrfSetCookies
          .map((c) => c.split(";")[0])
          .join("; ");
        loginHeaders["Cookie"] = cookiePairs;
      }

      const res = await fetch(`${backend}/api/auth/login`, {
        method: "POST",
        headers: loginHeaders,
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      // response status intentionally not logged

      // Extract headers to forward
      const forwarded: Record<string, string> = {};
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
        forwarded[key] = value;
      });

      // Handle JSON responses
      const contentType = res.headers.get("content-type") || "";
      let nextRes: NextResponse;

      if (contentType.includes("application/json")) {
        try {
          const data = await res.json();
          // response data intentionally not logged
          nextRes = NextResponse.json(data, {
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

      // Forward Set-Cookie headers (preserve attributes)
      const forwardedNames: string[] = [];
      for (const sc of setCookies) {
        try {
          const parsed = parseSetCookie(sc);
          if (parsed) {
            nextRes.cookies.set(
              parsed.name,
              parsed.value,
              parsed.options as any
            );
            forwardedNames.push(parsed.name);
          }
        } catch {
          // ignore
        }
      }

      // forwarded cookies intentionally not logged

      return nextRes;
    } catch {
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }

  // No backend configured: reject authentication. The app relies on a
  // real backend to perform auth. Configure BACKEND_URL to enable login.
  if (!backend) {
    return NextResponse.json(
      { error: "No backend configured for authentication" },
      { status: 503 }
    );
  }

  // If we reach this point, the backend proxy handled the request above.
  // Fallback: invalid credentials (shouldn't be reachable when backend proxies).
  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
