"use client";

import { useCallback } from "react";
import { FileText, Link2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { materialsApi, classesApi } from "@/services/api";
import { LiveStatusBadge } from "@/components/app/live-status-badge";
import { useLiveData } from "@/hooks/use-live-data";
import { cn } from "@/lib/utils";
import type { MaterialFileType } from "@/types/api";

type MaterialItem = {
  name: string;
  detail: string;
  impact: string;
  impactClass: string;
  percent: number;
  indicatorClass: string;
  icon: typeof FileText;
  iconClass: string;
};

const FALLBACK_MATERIALS: MaterialItem[] = [
  {
    name: "Lecture_04_Entropy.pdf",
    detail: "92% retention rate after reading",
    impact: "High Impact",
    impactClass: "text-teal-600 dark:text-teal-400",
    percent: 92,
    indicatorClass: "bg-chart-2",
    icon: FileText,
    iconClass:
      "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400",
  },
  {
    name: "Thermodynamics Lab Demo",
    detail: "65% of students watched full length",
    impact: "Medium Impact",
    impactClass: "text-amber-500 dark:text-amber-400",
    percent: 65,
    indicatorClass: "bg-chart-4",
    icon: Video,
    iconClass:
      "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-400",
  },
  {
    name: "External Reading: NASA.gov",
    detail: "Only 5 students accessed this link",
    impact: "Low Impact",
    impactClass: "text-muted-foreground",
    percent: 18,
    indicatorClass: "bg-muted-foreground/40",
    icon: Link2,
    iconClass: "bg-muted text-muted-foreground",
  },
];

function getIconForType(type: MaterialFileType) {
  switch (type) {
    case "pdf":
    case "text":
      return {
        icon: FileText,
        iconClass: "bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400",
      };
    case "video":
      return {
        icon: Video,
        iconClass: "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-400",
      };
    default:
      return {
        icon: Link2,
        iconClass: "bg-muted text-muted-foreground",
      };
  }
}

export function MaterialEffectivenessLive() {
  const fetcher = useCallback(async () => {
    // 1. Fetch classes to get the first class ID
    const classData = await classesApi.list();
    const firstClassId = classData.classes[0]?.id;
    if (!firstClassId) return null;

    // 2. Fetch materials for that class
    const data = await materialsApi.list(firstClassId);
    if (!data.materials || data.materials.length === 0) return null;

    return data.materials.map((mat) => {
      const { icon, iconClass } = getIconForType(mat.file_type);
      // Generate some mock stats for now since the API doesn't return impact metrics for materials directly
      const percent = Math.floor(Math.random() * 80) + 20;
      let impact = "Low Impact";
      let impactClass = "text-muted-foreground";
      let indicatorClass = "bg-muted-foreground/40";
      
      if (percent > 75) {
        impact = "High Impact";
        impactClass = "text-teal-600 dark:text-teal-400";
        indicatorClass = "bg-chart-2";
      } else if (percent > 40) {
        impact = "Medium Impact";
        impactClass = "text-amber-500 dark:text-amber-400";
        indicatorClass = "bg-chart-4";
      }

      return {
        name: mat.title,
        detail: `Uploaded ${new Date(mat.created_at).toLocaleDateString()}`,
        impact,
        impactClass,
        percent,
        indicatorClass,
        icon,
        iconClass,
      };
    });
  }, []);

  const { data: items, status } = useLiveData(fetcher, FALLBACK_MATERIALS);

  const isEmpty = items.length === 0;

  return (
    <DashboardCard
      title="Material Effectiveness"
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
            Manage Files
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-sm font-semibold">No materials uploaded</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Upload PDFs and videos to ground your AI Tutor in real curriculum.
            </p>
          </div>
        ) : (
          <ul className="space-y-5">
            {items.map((material) => (
          <li key={material.name} className="flex gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                material.iconClass,
              )}
            >
              <material.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <Progress
                value={material.percent}
                className="gap-2"
                trackClassName="h-1.5"
                indicatorClassName={cn(
                  "rounded-full",
                  material.indicatorClass,
                )}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">
                    {material.name}
                  </p>
                  <p
                    className={cn(
                      "shrink-0 text-xs font-bold",
                      material.impactClass,
                    )}
                  >
                    {material.impact}
                  </p>
                </div>
              </Progress>
              <p className="pt-1.5 text-xs text-muted-foreground">
                {material.detail}
              </p>
            </div>
          </li>
        ))}
        </ul>
        )}
      </div>
    </DashboardCard>
  );
}
