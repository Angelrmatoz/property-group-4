/**
 * Token storage utility with automatic expiration handling
 * Uses localStorage for persistence across browser sessions
 */

const TOKEN_KEY = "authToken";
const EXPIRY_KEY = "authTokenExpiry";

export interface TokenData {
  token: string;
  expiresAt: number;
}

/**
 * Store auth token with expiration
 * @param token JWT token
 * @param hoursToExpire Number of hours until token expires (default: 12)
 */
export function storeAuthToken(
  token: string,
  hoursToExpire: number = 12
): void {
  const expiresAt = Date.now() + hoursToExpire * 60 * 60 * 1000;

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
  } catch (error) {
    console.warn("Failed to store auth token:", error);
  }
}

/**
 * Get auth token if it exists and hasn't expired
 * @returns token string or null if expired/missing
 */
export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiryStr = localStorage.getItem(EXPIRY_KEY);

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
 * Clear auth token and expiry from storage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
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
    const expiryStr = localStorage.getItem(EXPIRY_KEY);
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

export default {
  store: storeAuthToken,
  get: getAuthToken,
  hasValid: hasValidAuthToken,
  clear: clearAuthToken,
  timeRemaining: getTokenTimeRemaining,
  expiringSoon: isTokenExpiringSoon,
};
