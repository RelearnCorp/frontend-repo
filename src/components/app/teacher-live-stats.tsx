"use client";

import { useCallback } from "react";
import {
  BrainCircuit,
  SmilePlus,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { analyticsApi } from "@/services/api";
import { LiveStatusBadge } from "@/components/app/live-status-badge";
import { useLiveData } from "@/hooks/use-live-data";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  caption: string;
  icon: LucideIcon;
  iconClass: string;
};

/** Mockup numbers shown until GET /analytics/dashboard returns real ones. */
const FALLBACK_STATS: Stat[] = [
  {
    label: "Class Speed",
    value: "1.2x",
    delta: "+8% vs last week",
    caption: "Average pace relative to curriculum",
    icon: Zap,
    iconClass: "text-amber-500",
  },
  {
    label: "Retention Rate",
    value: "84%",
    delta: "+2% vs last week",
    caption: "Memory decay offset after 7 days",
    icon: BrainCircuit,
    iconClass: "text-indigo-500",
  },
  {
    label: "Avg Confidence",
    value: "7.2",
    suffix: "/ 10",
    caption: "Subjective student comfort level",
    icon: SmilePlus,
    iconClass: "text-teal-500",
  },
];

export function TeacherLiveStats() {
  const fetcher = useCallback(async () => {
    const data = await analyticsApi.dashboard();
    const cls = data.statistics[0];
    if (!cls) return null;
    return {
      stats: [
        {
          label: "Average Score",
          value: `${cls.statistics.average_score}%`,
          caption: `Across ${cls.statistics.total_quizzes_taken} completed quiz attempts`,
          icon: BrainCircuit,
          iconClass: "text-indigo-500",
        },
        {
          label: "Highest Score",
          value: `${cls.statistics.highest_score}%`,
          caption: `Lowest so far: ${cls.statistics.lowest_score}%`,
          icon: Trophy,
          iconClass: "text-amber-500",
        },
        {
          label: "AI Requests",
          value: `${cls.ai_usage.total_requests}`,
          caption: `${cls.ai_usage.unique_users} students • ${cls.ai_usage.by_type.hint} hints, ${cls.ai_usage.by_type.chat} chats`,
          icon: Zap,
          iconClass: "text-teal-500",
        },
      ] as Stat[],
      liveClassName: cls.class_name,
    };
  }, []);

  const { data, status } = useLiveData(fetcher, { stats: FALLBACK_STATS, liveClassName: null as string | null });

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {data.stats.map((stat, i) => (
        <DashboardCard
          key={stat.label}
          className="px-1 py-5"
          title={<span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{stat.label}</span>}
          action={
            <div className="flex items-center gap-2">
              {i === 0 && <LiveStatusBadge status={status} />}
              <stat.icon className={cn("size-4", stat.iconClass)} />
            </div>
          }
        >
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {stat.value}
            </span>
            {stat.suffix && (
              <span className="text-sm text-muted-foreground">
                {stat.suffix}
              </span>
            )}
            {stat.delta && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {stat.delta}
              </span>
            )}
          </p>
          <p className="pt-2 text-xs text-muted-foreground">{stat.caption}</p>
        </DashboardCard>
      ))}
    </div>
  );
}
