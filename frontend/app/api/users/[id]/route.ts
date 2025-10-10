import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
    const cookieStore = await cookies();
    const cookiePairs: string[] = [];
    cookieStore
      .getAll()
      .forEach((c) => cookiePairs.push(`${c.name}=${c.value}`));

    // Forward CSRF token and authorization if present in incoming request
    // headers. We can read them from the incoming Request and pass them
    // through to the backend fetch so csurf and auth work correctly.
    const headers: Record<string, string> = {};
    if (cookiePairs.length) headers["Cookie"] = cookiePairs.join("; ");
    try {
      // Next Request headers are a Headers-like object; use get to read
      const incomingCsrf = (_req.headers as any)?.get
        ? (_req.headers as any).get("x-csrf-token") ||
          (_req.headers as any).get("X-CSRF-Token")
        : undefined;
      const incomingAuth = (_req.headers as any)?.get
        ? (_req.headers as any).get("authorization") ||
          (_req.headers as any).get("Authorization")
        : undefined;
      if (incomingCsrf) headers["X-CSRF-Token"] = incomingCsrf;
      if (incomingAuth) headers["Authorization"] = incomingAuth;
    } catch {
      // ignore header read errors
    }

    const p = await (params as any);
    const id = p.id as string;
    if (!id) {
      console.error("/api/users/[id] proxy called without id (DELETE)");
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const res = await fetch(`${backend}/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers,
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    }
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
    const cookieStore = await cookies();
    const cookiePairs: string[] = [];
    cookieStore
      .getAll()
      .forEach((c) => cookiePairs.push(`${c.name}=${c.value}`));

    const headers: Record<string, string> = {};
    if (cookiePairs.length) headers["Cookie"] = cookiePairs.join("; ");
    try {
      const incomingCsrf = (_req.headers as any)?.get
        ? (_req.headers as any).get("x-csrf-token") ||
          (_req.headers as any).get("X-CSRF-Token")
        : undefined;
      const incomingAuth = (_req.headers as any)?.get
        ? (_req.headers as any).get("authorization") ||
          (_req.headers as any).get("Authorization")
        : undefined;
      if (incomingCsrf) headers["X-CSRF-Token"] = incomingCsrf;
      if (incomingAuth) headers["Authorization"] = incomingAuth;
    } catch {
      // ignore
    }

    const p = await (params as any);
    const id = p.id as string;
    if (!id) {
      console.error("/api/users/[id] proxy called without id (GET)");
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const res = await fetch(`${backend}/api/users/${id}`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    }
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("/api/users/[id] proxy GET error:", err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
