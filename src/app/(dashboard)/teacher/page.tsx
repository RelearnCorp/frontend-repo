import type { Metadata } from "next";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AuthGuard } from "@/components/app/auth-guard";
import { TeacherLiveStats } from "@/components/app/teacher-live-stats";
import { TeacherTopbarLive } from "@/components/app/teacher-topbar-live";
import { getSidebarSections } from "@/constants/nav";

export const metadata: Metadata = {
  title: "Teacher Overview",
  description: "Cross-class quiz and AI usage statistics for teachers.",
};
export default function TeacherPage() {
  return (
    <AuthGuard role="teacher">
      <AppSidebar sections={getSidebarSections("teacher")} />

      <div className="min-w-0 flex-1 flex flex-col">
        <TeacherTopbarLive />

        <main className="p-6 lg:p-8">
          <TeacherLiveStats />
        </main>
      </div>
    </AuthGuard>
  );
}
