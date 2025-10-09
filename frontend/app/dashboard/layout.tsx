import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";

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

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
