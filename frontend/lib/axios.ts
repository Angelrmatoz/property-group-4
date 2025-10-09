import axios from "axios";

// Use relative baseURL so services call the frontend proxy (e.g. /api/..)
const api = axios.create({
  baseURL: undefined,
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
        }
      }
    } catch {
      // ignore; the request may still proceed and the backend will respond 403 if necessary
    }
  }
  return config;
});

export default api;
