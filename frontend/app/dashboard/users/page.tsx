"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admin?: boolean;
};

export default function UsersListPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // fetch current user and user list via axios services
        const meResp = await import("@/services/auth").then((m) => m.me());
        if (mounted && meResp.ok) setMeId(meResp.user?.id || null);

        const list = await import("@/services/users").then((m) =>
          m.listUsers()
        );
        if (!mounted) return;
        setUsers(list || []);
      } catch (err) {
        console.error(err);
        if (mounted) setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      const { status } = await import("@/services/users").then((m) =>
        m.deleteUser(id)
      );
      if (status >= 200 && status < 300) {
        setUsers((prev) => (prev ? prev.filter((u) => u.id !== id) : prev));
      } else {
        alert("Error borrando usuario (status: " + status + ")");
      }
    } catch (err) {
      console.error(err);
      alert("Error al borrar usuario");
    }
  }

  return (
    <section className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
      </div>

      <div className="grid gap-4 w-full">
        {loading && <p>Cargando usuarios...</p>}

        {!loading && users && users.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-600 mt-5">
                No hay usuarios aún. Usa el botón crear para añadir usuarios.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && users && users.length > 0 && (
          <div className="space-y-3">
            {users.map((u, idx) => (
              <Card key={u.id ?? u.email ?? idx} className="w-full">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
                  <div className="min-w-0 w-full sm:w-auto flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base leading-tight">
                        {u.firstName} {u.lastName}
                      </h3>
                      {u.admin && (
                        <span className="inline-flex items-center text-xs font-medium text-amber-600 px-2 py-0.5 rounded border border-amber-200">
                          admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 break-all">
                      {u.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    {u.id ? (
                      <Link
                        href={`/dashboard/users/${u.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50"
                        aria-label={`Ver usuario ${u.firstName} ${u.lastName}`}
                      >
                        ver
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">ver</span>
                    )}
                    {meId !== u.id && (
                      <button
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        onClick={() => handleDelete(u.id)}
                      >
                        borrar
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
