import axios from "axios";

// For client-side requests, leave baseURL undefined so axios calls are relative
// to the frontend origin (e.g., http://localhost:3000). The frontend proxy routes
// in app/api/* will forward requests to the backend configured via BACKEND_URL.
// If you want the client to call the backend directly, set NEXT_PUBLIC_API_URL
// in the frontend environment and uncomment the line below.
const api = axios.create({
  baseURL: undefined, // relative URLs → calls frontend proxy
  // baseURL: process.env.NEXT_PUBLIC_API_URL || undefined, // uncomment to call backend directly
  timeout: 15000,
  withCredentials: true, // include cookies so requests to /api/* carry httpOnly cookies (csurf/token)
});

// Basic response interceptor to normalize errors if needed
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Build a richer, consistent error object so callers can inspect status/data
    const errorInfo = {
      message: err?.message ?? "",
      name: err?.name ?? "",
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      config: err?.config,
    };
    // If the backend returns 401/403, broadcast logout so other tabs can
    // react immediately and navigate to login. We attempt to clear client
    // state here as well.
    const status = errorInfo.status;
    if (status === 401 || status === 403) {
      try {
        // Broadcast via localStorage (fallback) so other tabs can listen
        localStorage.setItem("pg:auth:logout", String(Date.now()));
      } catch {}
      try {
        // best-effort: expire client cookie (httpOnly cookie cannot be removed reliably)
        document.cookie = "token=; Path=/; Max-Age=0; Secure";
      } catch {}
    }
    return Promise.reject(errorInfo);
  }
);

// For mutating requests, ensure the X-CSRF-Token header is present by
// requesting it from the frontend proxy. This endpoint will in turn ask the
// backend and forward the csurf secret cookie so the token pairs correctly.
api.interceptors.request.use(async (config) => {
  const method = (config.method || "").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    try {
      // Use native fetch (not axios) to avoid baseURL issues and interceptor loops.
      // This call goes to the frontend proxy at /api/csrf-token.
      const res = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const token = data.csrfToken;
        if (token) {
          config.headers = config.headers || {};
          (config.headers as any)["X-CSRF-Token"] = token;
          (config.headers as any)["x-csrf-token"] = token; // also set lowercase version
          // DEV debug: log that we attached a csrf token
          try {
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.log(
                "[axios interceptor] Successfully attached X-CSRF-Token header. Token starts with:",
                token.substring(0, 10) + "..."
              );
              console.log("[axios interceptor] Request URL:", config.url);
              console.log("[axios interceptor] Request method:", config.method);
            }
          } catch {}
        } else {
          console.error(
            "[axios interceptor] CSRF token is missing in response data:",
            data
          );
        }
      } else {
        console.error(
          "[axios interceptor] Failed to fetch CSRF token. Status:",
          res.status
        );
      }
    } catch (err) {
      // Log error in dev for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("[axios] Failed to fetch CSRF token:", err);
      }
      // ignore; the request may still proceed and the backend will respond 403 if necessary
    }
  }
  return config;
});

export default api;

// Optional helper: start a background heartbeat that periodically calls
// /api/login (me) to check token validity. If the call returns non-ok the
// helper will broadcast a logout and redirect. Return a stop() function.
export function startAuthHeartbeat(intervalMs = 30_000) {
  let stopped = false;
  async function tick() {
    if (stopped) return;
    try {
      // Use native fetch to avoid axios configuration issues
      const r = await fetch("/api/login", {
        credentials: "include",
      });
      if (!r.ok) {
        // token expired or invalid
        try {
          localStorage.setItem("pg:auth:logout", String(Date.now()));
        } catch {}
        try {
          document.cookie = "token=; Path=/; Max-Age=0; Secure";
        } catch {}
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
    } catch {
      // ignore network blips
    }
    setTimeout(tick, intervalMs);
  }
  setTimeout(tick, intervalMs);
  return () => {
    stopped = true;
  };
}
