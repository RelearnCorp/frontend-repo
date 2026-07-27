"use client";

import { AppSidebar } from "@/components/app/app-sidebar";
import { getSidebarSections } from "@/constants/nav";
import { useAuth } from "@/hooks/use-auth";

/** Renders the persistent sidebar once for every route under `(dashboard)`. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const role = user?.role?.name === "teacher" ? "teacher" : "student";

  return (
    <div className="flex min-h-dvh bg-muted/40">
      <AppSidebar sections={getSidebarSections(role)} />
      {children}
    </div>
  );
}
