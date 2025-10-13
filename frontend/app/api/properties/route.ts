import { NextResponse } from "next/server";

type Property = { id: string; title: string; price?: number };

// Very small in-memory store for demo purposes
const store: Property[] = [];

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (backend) {
    const res = await fetch(`${backend}/api/properties`, {
      method: "GET",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  return NextResponse.json(store);
}

export async function POST(req: Request) {
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
      // Preserve content-type so backend can parse multipart boundary
      const incomingContentType = req.headers.get("content-type");
      if (incomingContentType) forwarded["content-type"] = incomingContentType;
      if (authHeader) forwarded["Authorization"] = authHeader;

      const res = await fetch(`${backend}/api/properties`, {
        method: "POST",
        headers: forwarded,
        body: bodyBuffer,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
      }

      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }

  const body = await req.json().catch(() => ({}));
  const { title, price } = body || {};
  const newItem: Property = {
    id: String(Date.now()),
    title: title || "Untitled",
    price,
  };
  store.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}
