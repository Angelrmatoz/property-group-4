import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DEMO_EMAIL = "admin@example.test";
const DEMO_PASSWORD = "password123";

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
      const res = await fetch(`${backend}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

  // Demo local auth: accept the demo credentials and set an httpOnly admin cookie
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: "token",
      value: "dev-admin-token",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
