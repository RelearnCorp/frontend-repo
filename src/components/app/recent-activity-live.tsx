"use client";

import { useCallback } from "react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { analyticsApi } from "@/services/api";
import { LiveStatusBadge } from "@/components/app/live-status-badge";
import { Muted } from "@/components/ui/typography";
import { useLiveData } from "@/hooks/use-live-data";
import { cn } from "@/lib/utils";

type ActivityItem = { title: string; detail: string; dotClass: string };

/** Mockup data shown until real attempts arrive from GET /analytics/progress. */
const FALLBACK_ACTIVITY: ActivityItem[] = [
  {
    title: "Completed: Quiz #8 - Waves",
    detail: "2 hours ago • Score: 96%",
    dotClass: "bg-chart-2",
  },
  {
    title: "AI Tutor Session: Entropy",
    detail: "Yesterday • 45 mins active",
    dotClass: "bg-chart-1",
  },
  {
    title: "Assignment Submitted",
    detail: "Oct 24 • Lab Report #4",
    dotClass: "bg-chart-4",
  },
];

const DOT_CYCLE = ["bg-chart-2", "bg-chart-1", "bg-chart-4"];

export function RecentActivityLive() {
  const fetcher = useCallback(async () => {
    const data = await analyticsApi.progress();
    if (data.quizzes.length === 0) return null;
    return data.quizzes.slice(0, 3).map((attempt, i) => ({
      title: `Completed: ${attempt.quiz?.title ?? "Quiz"}`,
      detail: [
        attempt.completed_at
          ? new Date(attempt.completed_at).toLocaleDateString()
          : null,
        attempt.percentage_score != null
          ? `Score: ${attempt.percentage_score}%`
          : null,
        attempt.learning_mode ? `Mode: ${attempt.learning_mode}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
      dotClass: DOT_CYCLE[i % DOT_CYCLE.length],
    }));
  }, []);

  const { data: items, status } = useLiveData(fetcher, FALLBACK_ACTIVITY);

  return (
    <DashboardCard
      title="Recent Activity"
      action={<LiveStatusBadge status={status} />}
    >
      <ul className="space-y-5">
        {items.map((activity) => (
          <li key={activity.title} className="flex gap-3">
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                activity.dotClass,
              )}
            />
            <div>
              <p className="text-sm font-semibold">{activity.title}</p>
              <Muted className="text-xs">{activity.detail}</Muted>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
