/**
 * Custom fetch wrapper that automatically handles CSRF tokens for mutating requests
 */

// CSRF token logic removed: this project no longer uses a separate
// /api/csrf-token endpoint or the x-csrf-token header. Keeping the
// apiFetch wrapper simple: it will only add Authorization and handle
// JSON parsing/errors.

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
  const { throwOnError = true, ...fetchOptions } = options;

  // Always include credentials
  fetchOptions.credentials = fetchOptions.credentials || "include";

  // Initialize headers
  const headers = new Headers(fetchOptions.headers);

  // Add JWT Authorization header for all requests
  const jwtToken = getAuthToken(); // Automatically checks expiration
  if (jwtToken) {
    headers.set("Authorization", `Bearer ${jwtToken}`);
  }

  // No CSRF header handling anymore. Mutating requests will proceed
  // with credentials included and Authorization header when present.

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

    // No CSRF retry logic: the app no longer uses a separate CSRF token
    // endpoint. If the server returns 403 for other reasons, surface it
    // as an error below.

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

import {
  getAuthToken,
  clearAuthToken,
  handleTokenExpiration,
} from "./token-storage";

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
        // No valid token (expired or missing), handle based on remember preference
        handleTokenExpiration();
        return;
      }

      const res = await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) {
        // Token invalid on server, clear locally and handle expiration
        clearAuthToken();
        handleTokenExpiration();
      }
    } catch {
      // ignore network errors
    }
  }, intervalMs);

  return () => clearInterval(timer);
}

export default api;
