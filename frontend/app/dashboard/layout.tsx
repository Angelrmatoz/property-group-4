import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardClientWrapper from "../../components/DashboardClientWrapper";

export const metadata = {
  title: "Dashboard - Property Group",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Basic server-side protection: redirect to /login when no token cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  return (
    // align items to start so the sidebar header and page headings line up
    <div className="min-h-screen flex items-start bg-background text-foreground">
      {/* Sidebar is a client component; load dynamically to avoid SSR issues */}
      <Sidebar />

      {/* On mobile, add left padding equal to sidebar width (CSS var) so content 
          doesn't hide behind the fixed sidebar. On desktop (md+), the flex layout 
          handles spacing automatically. */}
      <main
        className="flex-1 p-6 md:pl-6"
        style={{ paddingLeft: "calc(var(--sidebar-width, 64px) + 1.5rem)" }}
      >
        <DashboardClientWrapper>{children}</DashboardClientWrapper>
      </main>
    </div>
  );
}
