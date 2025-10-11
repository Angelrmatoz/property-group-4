import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET() {
  const backend = process.env.BACKEND_URL;
  // If backend is configured, proxy to backend /api/auth/me so we get a
  // structured user object (including admin flag). This requires
  // credentials so the backend can read the httpOnly token cookie.
  if (backend) {
    try {
      // forward any cookies from the incoming request so backend receives
      // the httpOnly token cookie used by authenticate middleware
      const cookieStore = await cookies();
      const cookiePairs: string[] = [];
      cookieStore
        .getAll()
        .forEach((c) => cookiePairs.push(`${c.name}=${c.value}`));

      const res = await axios.get(`${backend}/api/auth/me`, {
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
          ["transfer-encoding", "connection", "keep-alive", "upgrade"].includes(
            k
          )
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
              } catch {
                // ignore
              }
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
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
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
      // First fetch CSRF token from backend so we can include it in the login request.
      // We must include credentials so the backend can set/read the csurf secret cookie.
      const csrfRes = await axios.get(`${backend}/api/csrf-token`, {
        withCredentials: true,
        validateStatus: () => true,
      });
      let csrfToken: string | undefined = undefined;
      // Capture any Set-Cookie headers the backend sent so we can forward the
      // csurf secret cookie in the subsequent login request.
      const csrfSetCookies: string[] = [];
      if (csrfRes && csrfRes.data) {
        try {
          csrfToken = csrfRes.data.csrfToken;
        } catch {
          // ignore
        }
        try {
          // Axios exposes set-cookie in headers['set-cookie']
          const sc = csrfRes.headers["set-cookie"];
          if (Array.isArray(sc)) csrfSetCookies.push(...sc);
          else if (sc) csrfSetCookies.push(String(sc));
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

      const res = await axios.post(`${backend}/api/auth/login`, 
        { email, password },
        {
          headers: loginHeaders,
          withCredentials: true,
          validateStatus: () => true,
          responseType: "text",
        }
      );
      const data = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

      const forwarded: Record<string, string> = {};
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
        if (value !== undefined && value !== null) forwarded[key] = String(value);
      }

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
