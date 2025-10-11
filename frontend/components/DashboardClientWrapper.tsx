"use client";

import React from "react";
import NotificationProvider from "@/components/Notification";
import AuthWatcher from "@/components/AuthWatcher";

export default function DashboardClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <AuthWatcher />
      {children}
    </NotificationProvider>
  );
}
