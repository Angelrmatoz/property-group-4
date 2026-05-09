import {
  storeAuthToken,
  getAuthToken,
  clearAuthToken,
  hasValidAuthToken,
  getTokenTimeRemaining,
  isTokenExpiringSoon,
  isRememberMeEnabled,
  handleTokenExpiration,
} from "@/lib/token-storage";

function setStorageItems(storage: Storage, items: Record<string, string>) {
  storage.clear();
  Object.entries(items).forEach(([k, v]) => storage.setItem(k, v));
}

describe("token-storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("storeAuthToken", () => {
    it("stores token in sessionStorage when rememberMe is false", () => {
      storeAuthToken("abc123", false, 1);
      expect(sessionStorage.getItem("authToken")).toBe("abc123");
      expect(localStorage.getItem("authToken")).toBeNull();
    });

    it("stores token in localStorage when rememberMe is true", () => {
      storeAuthToken("abc123", true, 12);
      expect(localStorage.getItem("authToken")).toBe("abc123");
      expect(sessionStorage.getItem("authToken")).toBeNull();
    });

    it("clears the other storage when switching remember preference", () => {
      storeAuthToken("token1", false);
      storeAuthToken("token2", true);
      expect(sessionStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("authToken")).toBe("token2");
    });

    it("stores remember preference in localStorage", () => {
      storeAuthToken("tok", false);
      expect(localStorage.getItem("rememberMe")).toBe("false");
      storeAuthToken("tok", true);
      expect(localStorage.getItem("rememberMe")).toBe("true");
    });

    it("sets expiry time correctly", () => {
      const now = Date.now();
      storeAuthToken("tok", false, 1);
      const expiry = parseInt(sessionStorage.getItem("authTokenExpiry")!, 10);
      expect(expiry).toBeGreaterThanOrEqual(now);
      expect(expiry).toBeLessThanOrEqual(now + 1 * 60 * 60 * 1000 + 1000);
    });
  });

  describe("getAuthToken", () => {
    it("returns null when no token exists", () => {
      expect(getAuthToken()).toBeNull();
    });

    it("returns null when token is expired", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authToken", "expired");
      localStorage.setItem("authTokenExpiry", String(Date.now() - 1000));
      expect(getAuthToken()).toBeNull();
    });

    it("returns token from localStorage when rememberMe is true", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authToken", "local-token");
      localStorage.setItem("authTokenExpiry", String(Date.now() + 3600000));
      expect(getAuthToken()).toBe("local-token");
    });

    it("returns token from sessionStorage when rememberMe is false", () => {
      localStorage.setItem("rememberMe", "false");
      sessionStorage.setItem("authToken", "session-token");
      sessionStorage.setItem("authTokenExpiry", String(Date.now() + 3600000));
      expect(getAuthToken()).toBe("session-token");
    });

    it("clears expired token from storage", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authToken", "expired");
      localStorage.setItem("authTokenExpiry", String(Date.now() - 1000));
      getAuthToken();
      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });

  describe("clearAuthToken", () => {
    it("clears all token-related items from both storages", () => {
      localStorage.setItem("authToken", "l");
      localStorage.setItem("authTokenExpiry", "0");
      localStorage.setItem("rememberMe", "true");
      sessionStorage.setItem("authToken", "s");
      sessionStorage.setItem("authTokenExpiry", "0");
      clearAuthToken();
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("authTokenExpiry")).toBeNull();
      expect(localStorage.getItem("rememberMe")).toBeNull();
      expect(sessionStorage.getItem("authToken")).toBeNull();
      expect(sessionStorage.getItem("authTokenExpiry")).toBeNull();
    });
  });

  describe("hasValidAuthToken", () => {
    it("returns false when no token", () => {
      expect(hasValidAuthToken()).toBe(false);
    });

    it("returns true when valid token exists", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authToken", "valid-token");
      localStorage.setItem("authTokenExpiry", String(Date.now() + 3600000));
      expect(hasValidAuthToken()).toBe(true);
    });
  });

  describe("getTokenTimeRemaining", () => {
    it("returns remaining milliseconds until expiry", () => {
      const now = Date.now();
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authTokenExpiry", String(now + 5000));
      const remaining = getTokenTimeRemaining();
      expect(remaining).toBeGreaterThanOrEqual(4000);
      expect(remaining).toBeLessThanOrEqual(5000);
    });

    it("returns 0 when no expiry set", () => {
      localStorage.setItem("rememberMe", "true");
      expect(getTokenTimeRemaining()).toBe(0);
    });

    it("returns 0 when expired", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authTokenExpiry", String(Date.now() - 1000));
      expect(getTokenTimeRemaining()).toBe(0);
    });
  });

  describe("isTokenExpiringSoon", () => {
    it("returns true when token expires within threshold", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authTokenExpiry", String(Date.now() + 60000));
      expect(isTokenExpiringSoon(30)).toBe(true);
    });

    it("returns false when token has plenty of time", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authTokenExpiry", String(Date.now() + 3600000));
      expect(isTokenExpiringSoon(30)).toBe(false);
    });

    it("returns false when expired", () => {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("authTokenExpiry", String(Date.now() - 1000));
      expect(isTokenExpiringSoon(30)).toBe(false);
    });
  });

  describe("isRememberMeEnabled", () => {
    it("returns true when rememberMe is 'true'", () => {
      localStorage.setItem("rememberMe", "true");
      expect(isRememberMeEnabled()).toBe(true);
    });

    it("returns false when rememberMe is 'false'", () => {
      localStorage.setItem("rememberMe", "false");
      expect(isRememberMeEnabled()).toBe(false);
    });

    it("returns false when no preference set", () => {
      expect(isRememberMeEnabled()).toBe(false);
    });
  });

  describe("handleTokenExpiration", () => {
    it("broadcasts logout event when rememberMe is true", () => {
      const setItem = jest.spyOn(Storage.prototype, "setItem");
      localStorage.setItem("rememberMe", "true");
      handleTokenExpiration();
      expect(setItem).toHaveBeenCalledWith("pg:auth:logout", expect.any(String));
    });
  });
});
