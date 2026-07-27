"use client";

import { useCallback } from "react";
import { BarChart3, LoaderCircle, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Muted } from "@/components/ui/typography";
import { useApiData } from "@/hooks/use-api-data";
import { analyticsApi } from "@/services/api";

export function ClassAnalyticsTab({ classId }: { classId: string }) {
  const fetcher = useCallback(() => analyticsApi.dashboard(classId), [classId]);
  const { data, status, error, refetch } = useApiData(fetcher);
  const stats = data?.statistics.find((s) => s.class_id === classId)?.statistics;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading analytics…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  if (!stats || stats.total_quizzes_taken === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <BarChart3 className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-semibold">No quiz attempts yet</p>
        <Muted className="text-xs">
          Analytics will appear once students start completing quizzes.
        </Muted>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <DashboardCard
        title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Average Score</span>}
        action={<BarChart3 className="size-4 text-indigo-500" />}
      >
        <p className="text-3xl font-bold tracking-tight">{stats.average_score}%</p>
        <Muted className="pt-2 text-xs">
          Across {stats.total_quizzes_taken} completed attempts
        </Muted>
      </DashboardCard>
      <DashboardCard
        title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Highest Score</span>}
        action={<TrendingUp className="size-4 text-emerald-500" />}
      >
        <p className="text-3xl font-bold tracking-tight">{stats.highest_score}%</p>
      </DashboardCard>
      <DashboardCard
        title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Lowest Score</span>}
        action={<TrendingDown className="size-4 text-amber-500" />}
      >
        <p className="text-3xl font-bold tracking-tight">{stats.lowest_score}%</p>
      </DashboardCard>
    </div>
  );
}
