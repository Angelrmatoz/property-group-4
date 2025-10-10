"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import usersService from "@/services/users";
import { useNotification } from "@/components/Notification";

export default function CreateUserPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { status, data } = await usersService.createUser({
        firstName,
        lastName,
        email,
        password,
        admin,
      });
      setLoading(false);
      if (status >= 200 && status < 300) {
        notify({
          type: "success",
          title: "Usuario creado",
          message: "El usuario ha sido creado exitosamente",
          duration: 3000,
        });
        router.push("/dashboard/users");
      } else {
        const errorMsg = (data as any)?.error || JSON.stringify(data);
        notify({
          type: "error",
          title: "Error al crear usuario",
          message: errorMsg,
          duration: 4000,
        });
      }
    } catch (err) {
      setLoading(false);
      const errorMsg =
        (err as any)?.response?.data?.error ||
        (err as any)?.message ||
        "Error al crear el usuario";
      notify({
        type: "error",
        title: "Error al crear usuario",
        message: errorMsg,
        duration: 4000,
      });
      console.error(err);
    }
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-2xl font-semibold">Crear usuario</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-background text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Apellido</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-background text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-background text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-background text-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Administrador</label>
          <div className="flex items-center gap-3">
            <label
              className={`inline-flex items-center gap-2 cursor-pointer rounded px-3 py-1 ${
                admin ? "bg-amber-600 text-white" : "bg-transparent"
              }`}
            >
              <input
                type="radio"
                name="admin"
                value="true"
                checked={admin === true}
                onChange={() => setAdmin(true)}
                className="sr-only"
              />
              Sí
            </label>

            <label
              className={`inline-flex items-center gap-2 cursor-pointer rounded px-3 py-1 ${
                admin ? "bg-transparent" : "bg-amber-600 text-white"
              }`}
            >
              <input
                type="radio"
                name="admin"
                value="false"
                checked={admin === false}
                onChange={() => setAdmin(false)}
                className="sr-only"
              />
              No
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </section>
  );
}
