"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [openUsers, setOpenUsers] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const STORAGE_KEY = "dashboard:sidebarCollapsed";

  // Initialize to false so server/client markup match during SSR.
  // Use useLayoutEffect to read persisted preference before the first paint
  // to avoid a visible jump. We also track `hydrated` so we can enable
  // transitions only after the first paint.
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== null) setCollapsed(v === "1");
    } catch {
      // ignore
    } finally {
      // mark that we've applied the persisted value (runs before paint)
      setHydrated(true);
    }
    // empty deps: run once on mount
  }, []);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/login", { cache: "no-store" });
        if (!mounted) return;
        if (!res.ok) {
          setIsAdmin(false);
          return;
        }
        const data = await res.json();
        setIsAdmin(Boolean(data?.admin));
      } catch {
        setIsAdmin(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync collapsed state across tabs
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEY) {
        try {
          setCollapsed(ev.newValue === "1");
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function logout() {
    // remove demo token cookie used for local testing
    document.cookie = "token=; Max-Age=0; path=/; Secure";
    router.push("/login");
  }

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} px-2 py-6 border-r ${
        hydrated ? "transition-all duration-200 ease-in-out" : "transition-none"
      } overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        {!collapsed && <h3 className="text-lg font-semibold">Panel</h3>}
        <button
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            try {
              localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
            } catch {
              /* ignore storage errors */
            }
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          {/* simple icon: hamburger / chevron */}
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${
            collapsed ? "justify-center" : ""
          } transition-colors`}
        >
          <span className="h-6 w-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 block"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a1 1 0 00-.894.553l-7 14A1 1 0 003 18h14a1 1 0 00.894-1.447l-7-14A1 1 0 0010 2z" />
            </svg>
          </span>
          <span
            className={`transition-opacity duration-200 flex items-center leading-none ${
              collapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Inicio
          </span>
        </Link>

        <Link
          href="/dashboard/properties"
          className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${
            collapsed ? "justify-center" : ""
          } transition-colors`}
        >
          <span className="h-6 w-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 block"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
            </svg>
          </span>
          <span
            className={`transition-opacity duration-200 flex items-center leading-none ${
              collapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Propiedades
          </span>
        </Link>

        <div>
          <button
            onClick={() => setOpenUsers(!openUsers)}
            className={`w-full text-left px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-between ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 block"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 1116 0H2z" />
                </svg>
              </span>
              <span
                className={`transition-opacity duration-200 flex items-center leading-none ${
                  collapsed
                    ? "opacity-0 max-w-0 overflow-hidden"
                    : "opacity-100"
                }`}
              >
                Usuarios
              </span>
            </div>
            {!collapsed && (
              <span className="text-xs">{openUsers ? "▴" : "▾"}</span>
            )}
          </button>

          <div
            className={`mt-2 ml-2 flex flex-col gap-1 transition-all duration-200 ${
              openUsers && !collapsed
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <Link
              href="/dashboard/users"
              className={`px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                collapsed ? "hidden" : ""
              }`}
            >
              Lista
            </Link>
            {isAdmin ? (
              <Link
                href="/dashboard/users/create"
                className={`px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                  collapsed ? "hidden" : ""
                }`}
              >
                Crear usuario
              </Link>
            ) : null}
          </div>
        </div>

        <button
          onClick={logout}
          className={`mt-4 text-sm text-amber-600 text-left px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span
            className={`${
              !collapsed ? "mr-2" : ""
            } h-6 w-6 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 8v8"
              />
            </svg>
          </span>
          <span
            className={`transition-opacity duration-200 flex items-center leading-none ${
              collapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Cerrar sesión
          </span>
        </button>
      </nav>
    </aside>
  );
}
