"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/token-storage";

interface DashboardProtectionProps {
  children: React.ReactNode;
}

export default function DashboardProtection({
  children,
}: DashboardProtectionProps) {
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const validateAuth = () => {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      setIsValidated(true);
    };

    validateAuth();
  }, [router]);

  if (!isValidated) {
    // Show loading or nothing while validating
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
