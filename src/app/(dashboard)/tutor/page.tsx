import type { Metadata } from "next";

import { AuthGuard } from "@/components/app/auth-guard";
import { TutorHeader } from "@/components/tutor/tutor-header";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Chat with the AI tutor about anything you're studying.",
};

export default function TutorPage() {
  return (
    <AuthGuard role="student">
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <TutorHeader />
        <TutorWorkspace />
      </div>
    </AuthGuard>
  );
}
