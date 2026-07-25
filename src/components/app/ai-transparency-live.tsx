"use client";

import { useCallback } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { analyticsApi } from "@/services/api";
import { useLiveData } from "@/hooks/use-live-data";
import { LiveStatusBadge } from "@/components/app/live-status-badge";

export function AITransparencyLive() {
  const fetcher = useCallback(async () => {
    const data = await analyticsApi.dashboard();
    if (!data.statistics || data.statistics.length === 0) return 68;
    
    let totalHints = 0;
    let totalChat = 0;
    
    data.statistics.forEach((stat) => {
      totalHints += stat.ai_usage?.by_type?.hint || 0;
      totalChat += stat.ai_usage?.by_type?.chat || 0;
    });
    
    const total = totalHints + totalChat;
    if (total === 0) return 68;
    
    return Math.round((totalChat / total) * 100);
  }, []);

  const { data: autonomyPercent, status } = useLiveData(fetcher, 68);

  return (
    <DashboardCard
      title="AI Assistance Transparency"
      action={
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <LiveStatusBadge status={status} />
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-3" />
            Independent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" />
            AI Guided
          </span>
        </div>
      }
    >
      <DonutChart percent={autonomyPercent} label="Autonomy" className="my-4" />
    </DashboardCard>
  );
}
