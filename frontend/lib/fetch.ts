/**
 * Custom fetch wrapper that automatically handles CSRF tokens for mutating requests
 */

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  try {
    const res = await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      return "";
    }

    const data = await res.json();
    const token = data.csrfToken || "";

    if (token) {
      csrfToken = token;
    }

    return token;
  } catch {
    return "";
  }
}

async function getCsrfToken(): Promise<string> {
  // If we already have a token, return it
  if (csrfToken) return csrfToken;

  // If a fetch is already in progress, wait for it
  if (csrfTokenPromise) return csrfTokenPromise;

  // Start fetching the token
  csrfTokenPromise = fetchCsrfToken();
  const token = await csrfTokenPromise;
  csrfTokenPromise = null;

  return token;
}

interface FetchOptions extends RequestInit {
  // Allow custom error handling
  throwOnError?: boolean;
}

/**
 * Enhanced fetch that automatically:
 * - Includes credentials
 * - Attaches CSRF token for mutating requests (POST, PUT, PATCH, DELETE)
 * - Handles JSON responses
 * - Provides axios-like error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T; status: number; ok: boolean }> {
  const { throwOnError = true, ...fetchOptions } = options;

  // Always include credentials
  fetchOptions.credentials = fetchOptions.credentials || "include";

  // Initialize headers
  const headers = new Headers(fetchOptions.headers);

  // For mutating requests, fetch and attach CSRF token
  const method = (fetchOptions.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      // Use a single canonical header name (lowercase) to avoid duplicate
      // comma-separated values when proxies forward both forms.
      headers.set("x-csrf-token", token);
    }
  }

  // Set Content-Type for JSON if body is an object (not FormData)
  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  fetchOptions.headers = headers;

  try {
    const response = await fetch(url, fetchOptions);

    // Try to parse JSON response
    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // If response is not ok and throwOnError is true, throw an error
    if (!response.ok && throwOnError) {
      const error: any = new Error(
        data?.message || `HTTP Error: ${response.status}`
      );
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = data;
      error.response = { status: response.status, data };
      throw error;
    }

    return {
      data,
      status: response.status,
      ok: response.ok,
    };
  } catch (err: any) {
    // If it's already our custom error, rethrow it
    if (err.response) throw err;

    // Otherwise, wrap network errors
    const error: any = new Error(err.message || "Network error");
    error.status = 0;
    error.data = null;
    error.response = { status: 0, data: null };
    throw error;
  }
}

// Convenience methods that mirror axios API
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, body?: any, options?: FetchOptions) => {
    const opts: FetchOptions = { ...options, method: "POST" };
    if (body instanceof FormData) {
      opts.body = body;
    } else if (body) {
      opts.body = JSON.stringify(body);
    }
    return apiFetch<T>(url, opts);
  },

  put: <T = any>(url: string, body?: any, options?: FetchOptions) => {
    const opts: FetchOptions = { ...options, method: "PUT" };
    if (body instanceof FormData) {
      opts.body = body;
    } else if (body) {
      opts.body = JSON.stringify(body);
    }
    return apiFetch<T>(url, opts);
  },

  patch: <T = any>(url: string, body?: any, options?: FetchOptions) => {
    const opts: FetchOptions = { ...options, method: "PATCH" };
    if (body instanceof FormData) {
      opts.body = body;
    } else if (body) {
      opts.body = JSON.stringify(body);
    }
    return apiFetch<T>(url, opts);
  },

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: "DELETE" }),
};

/**
 * Heartbeat function to periodically check auth status
 * Returns a cleanup function to stop the heartbeat
 */
export function startAuthHeartbeat(intervalMs = 30_000) {
  // Use native fetch to avoid configuration issues
  const timer = setInterval(async () => {
    try {
      const res = await fetch("/api/login", { credentials: "include" });
      if (!res.ok) {
        // broadcast logout event for cross-tab detection
        try {
          localStorage.setItem("pg:auth:logout", String(Date.now()));
        } catch {}
      }
    } catch {
      // ignore network errors
    }
  }, intervalMs);

  return () => clearInterval(timer);
}

export default api;
