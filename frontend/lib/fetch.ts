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

async function getCsrfToken(forceRefresh = false): Promise<string> {
  // If force refresh is requested, clear the cached token
  if (forceRefresh) {
    csrfToken = null;
    csrfTokenPromise = null;
  }

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

/**
 * Invalidate the cached CSRF token, forcing a refresh on next request
 */
export function invalidateCsrfToken(): void {
  csrfToken = null;
  csrfTokenPromise = null;
}

interface FetchOptions extends RequestInit {
  // Allow custom error handling
  throwOnError?: boolean;
  // Force refresh CSRF token before this request
  refreshCsrf?: boolean;
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
  const { throwOnError = true, refreshCsrf = false, ...fetchOptions } = options;

  // Always include credentials
  fetchOptions.credentials = fetchOptions.credentials || "include";

  // Initialize headers
  const headers = new Headers(fetchOptions.headers);

  // For mutating requests, fetch and attach CSRF token
  const method = (fetchOptions.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const token = await getCsrfToken(refreshCsrf);
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

    // If we get a 403 CSRF error and haven't already retried with fresh token, retry once
    if (
      response.status === 403 &&
      !refreshCsrf &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
      (data?.error?.includes("csrf") ||
        data?.error?.includes("CSRF") ||
        data?.message?.includes("csrf"))
    ) {
      // Invalidate token and retry once with fresh token
      invalidateCsrfToken();
      return apiFetch<T>(url, { ...options, refreshCsrf: true });
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

import { getAuthToken, clearAuthToken } from "./token-storage";

/**
 * Heartbeat function to periodically check auth status
 * Returns a cleanup function to stop the heartbeat
 */
export function startAuthHeartbeat(intervalMs = 30_000) {
  // Use native fetch to avoid configuration issues
  const timer = setInterval(async () => {
    try {
      const jwtToken = getAuthToken(); // Automatically checks expiration
      if (!jwtToken) {
        // No valid token (expired or missing), broadcast logout
        try {
          localStorage.setItem("pg:auth:logout", String(Date.now()));
        } catch {}
        return;
      }

      const res = await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) {
        // Token invalid on server, clear locally and broadcast logout
        clearAuthToken();
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
