import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "@/lib/proxy-helper";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

      const data = await res.text();
      const nextRes = new NextResponse(data, {
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
        } catch {
          // ignore
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

  // Demo: allow creation only if token contains admin
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !token.includes("admin")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // In a real app, you'd create the user in the DB. For demo, just return success.
  return NextResponse.json({ ok: true });
}
