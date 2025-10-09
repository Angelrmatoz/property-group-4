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
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Login failed" }));
    return { ok: false, message: data.message || "Login failed" };
  }

  // Try to parse JSON body if any
  const data = await res.json().catch(() => ({}));
  return { ok: true, ...data } as LoginResult;
}

export async function me(): Promise<LoginResult> {
  const res = await fetch("/api/login", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) return { ok: false };
  const data = await res.json().catch(() => ({}));
  return { ok: true, ...data } as LoginResult;
}

export async function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/register", {
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
  } catch {}
}

export default { login, me, register, logout };
