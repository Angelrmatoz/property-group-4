import { getAuthToken, clearAuthToken } from "@/lib/token-storage";

export type LoginResult = {
  ok: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    admin?: boolean;
  };
  token?: string;
  message?: string;
};

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<LoginResult> {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        return {
          ok: false,
          message: "Usuario o contraseña incorrecto",
        };
      }
      return {
        ok: false,
        message: data?.message || "Login failed",
      };
    }

    return { ok: true, ...data } as LoginResult;
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || "Login failed",
    };
  }
}

export async function me(): Promise<LoginResult> {
  try {
    // Get JWT token from localStorage with expiration check
    const jwtToken = getAuthToken();
    if (!jwtToken) {
      return { ok: false };
    }

    const res = await fetch(`/api/login`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!res.ok) {
      // If backend says token is invalid, clear it locally too
      clearAuthToken();
      return { ok: false };
    }

    const data = await res.json();
    const result = { ok: true, ...data } as LoginResult;
    return result;
  } catch {
    return { ok: false };
  }
}

export async function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  // Get JWT token from localStorage for admin operations
  const jwtToken = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  const res = await fetch("/api/users", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export async function logout() {
  // Clear auth token from localStorage
  clearAuthToken();
}

export default { login, me, register, logout };
