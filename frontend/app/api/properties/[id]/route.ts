import { NextResponse } from "next/server";

type Property = { id: string; title: string; price?: number };

// Reference the same simple in-memory store as route.ts (note: in dev this lives per server instance)
const store: Property[] = [];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const backend = process.env.BACKEND_URL;
  // await params in case it's a Promise-like object provided by Next
  const { id } = (await params) as { id: string };
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/properties/${id}`);
      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();

      if (contentType.includes("application/json")) {
        try {
          const json = JSON.parse(text);
          return NextResponse.json(json, { status: res.status });
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON from backend" },
            { status: 502 }
          );
        }
      }

      return new NextResponse(text, { status: res.status });
    } catch {
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }
  const item = store.find((s) => s.id === id);
  if (!item)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const { id } = (await params) as { id: string };
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store[idx] = { ...store[idx], ...body };
  return NextResponse.json(store[idx]);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = (await params) as { id: string };
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
