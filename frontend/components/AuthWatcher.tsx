"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import { startAuthHeartbeat } from "@/lib/fetch";
import { getAuthToken, clearAuthToken } from "@/lib/token-storage";

export default function AuthWatcher() {
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    let redirected = false;

    // Listen for logout broadcasts from other tabs
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "pg:auth:logout") {
        // show notification and redirect shortly after so user sees message
        notify({
          type: "error",
          title: "Sesión expirada",
          message: "Tu sesión ha expirado. Serás redirigido al login.",
          duration: 4000,
        });
        if (!redirected) {
          redirected = true;
          setTimeout(() => {
            try {
              router.push("/login");
            } catch {
              window.location.href = "/login";
            }
          }, 1400);
        }
      }
    };

    window.addEventListener("storage", onStorage);

    // Start heartbeat to proactively detect expiry in this tab
    const stopHeartbeat = startAuthHeartbeat(30_000);

    // Also do an immediate quick check (best-effort)
    (async () => {
      try {
        const jwtToken = getAuthToken(); // This automatically checks expiration
        if (!jwtToken) {
          // No valid token (expired or missing), broadcast logout
          try {
            localStorage.setItem("pg:auth:logout", String(Date.now()));
          } catch {}
          return;
        }

        const res = await fetch("/api/login", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        if (!res.ok) {
          // Token invalid on server, clear locally and broadcast
          clearAuthToken();
          try {
            localStorage.setItem("pg:auth:logout", String(Date.now()));
          } catch {}
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      window.removeEventListener("storage", onStorage);
      stopHeartbeat();
    };
  }, [notify, router]);

  return null;
}
