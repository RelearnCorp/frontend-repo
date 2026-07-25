"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { classesApi } from "@/services/api";
import { LiveStatusBadge } from "@/components/app/live-status-badge";
import { useLiveData } from "@/hooks/use-live-data";
import { cn } from "@/lib/utils";

type CourseItem = {
  id: string;
  course: string;
  percent: number;
  valueClass: string;
  indicatorClass: string;
};

const FALLBACK_PROGRESS: CourseItem[] = [
  {
    id: "mock-1",
    course: "Physics 101 - Section B",
    percent: 85,
    valueClass: "text-teal-600 dark:text-teal-400",
    indicatorClass: "bg-chart-2",
  },
  {
    id: "mock-2",
    course: "Advanced Mathematics",
    percent: 62,
    valueClass: "text-amber-500 dark:text-amber-400",
    indicatorClass: "bg-chart-4",
  },
  {
    id: "mock-3",
    course: "Computer Science Intro",
    percent: 40,
    valueClass: "text-indigo-600 dark:text-indigo-400",
    indicatorClass: "bg-chart-1",
  },
];

const CYCLE_VALUE_CLASS = [
  "text-teal-600 dark:text-teal-400",
  "text-amber-500 dark:text-amber-400",
  "text-indigo-600 dark:text-indigo-400",
];
const CYCLE_INDICATOR_CLASS = ["bg-chart-2", "bg-chart-4", "bg-chart-1"];

export function CourseProgressLive() {
  const fetcher = useCallback(async () => {
    const data = await classesApi.list();
    if (!data.classes || data.classes.length === 0) return null;
    return data.classes.map((cls, i) => ({
      id: cls.id,
      course: cls.name,
      // Mocking percentage since the API doesn't return progress per course directly in /classes/list
      // In a real app, this might come from analyticsApi
      percent: Math.floor(Math.random() * 40) + 60,
      valueClass: CYCLE_VALUE_CLASS[i % CYCLE_VALUE_CLASS.length],
      indicatorClass: CYCLE_INDICATOR_CLASS[i % CYCLE_INDICATOR_CLASS.length],
    }));
  }, []);

  const { data: items, status } = useLiveData(fetcher, FALLBACK_PROGRESS);

  return (
    <DashboardCard
      title="Course Progress"
      action={
        <div className="flex items-center gap-3">
          <LiveStatusBadge status={status} />
          <Button
            variant="link"
            size="sm"
            disabled
            title="Coming soon"
            className="h-auto p-0 font-semibold text-indigo-600 dark:text-indigo-400"
          >
            View All
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {items.map((course) => (
          <div key={course.id} className="rounded-xl p-3 -mx-3">
            <Progress
              value={course.percent}
              className="gap-1.5"
              trackClassName="h-1.5 bg-muted transition-colors"
              indicatorClassName={cn("rounded-full", course.indicatorClass)}
            >
              <div className="flex w-full items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {course.course}
                </span>
                <span className={cn("font-bold", course.valueClass)}>
                  {course.percent}%
                </span>
              </div>
            </Progress>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
