import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );

  try {
    // Forward Authorization header if present
    const headers: Record<string, string> = {};
    try {
      const incomingAuth = (_req.headers as any)?.get
        ? (_req.headers as any).get("authorization") ||
          (_req.headers as any).get("Authorization")
        : undefined;
      if (incomingAuth) headers["Authorization"] = incomingAuth;
    } catch {
      // ignore header read errors
    }

    const p = await (params as any);
    const id = p.id as string;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const res = await fetch(`${backend}/api/users/${id}`, {
      method: "DELETE",
      headers,
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const backend = process.env.BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "No backend configured" },
      { status: 503 }
    );

  try {
    const headers: Record<string, string> = {};
    try {
      const incomingAuth = (_req.headers as any)?.get
        ? (_req.headers as any).get("authorization") ||
          (_req.headers as any).get("Authorization")
        : undefined;
      if (incomingAuth) headers["Authorization"] = incomingAuth;
    } catch {
      // ignore
    }

    const p = await (params as any);
    const id = p.id as string;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const res = await fetch(`${backend}/api/users/${id}`, {
      method: "GET",
      headers,
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
