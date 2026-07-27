"use client";

import { useCallback } from "react";
import { LoaderCircle, MessageCircle, Sparkles, Users, Zap } from "lucide-react";

import { DonutChart } from "@/components/charts/donut-chart";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Muted } from "@/components/ui/typography";
import { useApiData } from "@/hooks/use-api-data";
import { analyticsApi } from "@/services/api";

export function ClassAiUsageTab({ classId }: { classId: string }) {
  const fetcher = useCallback(() => analyticsApi.aiUsage(classId), [classId]);
  const { data, status, error, refetch } = useApiData(fetcher);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading AI usage…
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

  if (!data || data.total_requests === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Sparkles className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-semibold">No AI activity yet</p>
        <Muted className="text-xs">
          Chat and hint usage will show up here once students start using the
          AI Tutor.
        </Muted>
      </div>
    );
  }

  const chatPercent = Math.round((data.by_type.chat / data.total_requests) * 100);

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <DashboardCard
        title="Chat vs. Hint Usage"
        titleRender={<h3 />}
      >
        <DonutChart percent={chatPercent} label="AI Chat" className="my-2" />
        <div className="flex items-center justify-center gap-5 pt-2 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-3" />
            Chat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" />
            Hint
          </span>
        </div>
      </DashboardCard>

      <div className="grid gap-5 sm:grid-cols-2">
        <DashboardCard
          title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Total Requests</span>}
          action={<Zap className="size-4 text-teal-500" />}
        >
          <p className="text-3xl font-bold tracking-tight">{data.total_requests}</p>
          <Muted className="pt-2 text-xs">{data.total_tokens} tokens used</Muted>
        </DashboardCard>
        <DashboardCard
          title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Unique Users</span>}
          action={<Users className="size-4 text-indigo-500" />}
        >
          <p className="text-3xl font-bold tracking-tight">{data.unique_users}</p>
        </DashboardCard>
        <DashboardCard
          title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">AI Chat</span>}
          action={<MessageCircle className="size-4 text-chart-3" />}
        >
          <p className="text-3xl font-bold tracking-tight">{data.by_type.chat}</p>
        </DashboardCard>
        <DashboardCard
          title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Hints</span>}
          action={<Sparkles className="size-4 text-chart-2" />}
        >
          <p className="text-3xl font-bold tracking-tight">{data.by_type.hint}</p>
        </DashboardCard>
      </div>
    </div>
  );
}
