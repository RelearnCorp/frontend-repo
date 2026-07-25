import type { Metadata } from "next";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  CircleHelp,
  FileText,
  History,
  Images,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  User,
  Waypoints,
} from "lucide-react";

import {
  AppSidebar,
  type SidebarSection,
} from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import {
  TrajectoryChart,
  type TrajectoryPoint,
} from "@/components/charts/trajectory-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Eyebrow, H1, Muted, Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Platform Capabilities",
  description:
    "Breakdown of Relearn's core epics: LMS management, AI Tutor, teacher intelligence, and chatbot buddy tools.",
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    label: "Platform Features",
    items: [
      { label: "Core LMS", href: "#core-lms", icon: "core-lms" },
      {
        label: "AI Tutor Module",
        href: "#ai-tutor",
        icon: "tutor-module",
        active: true,
      },
      {
        label: "Teacher Analytics",
        href: "#teacher-analytics",
        icon: "analytics",
      },
      { label: "Chatbot Buddy", href: "#chatbot-buddy", icon: "buddy" },
    ],
  },
];

const CORE_LMS_FEATURES = [
  {
    title: "Auth & Access",
    description:
      "Role-based access control for students, teachers, and admins with SSO integration.",
    icon: ShieldCheck,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
  },
  {
    title: "Syllabus Engine",
    description:
      "Dynamic class management, scheduling, and curriculum mapping tools.",
    icon: BookOpen,
    iconClass:
      "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
  },
  {
    title: "Assessment Module",
    description:
      "Automated grading, custom quiz builders, and adaptive testing environments.",
    icon: ListChecks,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  },
  {
    title: "Content CMS",
    description:
      "Rich media hosting, document versioning, and resource library management.",
    icon: Images,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
  },
];

const TRAJECTORY: TrajectoryPoint[] = [
  { label: "Week 1", actual: 42, predicted: 46 },
  { label: "Week 2", actual: 50, predicted: 53 },
  { label: "Week 3", actual: 56, predicted: 61 },
  { label: "Week 4", actual: 64, predicted: 68 },
  { label: "Week 5", actual: 78, predicted: 81 },
];

const BUDDY_TOOLS = [
  {
    title: "Hint Buddy",
    description:
      "Context-aware micro-hints during assessments. Monitors student idle time and offers gentle nudges without giving away answers.",
    action: "Configure Triggers",
    icon: Lightbulb,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
    actionClass: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Graph Visualizer",
    description:
      "Instantly converts text-based concepts (like historical timelines or biological processes) into interactive node graphs.",
    action: "View Demo",
    icon: Waypoints,
    iconClass:
      "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
    actionClass: "text-teal-600 dark:text-teal-400",
  },
];

function SectionHeading({
  number,
  title,
  badge,
  id,
}: {
  number: number;
  title: string;
  badge?: string;
  id: string;
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <div className="flex flex-wrap items-center gap-3 pb-3">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
          {number}
        </span>
        <Typography variant="h3" render={<h2 />}>
          {title}
        </Typography>
        {badge && (
          <Badge className="ml-auto bg-indigo-50 text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:bg-indigo-950/60 dark:text-indigo-300">
            {badge}
          </Badge>
        )}
      </div>
      <Separator />
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <AppSidebar sections={SIDEBAR_SECTIONS} />

      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar title="Features" subtitle="Platform Breakdown">
          <Button variant="outline" className="rounded-full font-semibold">
            Documentation
          </Button>
          <Button className="rounded-full font-semibold">Deploy Update</Button>
        </AppTopbar>

        <main className="mx-auto max-w-6xl w-full space-y-14 p-6 lg:p-10">
          <div>
            <H1 render={<h2 />}>Platform Capabilities</H1>
            <Muted className="max-w-xl pt-3 text-base">
              Detailed breakdown of Relearn&apos;s core architectural epics,
              integrating traditional LMS foundations with advanced AI cognitive
              models.
            </Muted>
          </div>

          <section className="space-y-6">
            <SectionHeading
              number={1}
              title="Core LMS Management"
              id="core-lms"
            />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {CORE_LMS_FEATURES.map((feature) => (
                <DashboardCard key={feature.title} title={<span className="text-sm">{feature.title}</span>} titleRender={<h3 />} className="gap-4 p-5">
                  <div className="mb-4">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
                        feature.iconClass,
                      )}
                    >
                      <feature.icon className="size-5" />
                    </span>
                  </div>
                  <div>
                    <Muted className="pt-1.5 text-xs leading-relaxed">
                      {feature.description}
                    </Muted>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </section>

          {/* Socratic Mode Section */}
          <section className="space-y-6">
            <SectionHeading
              number={2}
              title="AI Tutor Interaction (Hero Feature)"
              badge="Active"
              id="ai-tutor"
            />
            <DashboardCard title={null} className="grid gap-0 py-0 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex flex-col p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
                  <p className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Socratic Mode Active
                  </p>
                  <Muted className="text-xs">
                    Context: Physics 101 - Thermodynamics
                  </Muted>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-3 justify-end ml-12 lg:ml-24">
                    <p className="min-w-0 rounded-xl rounded-tr-sm bg-muted px-4 py-3 text-sm">
                      I don&apos;t understand why entropy always increases. It
                      doesn&apos;t make sense to me.
                    </p>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
                      <User className="size-4" />
                    </span>
                  </div>
                  <div className="flex gap-3 mr-4 lg:mr-12">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CircleHelp className="size-4" />
                    </span>
                    <div className="min-w-0 rounded-xl rounded-tl-sm bg-indigo-50/70 px-4 py-3 text-sm dark:bg-indigo-950/40">
                      <p>
                        Let&apos;s break it down together. Imagine you drop a
                        glass and it shatters. What are the chances those pieces
                        will spontaneously reassemble into a perfect glass?
                      </p>
                      <Button
                        variant="link"
                        size="xs"
                        className="mt-2 h-auto p-0 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-normal text-left justify-start items-start"
                      >
                        <BookOpen className="shrink-0 mt-0.5" />
                        <span>Sourced from Ch 4. Materials</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <Separator className="mb-5" />
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      Cognitive Load:
                      <span className="h-1.5 w-16 rounded-full bg-muted">
                        <span className="block h-full w-3/4 rounded-full bg-chart-4" />
                      </span>
                      <span className="text-amber-500">High</span>
                    </div>
                    <Button
                      variant="outline"
                      className="h-auto gap-2 rounded-full px-4 py-2 font-bold shadow-xs"
                    >
                      <Switch size="sm" checked={false} readOnly aria-hidden />
                      I&apos;m Tired / Explain it
                    </Button>
                  </div>
                </div>
              </div>

              <aside className="space-y-6 border-t bg-muted/40 p-6 lg:border-t-0 lg:border-l">
                <div>
                  <Eyebrow render={<h3 />} className="pb-4">
                    Model Parameters
                  </Eyebrow>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="rag-grounding" className="font-normal">
                        RAG Grounding
                      </Label>
                      <Switch id="rag-grounding" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="explainable-mode" className="font-normal">
                        Explainable AI Mode
                      </Label>
                      <Switch id="explainable-mode" />
                    </div>
                  </div>
                </div>
                <div>
                  <Eyebrow render={<h3 />} className="pb-2">
                    Teacher Materials (RAG)
                  </Eyebrow>
                  <Muted className="text-xs leading-relaxed">
                    Responses are strictly grounded in uploaded syllabus and
                    lecture notes to prevent hallucination.
                  </Muted>
                  <div className="mt-3 flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5">
                    <FileText className="size-4 shrink-0 text-rose-500" />
                    <span className="truncate text-xs font-medium">
                      Physics_101_Syllabus.pdf
                    </span>
                  </div>
                </div>
              </aside>
            </DashboardCard>
          </section>

          <section className="space-y-6">
            <SectionHeading
              number={3}
              title="Teacher Intelligence & Analytics"
              id="teacher-analytics"
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <DashboardCard
                title="Learning Twin Trajectory"
                titleRender={<h3 />}
                description="Class aggregate vs. AI predicted mastery"
                action={
                  <Badge variant="secondary" className="h-auto rounded-lg px-3 py-1.5 font-semibold">
                    Last 30 Days
                  </Badge>
                }
              >
                <TrajectoryChart points={TRAJECTORY} />
                <div className="flex items-center gap-5 pt-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-0.5 w-5 rounded-full bg-chart-3" />
                    Actual Mastery
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-0.5 w-5 rounded-full border-t-2 border-dotted border-teal-600 dark:border-teal-400" />
                    AI Prediction
                  </span>
                </div>
              </DashboardCard>

              <DashboardCard title="Intervention Alerts" titleRender={<h3 />}>
                <div className="space-y-3">
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
                    <p className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="size-4" />
                      High Cognitive Overload
                    </p>
                    <p className="pt-1.5 text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                      8 students struggled with &ldquo;Cellular
                      Respiration&rdquo; module today.
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                    <p className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
                      <History className="size-4" />
                      Socratic Drop-off
                    </p>
                    <p className="pt-1.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                      15% increase in &ldquo;Explain it&rdquo; toggle usage on
                      Quiz 3.
                    </p>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeading
              number={4}
              title="Chatbot Buddy Tools"
              id="chatbot-buddy"
            />
            <div className="grid gap-5 lg:grid-cols-2">
              {BUDDY_TOOLS.map((tool) => (
                <DashboardCard key={tool.title} title={<span className="text-sm">{tool.title}</span>} titleRender={<h3 />} className="flex-row gap-4 p-6">
                  <div className="flex">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl mr-4",
                        tool.iconClass,
                      )}
                    >
                      <tool.icon className="size-5" />
                    </span>
                    <div>
                      <Muted className="pt-1.5 text-xs leading-relaxed">
                        {tool.description}
                      </Muted>
                      <Button
                        variant="link"
                        className={cn("mt-3 h-auto p-0 font-bold", tool.actionClass)}
                      >
                        {tool.action}
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
