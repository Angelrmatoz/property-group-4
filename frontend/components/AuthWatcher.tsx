"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import { startAuthHeartbeat } from "@/lib/fetch";
import { isRememberMeEnabled } from "@/lib/token-storage";

export default function AuthWatcher() {
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    let redirected = false;

    // Listen for logout broadcasts from other tabs
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "pg:auth:logout") {
        const rememberMe = isRememberMeEnabled();

        // For non-persistent sessions, reload the page to clear everything
        if (!rememberMe && typeof window !== "undefined") {
          window.location.reload();
          return;
        }

        // For persistent sessions, show notification and redirect
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
    // NOTE: Disabled immediate check to prevent conflicts with login flow
    // The heartbeat will handle periodic checks
    // (async () => {
    //   try {
    //     const jwtToken = getAuthToken(); // This automatically checks expiration
    //     if (!jwtToken) {
    //       // No valid token (expired or missing), handle based on remember preference
    //       handleTokenExpiration();
    //       return;
    //     }

    //     const res = await fetch("/api/login", {
    //       headers: {
    //         Authorization: `Bearer ${jwtToken}`,
    //       },
    //     });
    //     if (!res.ok) {
    //       // Token invalid on server, clear locally and handle expiration
    //       clearAuthToken();
    //       handleTokenExpiration();
    //     }
    //   } catch {
    //     // ignore
    //   }
    // })();

    return () => {
      window.removeEventListener("storage", onStorage);
      stopHeartbeat();
    };
  }, [notify, router]);

  return null;
}
