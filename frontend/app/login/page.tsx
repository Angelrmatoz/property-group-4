"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const DEMO_EMAIL = "admin@example.test";
const DEMO_PASSWORD = "password123";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hard-coded dev check: set a cookie and redirect when credentials match
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Set a non-httpOnly cookie for local testing; server-side layout will read it
      document.cookie = `token=dev-token-123; path=/; max-age=${
        60 * 60 * 24
      } Secure`; // 1 day
      router.push("/dashboard");
      return;
    }

    // placeholder: real auth should call API and set httpOnly cookie from server
    alert(
      "Credenciales incorrectas. Para probar, usa:\nEmail: " +
        DEMO_EMAIL +
        "\nPassword: " +
        DEMO_PASSWORD
    );
  };

  function demoLogin() {
    // quick demo login (fills fields and logs in)
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    // Slight delay to allow state to update before submitting
    setTimeout(() => {
      document.cookie = `token=dev-token-123; path=/; max-age=${
        60 * 60 * 24
      } Secure`;
      router.push("/dashboard");
    }, 150);
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left aside with theme-aware image */}
      <aside className="md:w-1/2 w-full relative h-56 md:h-auto">
        {/* Light mode image (visible when not dark) */}
        <div className="absolute inset-0 block dark:hidden">
          <Image
            src="/images/logos/PG-fondo-blanco.jpg"
            alt="PG background light"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Dark mode image (visible when dark) */}
        <div className="absolute inset-0 hidden dark:block">
          <Image
            src="/images/logos/PG-fondo-negro.png"
            alt="PG background dark"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Optional overlay to make form text legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:from-black/40 md:to-transparent" />
      </aside>

      {/* Right: login form */}
      <section className="md:w-1/2 w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                Recuérdame
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-md bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 font-medium shadow"
              >
                Entrar
              </button>
            </div>
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prueba rápida:{" "}
            </p>
            <button
              onClick={demoLogin}
              className="mt-2 px-3 py-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 rounded"
            >
              Iniciar sesión como demo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
