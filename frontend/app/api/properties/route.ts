import { NextResponse } from "next/server";

type Property = { id: string; title: string; price?: number };

// Very small in-memory store for demo purposes
const store: Property[] = [];

export async function GET() {
  const backend = process.env.BACKEND_URL;
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/properties`);
      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();

      // Prefer to return parsed JSON to the client so we don't forward raw
      // backend headers (which may contain relative Location values that
      // break the RSC parser). If the backend responded with JSON, parse
      // and return it safely. Otherwise return the raw text body.
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
      // Return a safe error response so RSC doesn't throw a parse error
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }
  return NextResponse.json(store);
}

export async function POST(req: Request) {
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
