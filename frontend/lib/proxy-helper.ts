import { NextResponse } from "next/server";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

/**
 * Helper function to proxy requests to the backend using fetch
 * Handles cookie forwarding and header management
 * Includes retry logic for backend cold starts (Render free tier)
 */

// Simple Set-Cookie parser that returns name, value and options suitable
// for NextResponse.cookies.set(). It handles common attributes: Path, Expires,
// Max-Age, HttpOnly, Secure, SameSite.
export function parseSetCookie(sc: string) {
  const parts = sc.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eq = nameValue.indexOf("=");
  if (eq === -1) return null;
  const name = nameValue.slice(0, eq);
  const value = nameValue.slice(eq + 1);

  const options: Record<string, any> = {};

  for (const a of attrs) {
    const [kRaw, vRaw] = a.split("=");
    const k = kRaw?.trim()?.toLowerCase();
    const v = vRaw ? vRaw.trim() : true;
    if (!k) continue;
    if (k === "path") options.path = v as string;
    else if (k === "expires") options.expires = new Date(v as string);
    else if (k === "max-age") options.maxAge = parseInt(v as string, 10);
    else if (k === "httponly") options.httpOnly = true;
    else if (k === "secure") {
      // Only set secure in production so local http dev servers can accept the cookie
      if (process.env.NODE_ENV === "production") options.secure = true;
    } else if (k === "samesite") {
      const s = String(v).toLowerCase();
      if (s === "lax" || s === "strict" || s === "none")
        options.sameSite = s as any;
    }
  }

  return { name, value, options };
}
export async function proxyToBackend(
  url: string,
  options: RequestInit = {},
  incomingCookies?: ReadonlyRequestCookies | Record<string, string>,
  retries: number = 2
): Promise<NextResponse> {
  // lastError removed; we don't log internal errors to avoid noisy output

  // Retry loop for backend cold starts
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Prepare headers
      const headers = new Headers(options.headers);

      // Remove any upstream IP forwarding headers to avoid confusing
      // backend rate-limit / trust-proxy validations (Express warns when
      // X-Forwarded-For is present but trust proxy is false).
      // Also strip common related headers.
      const hopHeadersToStrip = [
        "x-forwarded-for",
        "forwarded",
        "x-real-ip",
        "x-forwarded-host",
        "x-forwarded-proto",
      ];

      const stripped: string[] = [];
      for (const h of hopHeadersToStrip) {
        if (headers.has(h)) {
          headers.delete(h);
          stripped.push(h);
        }
      }

      // In development we may strip upstream headers; not logged to avoid noisy output

      // Forward cookies from incoming request if provided
      if (incomingCookies) {
        let cookiePairs: string[] = [];

        // Check if it's ReadonlyRequestCookies (has getAll method)
        if (
          "getAll" in incomingCookies &&
          typeof incomingCookies.getAll === "function"
        ) {
          cookiePairs = incomingCookies
            .getAll()
            .map((c) => `${c.name}=${c.value}`);
        } else {
          // It's a Record<string, string>
          cookiePairs = Object.entries(
            incomingCookies as Record<string, string>
          ).map(([name, value]) => `${name}=${value}`);
        }

        if (cookiePairs.length > 0) {
          headers.set("Cookie", cookiePairs.join("; "));
        }
      }

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Extract headers to forward
      const forwarded: Record<string, string> = {};
      const setCookies: string[] = [];

      res.headers.forEach((value, key) => {
        const k = key.toLowerCase();
        if (k === "set-cookie") {
          setCookies.push(value);
          return;
        }
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

      // Handle JSON responses
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          const json = await res.json();
          const nextRes = NextResponse.json(json, {
            status: res.status,
            headers: forwarded,
          });

          // Forward set-cookie headers (preserve attributes)
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
            } catch {}
          }

          return nextRes;
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON from backend" },
            { status: 502 }
          );
        }
      }

      // Handle non-JSON responses
      // For 204/205 (No Content / Reset Content) responses the body MUST be empty
      // and creating a Response with a body for those statuses throws in the runtime.
      if (res.status === 204 || res.status === 205) {
        const nextRes = new NextResponse(null, {
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
          } catch {}
        }

        return nextRes;
      }

      const text = await res.text();
      const nextRes = new NextResponse(text, {
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
        } catch {}
      }

      return nextRes;
    } catch {
      // lastError is not declared; handle error appropriately

      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  // All attempts exhausted; return 502 to the client
  return NextResponse.json(
    {
      error: "Backend unavailable",
      message:
        "El servidor está iniciando. Por favor, intenta de nuevo en unos segundos.",
    },
    { status: 502 }
  );
}
