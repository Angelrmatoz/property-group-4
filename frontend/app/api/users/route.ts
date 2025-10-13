import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );

  const headers: Record<string, string> = {};
  const authHeader = req.headers.get("Authorization");
  if (authHeader) headers["Authorization"] = authHeader;

  const res = await fetch(`${backend}/api/users`, {
    method: "GET",
    headers,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // Forward Authorization header if present
    const authHeader = req.headers.get("Authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${backend}/api/users`, {
      method: "POST",
      headers,
      body: bodyText,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
