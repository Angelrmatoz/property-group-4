import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );
  }

  // Get Authorization header from request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization header required" },
      { status: 401 }
    );
  }

  // Proxy to backend /api/auth/me with JWT token
  const res = await fetch(`${backend}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};

  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "No backend configured for authentication" },
      { status: 503 }
    );
  }

  try {
    // Send login request directly to backend without CSRF
    const res = await fetch(`${backend}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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
