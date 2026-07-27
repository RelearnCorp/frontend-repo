import type { Metadata } from "next";

import { AppSidebar, type SidebarSection } from "@/components/app/app-sidebar";
import { HeatmapLegend, HeatmapTile, type HeatTier } from "@/components/app/heatmap";
import { TeacherLiveStats } from "@/components/app/teacher-live-stats";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { AITransparencyLive } from "@/components/app/ai-transparency-live";
import { AtRiskLive } from "@/components/app/at-risk-live";
import { MaterialEffectivenessLive } from "@/components/app/material-effectiveness-live";
import { TeacherTopbarLive } from "@/components/app/teacher-topbar-live";

export const metadata: Metadata = {
  title: "Teacher Intelligence",
  description:
    "Class-level learning analytics, risk alerts, and material effectiveness.",
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Management",
    items: [
      { label: "Classrooms", href: "/classrooms", icon: "courses" },
      {
        label: "Teacher Intelligence",
        href: "/teacher",
        icon: "intelligence",
        active: true,
      },
      { label: "Analytics", href: "/analytics", icon: "analytics" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "AI Performance", href: "#ai-performance", icon: "performance", disabled: true },
      { label: "Reports", href: "#reports", icon: "reports", disabled: true },
    ],
  },
];



const HEATMAP: { topic: string; struggle: number; tier: HeatTier }[] = [
  { topic: "Newtonian Laws", struggle: 8, tier: "clear" },
  { topic: "Entropy & Heat", struggle: 42, tier: "warm" },
  { topic: "Kinetic Energy", struggle: 67, tier: "hot" },
  { topic: "Elastic Collisions", struggle: 12, tier: "clear" },
  { topic: "Momentum", struggle: 5, tier: "clear" },
  { topic: "Vector Fields", struggle: 22, tier: "warm" },
  { topic: "Quantum Intro", struggle: 88, tier: "critical" },
  { topic: "Wave Mechanics", struggle: 14, tier: "clear" },
];


export default function TeacherPage() {
  return (
    <>
      <AppSidebar sections={SIDEBAR_SECTIONS} />

      <div className="min-w-0 flex-1 flex flex-col">
        <TeacherTopbarLive />

        <main className="grid gap-6 p-6 lg:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <TeacherLiveStats />

            <AtRiskLive />

            <DashboardCard
              title="Confusing Concept Heatmap"
              description="Intensity based on time-on-page and AI 'I give up' triggers"
              action={<HeatmapLegend />}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {HEATMAP.map((cell) => (
                  <HeatmapTile
                    key={cell.topic}
                    topic={cell.topic}
                    detail={`${cell.struggle}% Struggle`}
                    tier={cell.tier}
                  />
                ))}
              </div>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <AITransparencyLive />

            <MaterialEffectivenessLive />
          </div>
        </main>
      </div>
    </>
  );
}
