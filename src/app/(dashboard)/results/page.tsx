"use client";

import { useCallback } from "react";
import { ClipboardList, LoaderCircle } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { AuthGuard } from "@/components/app/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { getSidebarSections } from "@/constants/nav";
import { useApiData } from "@/hooks/use-api-data";
import { analyticsApi } from "@/services/api";

export default function ResultsPage() {
  const fetcher = useCallback(() => analyticsApi.progress(), []);
  const { data, status, error, refetch } = useApiData(fetcher);

  return (
    <AuthGuard role="student">
      <AppSidebar sections={getSidebarSections("student")} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar title="Quiz Results" subtitle="Every quiz attempt you've completed" />

        <main className="mx-auto w-full max-w-2xl p-6 lg:p-8">
          {status === "loading" && (
            <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading results…
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={refetch}>
                Try again
              </Button>
            </div>
          )}

          {status === "success" && data && data.quizzes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <ClipboardList className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No quiz attempts yet</p>
              <Muted className="text-xs">
                Results will show up here after you take a quiz.
              </Muted>
            </div>
          )}

          {status === "success" && data && data.quizzes.length > 0 && (
            <ul className="space-y-3">
              {data.quizzes.map((attempt) => (
                <li
                  key={attempt.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {attempt.quiz?.title ?? "Quiz"}
                    </p>
                    <Muted className="text-xs">
                      {[
                        attempt.completed_at
                          ? new Date(attempt.completed_at).toLocaleDateString()
                          : null,
                        attempt.learning_mode ? `Mode: ${attempt.learning_mode}` : null,
                        attempt.status,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Muted>
                  </div>
                  {attempt.percentage_score != null && (
                    <Badge className="shrink-0 text-sm font-bold">
                      {attempt.percentage_score}%
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
