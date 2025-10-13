import React from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardClientWrapper from "../../components/dashboard/DashboardClientWrapper";
import DashboardProtection from "../../components/dashboard/DashboardProtection";

export const metadata = {
  title: "Dashboard - Property Group",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: Authentication is now handled client-side with JWT in localStorage/sessionStorage
  // Server-side cookie protection removed to support new token system

  return (
    <DashboardProtection>
      {/* align items to start so the sidebar header and page headings line up */}
      <div className="min-h-screen flex items-start bg-background text-foreground">
        {/* Sidebar is a client component; load dynamically to avoid SSR issues */}
        <Sidebar />

        {/* On mobile, add left padding equal to sidebar width (CSS var) so content 
            doesn't hide behind the fixed sidebar. On desktop (md+), the flex layout 
            handles spacing automatically. */}
        <main className="flex-1 p-6 pl-[calc(var(--sidebar-width,64px)+1.5rem)] md:pl-6">
          <DashboardClientWrapper>{children}</DashboardClientWrapper>
        </main>
      </div>
    </DashboardProtection>
  );
}
