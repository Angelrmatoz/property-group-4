"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admin?: boolean;
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params as any)?.id as string | undefined;
  const [user, setUser] = useState<User | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!id || id === "undefined") {
          // Defensive: Next sometimes gives 'undefined' as a param during
          // client navigation/hydration; treat that as missing and avoid
          // issuing requests which would hit /api/users/undefined.
          console.warn("UserDetailPage: missing or 'undefined' id param", id);
          setUser(null);
          return;
        }
        const usersService = await import("@/services/users");
        const auth = await import("@/services/auth");

        // Try to fetch the single user (if service exposes getUser)
        let u: any = null;
        if (usersService.getUserById) {
          u = await usersService.getUserById(id);
        } else {
          // fallback: list and find
          const list = await usersService.listUsers();
          u =
            (list || []).find((x: any) => x.id === id || x._id === id) || null;
        }

        const meResp = await auth.me();
        if (!mounted) return;

        setUser(u);
        setMeId(meResp.user?.id || null);
        setIsAdmin(Boolean(meResp.user?.admin));
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      if (!id) return;
      const usersService = await import("@/services/users");
      const res = await usersService.deleteUser(id);
      if (res.status >= 200 && res.status < 300) {
        // go back to users list
        router.push("/dashboard/users");
      } else {
        alert("Error borrando usuario (status: " + res.status + ")");
      }
    } catch (err) {
      console.error(err);
      alert("Error al borrar usuario");
    }
  }

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  return (
    <section>
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="px-3 py-1 border border-gray-200 rounded text-sm"
        >
          ← Volver
        </button>
      </div>

      <Card>
        <CardContent>
          <div className="mb-2">
            <h3 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {user.admin ? (
                <Badge variant="secondary">Admin</Badge>
              ) : (
                <Badge variant="outline">Usuario</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-xs text-muted-foreground">Nombre</div>
              <div className="font-medium">{user.firstName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Apellido</div>
              <div className="font-medium">{user.lastName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href="/dashboard/users"
              className="px-3 py-1 border border-gray-200 rounded text-sm"
            >
              Lista
            </Link>
            {isAdmin && meId !== user.id && (
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
