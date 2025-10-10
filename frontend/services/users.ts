import api from "@/lib/axios";

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  admin?: boolean;
};

export async function listUsers() {
  const res = await api.get("/api/users");
  return res.data;
}

export async function getUserById(id: string) {
  // Defensive: if id is falsy or the literal string 'undefined', return null
  // This prevents requests to /api/users/undefined when callers accidentally
  // interpolate an undefined value into a URL.
  if (!id || id === "undefined") {
    console.warn(
      "getUserById called with empty or 'undefined' id, returning null"
    );
    return null;
  }

  try {
    // Prefer direct endpoint if available
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  } catch (err: any) {
    // If the backend responds with an auth/permission error, return a
    // structured object so callers can show an appropriate message.
    console.error("getUserById direct fetch error:", err?.message || err);
    const status = err?.response?.status || err?.status;
    if (status === 401 || status === 403) {
      return {
        __error: true,
        status,
        message: err?.response?.data || err?.message,
      };
    }
    // If direct fetch fails (404 or not implemented), fallback to listing
    try {
      const list = await listUsers();
      if (!list || !Array.isArray(list)) return null;
      return list.find((u: any) => u.id === id || u._id === id) || null;
    } catch (err2: any) {
      console.error("getUserById fallback error:", err2?.message || err2);
      return null;
    }
  }
}

export async function createUser(payload: CreateUserPayload) {
  try {
    const res = await api.post("/api/users", payload);
    return { status: res.status, data: res.data };
  } catch (err: any) {
    return {
      status: err?.status || 500,
      data: err?.data || { message: err?.message },
    };
  }
}

export async function deleteUser(id: string) {
  try {
    const res = await api.delete(`/api/users/${id}`);
    return { status: res.status, data: res.data };
  } catch (err: any) {
    return {
      status: err?.status || 500,
      data: err?.data || { message: err?.message },
    };
  }
}

export default { listUsers, getUserById, createUser, deleteUser };
