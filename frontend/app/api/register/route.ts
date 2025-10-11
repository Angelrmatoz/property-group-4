import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      const res = await axios.post(`${backend}/api/register`, body, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
        responseType: "text",
      });
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

  // Demo: allow creation only if token contains admin
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !token.includes("admin")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // In a real app, you'd create the user in the DB. For demo, just return success.
  return NextResponse.json({ ok: true });
}
