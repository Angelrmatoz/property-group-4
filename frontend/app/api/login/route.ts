import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
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
      // First fetch CSRF token from backend so we can include it in the login request.
      // We must include credentials so the backend can set/read the csurf secret cookie.
      const csrfRes = await fetch(`${backend}/api/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      let csrfToken: string | undefined = undefined;
      // Capture any Set-Cookie headers the backend sent so we can forward the
      // csurf secret cookie in the subsequent login request.
      const csrfSetCookies: string[] = [];
      if (csrfRes) {
        try {
          const j = await csrfRes.json().catch(() => ({}));
          csrfToken = (j as any).csrfToken;
        } catch {
          // ignore
        }
        try {
          // Node/edge fetch may present set-cookie as multiple headers; collect them
          csrfRes.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") csrfSetCookies.push(value);
          });
        } catch {
          // ignore
        }
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
        // Include cookies so the backend can set/read the httpOnly token cookie
        // and csurf secret cookie.
        credentials: "include",
      });
      const data = await res.text();

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
          ["transfer-encoding", "connection", "keep-alive", "upgrade"].includes(
            k
          )
        )
          return;
        forwarded[key] = value;
      });

      const nextRes = new NextResponse(data, {
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
          } catch {
            // ignore
          }
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
