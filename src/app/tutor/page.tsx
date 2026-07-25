import type { Metadata } from "next";

import { AuthGuard } from "@/components/app/auth-guard";
import { TutorHeader } from "@/components/tutor/tutor-header";
import { TutorSession } from "@/components/tutor/tutor-session";
import { TutorSidebar } from "@/components/tutor/tutor-sidebar";

export const metadata: Metadata = {
  title: "AI Tutor",
  description:
    "Socratic AI tutoring session with an on-demand switch to step-by-step explanations.",
};

export default function TutorPage() {
  return (
    <AuthGuard>
      <div className="flex h-dvh flex-col bg-muted/30">
        <TutorHeader />
        <div className="flex min-h-0 flex-1">
          <TutorSidebar />
          <TutorSession />
        </div>
      </div>
    </AuthGuard>
  );
}
