"use client";

import { useCallback } from "react";
import { Award, LoaderCircle, Target, Trophy } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { AuthGuard } from "@/components/app/auth-guard";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Muted } from "@/components/ui/typography";
import { getSidebarSections } from "@/constants/nav";
import { useApiData } from "@/hooks/use-api-data";
import { analyticsApi } from "@/services/api";

export default function ProgressPage() {
  const fetcher = useCallback(() => analyticsApi.progress(), []);
  const { data, status, error, refetch } = useApiData(fetcher);

  return (
    <AuthGuard role="student">
      <AppSidebar sections={getSidebarSections("student")} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar title="My Progress" subtitle="Quiz performance across all your classes" />

        <main className="p-6 lg:p-8">
          {status === "loading" && (
            <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading progress…
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

          {status === "success" && data && data.completed_quizzes === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Target className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No quizzes completed yet</p>
              <Muted className="text-xs">
                Take a quiz in one of your classes to see your progress here.
              </Muted>
            </div>
          )}

          {status === "success" && data && data.completed_quizzes > 0 && (
            <div className="grid gap-5 sm:grid-cols-3">
              <DashboardCard
                title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Completed Quizzes</span>}
                action={<Target className="size-4 text-indigo-500" />}
              >
                <p className="text-3xl font-bold tracking-tight">{data.completed_quizzes}</p>
              </DashboardCard>
              <DashboardCard
                title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Average Score</span>}
                action={<Award className="size-4 text-teal-500" />}
              >
                <p className="text-3xl font-bold tracking-tight">{data.average_score}%</p>
              </DashboardCard>
              <DashboardCard
                title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Best Score</span>}
                action={<Trophy className="size-4 text-amber-500" />}
              >
                <p className="text-3xl font-bold tracking-tight">{data.best_score}%</p>
              </DashboardCard>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
