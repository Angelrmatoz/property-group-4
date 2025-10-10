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

import api from "@/lib/axios";

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const res = await api.post("/api/login", { email, password });
    return { ok: true, ...res.data } as LoginResult;
  } catch (err: any) {
    return {
      ok: false,
      message: err?.data?.message || err?.message || "Login failed",
    };
  }
}

export async function me(): Promise<LoginResult> {
  try {
    const res = await api.get("/api/login", { params: { _: Date.now() } });
    return { ok: true, ...res.data } as LoginResult;
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
  } catch {}
}

export default { login, me, register, logout };
