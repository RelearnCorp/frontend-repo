"use client";

import { useCallback } from "react";
import { BrainCircuit, LoaderCircle, Trophy, Zap } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { useApiData } from "@/hooks/use-api-data";
import { analyticsApi } from "@/services/api";
import { cn } from "@/lib/utils";

export function TeacherLiveStats() {
  const fetcher = useCallback(() => analyticsApi.dashboard(), []);
  const { data, status, error, refetch } = useApiData(fetcher);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading your classes…
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

  if (!data || data.statistics.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <p className="text-sm font-semibold">No classes yet</p>
        <Muted className="text-xs">
          Create a class to start seeing quiz and AI usage stats here.
        </Muted>
      </div>
    );
  }

  const totalQuizzesTaken = data.statistics.reduce(
    (sum, s) => sum + s.statistics.total_quizzes_taken,
    0,
  );
  const averageScore =
    data.statistics.reduce((sum, s) => sum + Number(s.statistics.average_score), 0) /
    data.statistics.length;
  const highestScore = Math.max(...data.statistics.map((s) => s.statistics.highest_score));
  const totalAiRequests = data.statistics.reduce((sum, s) => sum + s.ai_usage.total_requests, 0);
  const uniqueAiUsers = data.statistics.reduce((sum, s) => sum + s.ai_usage.unique_users, 0);

  const stats = [
    {
      label: "Average Score",
      value: `${Math.round(averageScore)}%`,
      caption: `Across ${totalQuizzesTaken} completed quiz attempts`,
      icon: BrainCircuit,
      iconClass: "text-indigo-500",
    },
    {
      label: "Highest Score",
      value: `${highestScore}%`,
      caption: `Across ${data.total_classes} classes`,
      icon: Trophy,
      iconClass: "text-amber-500",
    },
    {
      label: "AI Requests",
      value: `${totalAiRequests}`,
      caption: `${uniqueAiUsers} unique students using AI`,
      icon: Zap,
      iconClass: "text-teal-500",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {stats.map((stat) => (
        <DashboardCard
          key={stat.label}
          className="px-1 py-5"
          title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{stat.label}</span>}
          action={<stat.icon className={cn("size-4", stat.iconClass)} />}
        >
          <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
          <Muted className="pt-2 text-xs">{stat.caption}</Muted>
        </DashboardCard>
      ))}
    </div>
  );
}
