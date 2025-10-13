import { NextResponse } from "next/server";

type Property = { id: string; title: string; price?: number };

// Small in-memory fallback store used when BACKEND_URL is not set
const store: Property[] = [];

export async function GET(req: Request, context: any) {
  const { id } = (await context.params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    const headers: Record<string, string> = {};
    const authHeader = req.headers.get("Authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${backend}/api/properties/${id}`, {
      method: "GET",
      headers,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  const item = store.find((s) => s.id === id);
  if (!item)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, context: any) {
  const { id } = (await context.params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      // Get Authorization header to forward to backend
      const authHeader = req.headers.get("Authorization");

      // Read raw body so multipart/form-data is forwarded unchanged
      let bodyBuffer: ArrayBuffer | null = null;
      try {
        bodyBuffer = await req.arrayBuffer();
      } catch {
        bodyBuffer = null;
      }

      // Prepare headers to forward
      const forwarded: Record<string, string> = {};
      const incomingContentType = req.headers.get("content-type");
      if (incomingContentType) forwarded["content-type"] = incomingContentType;
      if (authHeader) forwarded["Authorization"] = authHeader;

      const res = await fetch(`${backend}/api/properties/${id}`, {
        method: "PUT",
        headers: forwarded,
        body: bodyBuffer,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
      }

      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Fallback to in-memory store when no backend is configured
  const body = await req.json().catch(() => ({}));
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...body };
  return NextResponse.json(store[idx]);
}

export async function DELETE(req: Request, context: any) {
  const { id } = (await context.params) as { id: string };
  const backend = process.env.BACKEND_URL;
  if (backend) {
    // Forward Authorization header if present
    const headers: Record<string, string> = {};
    const authHeader = req.headers.get("Authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(`${backend}/api/properties/${id}`, {
      method: "DELETE",
      headers,
    });

    // Handle 204 No Content responses (successful deletion)
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // For other status codes, try to parse JSON response
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
