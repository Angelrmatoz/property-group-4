/**
 * Token storage utility with automatic expiration handling
 * Supports both localStorage (persistent) and sessionStorage (session-only)
 */

const TOKEN_KEY = "authToken";
const EXPIRY_KEY = "authTokenExpiry";
const REMEMBER_KEY = "rememberMe";

export interface TokenData {
  token: string;
  expiresAt: number;
}

/**
 * Store auth token with expiration and remember preference
 * @param token JWT token
 * @param rememberMe If true, uses localStorage (persistent). If false, uses sessionStorage (session-only)
 * @param hoursToExpire Number of hours until token expires (default: 12 for remember, 1 for session-only)
 */
export function storeAuthToken(
  token: string,
  rememberMe: boolean = false,
  hoursToExpire?: number
): void {
  // If no specific hours provided, use 12h for persistent, 1h for session-only
  const defaultHours = rememberMe ? 12 : 1;
  const hours = hoursToExpire ?? defaultHours;
  const expiresAt = Date.now() + hours * 60 * 60 * 1000;

  const storage = rememberMe ? localStorage : sessionStorage;

  try {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(EXPIRY_KEY, expiresAt.toString());
    // Store remember preference in localStorage to know which storage to check
    localStorage.setItem(REMEMBER_KEY, rememberMe.toString());
  } catch (error) {
    console.warn("Failed to store auth token:", error);
  }
}

/**
 * Get auth token if it exists and hasn't expired
 * Checks both localStorage and sessionStorage based on remember preference
 * @returns token string or null if expired/missing
 */
export function getAuthToken(): string | null {
  try {
    // Check remember preference to know which storage to use
    const rememberMe = localStorage.getItem(REMEMBER_KEY) === "true";
    const storage = rememberMe ? localStorage : sessionStorage;

    const token = storage.getItem(TOKEN_KEY);
    const expiryStr = storage.getItem(EXPIRY_KEY);

    if (!token || !expiryStr) {
      return null;
    }

    const expiresAt = parseInt(expiryStr, 10);
    const now = Date.now();

    // Check if token is expired
    if (now >= expiresAt) {
      // Token expired, clean up
      clearAuthToken();
      return null;
    }

    return token;
  } catch (error) {
    console.warn("Failed to get auth token:", error);
    return null;
  }
}

/**
 * Check if auth token exists and is valid (not expired)
 */
export function hasValidAuthToken(): boolean {
  return getAuthToken() !== null;
}

/**
 * Clear auth token and expiry from both storages
 */
export function clearAuthToken(): void {
  try {
    // Clear from both storages to be safe
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(REMEMBER_KEY);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
  } catch (error) {
    console.warn("Failed to clear auth token:", error);
  }
}

/**
 * Get remaining time until token expires (in milliseconds)
 * @returns milliseconds until expiration, or 0 if expired/missing
 */
export function getTokenTimeRemaining(): number {
  try {
    // Check remember preference to know which storage to use
    const rememberMe = localStorage.getItem(REMEMBER_KEY) === "true";
    const storage = rememberMe ? localStorage : sessionStorage;

    const expiryStr = storage.getItem(EXPIRY_KEY);
    if (!expiryStr) return 0;

    const expiresAt = parseInt(expiryStr, 10);
    const remaining = expiresAt - Date.now();

    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

/**
 * Check if token expires within the specified minutes
 * @param minutes Minutes to check ahead
 */
export function isTokenExpiringSoon(minutes: number = 30): boolean {
  const remaining = getTokenTimeRemaining();
  const threshold = minutes * 60 * 1000; // Convert to milliseconds

  return remaining > 0 && remaining <= threshold;
}

/**
 * Check if the current session is using "Remember Me"
 * @returns true if using persistent storage (localStorage), false if session-only
 */
export function isRememberMeEnabled(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Handle token expiration based on remember me preference
 * For session-only: reloads the page
 * For persistent: triggers logout broadcast
 */
export function handleTokenExpiration(): void {
  const rememberMe = isRememberMeEnabled();

  if (!rememberMe && typeof window !== "undefined") {
    // For session-only, reload the page immediately
    window.location.reload();
  } else {
    // For persistent sessions, broadcast logout for cross-tab sync
    try {
      localStorage.setItem("pg:auth:logout", String(Date.now()));
    } catch {}
  }
}

export default {
  store: storeAuthToken,
  get: getAuthToken,
  hasValid: hasValidAuthToken,
  clear: clearAuthToken,
  timeRemaining: getTokenTimeRemaining,
  expiringSoon: isTokenExpiringSoon,
  isRememberMe: isRememberMeEnabled,
  handleExpiration: handleTokenExpiration,
};
