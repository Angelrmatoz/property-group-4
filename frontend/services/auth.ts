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
  password: string
): Promise<LoginResult> {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
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
    // Get JWT token from sessionStorage
    const jwtToken = sessionStorage.getItem("authToken");
    if (!jwtToken) {
      return { ok: false };
    }

    const res = await fetch(`/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!res.ok) {
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
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export async function logout() {
  // If you implement a server logout route, call it here. For now clear client cookie as fallback.
  try {
    // expire cookie (best-effort; httpOnly cookie can't be removed from client JS)
    document.cookie = "token=; Path=/; Max-Age=0; Secure";
    // Also clear sessionStorage token
    sessionStorage.removeItem("authToken");
  } catch {}
}

export default { login, me, register, logout };
