"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import auth from "@/services/auth";
import { useNotification } from "@/components/Notification";
import { storeAuthToken } from "@/lib/token-storage";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  // keep overlay mounted briefly during close animation
  const [menuVisible, setMenuVisible] = useState(false);
  const { notify } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call the app route which proxies to the backend (or uses demo auth server-side)
    (async () => {
      try {
        const result = await auth.login(email, password, rememberMe);

        if (result.ok) {
          // Store token with remember preference
          if (result.token) {
            storeAuthToken(result.token, rememberMe);
          }
          router.push("/dashboard");
          return;
        }

        notify({
          type: "error",
          title: "Error de inicio de sesión",
          message: result.message || "Credenciales incorrectas",
          duration: 5000,
        });
      } catch (error) {
        console.error("Login error:", error);
        notify({
          type: "error",
          title: "Error de conexión",
          message: "Error de red al intentar iniciar sesión",
          duration: 5000,
        });
      }
    })();
  };

  // demo login removed — app requires backend auth via /api/login

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
            sizes="(min-width: 768px) 50vw, 100vw"
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
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Optional overlay to make form text legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:from-black/40 md:to-transparent" />
      </aside>

      {/* Right: login form */}
      <section className="relative md:w-1/2 w-full flex items-center justify-center p-8">
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
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                Recuérdame (mantener sesión por 12 horas)
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
        </div>
        {/* Floating Menu button (fixed, bottom-right) to avoid overlapping the login card */}
        <button
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => {
            if (!menuOpen) {
              setMenuVisible(true);
              setMenuOpen(true);
            } else {
              // start closing animation
              setMenuOpen(false);
              // wait for animation to finish before unmounting
              window.setTimeout(() => setMenuVisible(false), 250);
            }
          }}
          className="fixed right-6 bottom-6 md:top-6 md:bottom-auto z-50 p-3 rounded-full bg-black/60 dark:bg-white/10 hover:bg-black/70 dark:hover:bg-white/20 shadow-lg"
        >
          {/* simple hamburger / close icon */}
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {/* Fullscreen translucent menu overlay with enter/leave animations */}
        {menuVisible && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
              menuOpen
                ? "bg-black/60 backdrop-blur-sm"
                : "bg-black/0 backdrop-blur-0 pointer-events-none"
            }`}
            role="dialog"
            aria-modal="true"
            onClick={() => {
              // trigger closing animation
              setMenuOpen(false);
              window.setTimeout(() => setMenuVisible(false), 250);
            }}
          >
            <nav
              className={`w-full max-w-md mx-4 rounded-lg p-6 shadow-lg text-center max-h-[90vh] overflow-auto bg-white/80 dark:bg-neutral-900/80 transform transition-all duration-250 ${
                menuOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-black/10 dark:bg-white/10"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <ul className="space-y-4">
                <li>
                  <Link
                    href="/#inicio"
                    className="text-xl font-semibold text-amber-700 dark:text-amber-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#servicios"
                    className="text-lg text-gray-700 dark:text-gray-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className="text-lg text-gray-700 dark:text-gray-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Proyectos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#nosotros"
                    className="text-lg text-gray-700 dark:text-gray-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#Testimonios"
                    className="text-lg text-gray-700 dark:text-gray-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Testimonios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contacto"
                    className="text-lg text-gray-700 dark:text-gray-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </section>
    </main>
  );
};

export default Login;
