import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";

import {
  AppSidebar,
  type SidebarSection,
} from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { HeatmapLegend, HeatmapTile, type HeatTier } from "@/components/app/heatmap";
import { NotificationButton } from "@/components/app/notification-button";
import { RecentActivityLive } from "@/components/app/recent-activity-live";
import { RadarChart } from "@/components/charts/radar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { CourseProgressLive } from "@/components/app/course-progress-live";
import { ProfileHeaderLive } from "@/components/app/profile-header-live";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Student Profile",
  description: "Learning twin analytics and progress for the student.",
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Menu",
    items: [
      { label: "Dashboard", href: "#dashboard", icon: "home", disabled: true },
      { label: "Courses", href: "#courses", icon: "courses", disabled: true },
      { label: "Assignments", href: "#assignments", icon: "assignments", disabled: true },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Profile", href: "/profile", icon: "profile", active: true },
      { label: "Settings", href: "#settings", icon: "settings", disabled: true },
    ],
  },
];

const RADAR_AXES = [
  { label: "Retention", value: 0.95, baseline: 0.62 },
  { label: "Learning Speed", value: 0.82, baseline: 0.6 },
  { label: "AI Collaboration", value: 0.88, baseline: 0.58 },
  { label: "Concept Mastery", value: 0.68, baseline: 0.55 },
  { label: "Confidence", value: 0.74, baseline: 0.57 },
];

const INTERACTION_STYLE = [
  {
    label: "Socratic Mode (Challenging)",
    percent: 72,
    indicatorClass: "bg-chart-2",
  },
  {
    label: "Explainable AI (Guided)",
    percent: 28,
    indicatorClass: "bg-chart-1",
  },
];


const MISCONCEPTIONS: { topic: string; detail: string; tier: HeatTier }[] = [
  { topic: "Entropy Dynamics", detail: "Critical Review", tier: "hot" },
  { topic: "Wave Interference", detail: "Partial Mastery", tier: "warm" },
  { topic: "Newtonian Friction", detail: "Good Progress", tier: "clear" },
  { topic: "Vector Motion", detail: "Mastered", tier: "info" },
];

export default function ProfilePage() {
  return (
    <>
      <AppSidebar sections={SIDEBAR_SECTIONS} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar title="Student Profile" subtitle="Learning Twin Sync">
          <NotificationButton />
          <Button className="font-semibold" disabled title="Coming soon">
            Sync Analytics
          </Button>
        </AppTopbar>

        <main className="grid gap-6 p-6 lg:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <DashboardCard
              title={null}
              className="flex-row flex-wrap items-center justify-between gap-6 px-6 py-6"
            >
              <div className="flex items-center gap-5">
                <ProfileHeaderLive />
              </div>
              <div className="text-right">
                <Badge className="gap-1.5 bg-teal-50 font-bold tracking-wide text-teal-700 uppercase dark:bg-teal-950 dark:text-teal-300">
                  <span className="size-1.5 rounded-full bg-teal-500" />
                  On Track
                </Badge>
                <Muted className="pt-2 text-xs">
                  Next Milestone: Quantum Physics Cert.
                </Muted>
              </div>
            </DashboardCard>

            <CourseProgressLive />

            <DashboardCard
              title="Misconception Heatmap"
              description="AI-identified areas requiring focused review"
              action={<HeatmapLegend />}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {MISCONCEPTIONS.map((item) => (
                  <HeatmapTile key={item.topic} {...item} />
                ))}
              </div>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DashboardCard
              title={<span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Learning Efficiency</span>}
              action={<Zap className="size-4 text-indigo-500" />}
            >
              <p className="text-4xl font-bold tracking-tight">
                8.4{" "}
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  +12% vs last month
                </span>
              </p>
              <Muted className="pt-2 text-xs leading-relaxed">
                Calculated based on retention and engagement metrics.
              </Muted>
            </DashboardCard>

            <DashboardCard 
              title="AI Interaction Style"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  className="h-auto font-bold text-indigo-600 dark:text-indigo-400"
                  render={<Link href="/tutor" />}
                >
                  Start Session
                </Button>
              }
            >
              <div className="space-y-4">
                {INTERACTION_STYLE.map((style) => (
                  <Progress
                    key={style.label}
                    value={style.percent}
                    className="gap-1.5"
                    trackClassName="h-1.5"
                    indicatorClassName={cn(
                      "rounded-full",
                      style.indicatorClass,
                    )}
                  >
                    <div className="flex w-full items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {style.label}
                      </span>
                      <span className="font-bold">{style.percent}%</span>
                    </div>
                  </Progress>
                ))}
                <Muted className="text-xs leading-relaxed">
                  Aria prefers discovering answers through guided questioning
                  rather than direct explanations.
                </Muted>
              </div>
            </DashboardCard>

            <RecentActivityLive />

            <DashboardCard
              title="Learning Twin Analytics"
              description="Real-time mapping of cognitive growth"
              action={
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-1" />
                    Aria
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-muted-foreground" />
                    Class Avg
                  </span>
                </div>
              }
            >
              <RadarChart axes={RADAR_AXES} className="mt-2" />
            </DashboardCard>
          </div>
        </main>
      </div>
    </>
  );
}
