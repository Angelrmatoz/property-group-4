import axios from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || undefined,
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
      const res = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        const token = (j as any).csrfToken;
        if (token) {
          config.headers = config.headers || {};
          (config.headers as any)["X-CSRF-Token"] = token;
          // DEV debug: log that we attached a csrf token (do not log token value)
          try {
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.debug(
                "[axios] attached X-CSRF-Token header for mutating request"
              );
            }
          } catch {}
        }
      }
    } catch {
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
      const r = await fetch("/api/login", { credentials: "include" });
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
