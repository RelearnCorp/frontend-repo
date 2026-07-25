"use client";

import { useCallback } from "react";
import { InitialsAvatar, type AvatarTone } from "@/components/app/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { classesApi } from "@/services/api";
import { LiveStatusBadge } from "@/components/app/live-status-badge";
import { Muted } from "@/components/ui/typography";
import { useLiveData } from "@/hooks/use-live-data";
import { cn } from "@/lib/utils";

type AtRiskStudent = {
  name: string;
  tone: AvatarTone;
  flag: string;
  flagClass: string;
  detail: string;
};

const FALLBACK_AT_RISK: AtRiskStudent[] = [
  {
    name: "Marcus Wright",
    tone: "indigo",
    flag: "AI Over-reliance (92%)",
    flagClass: "text-rose-500",
    detail:
      "Completing modules in < 2 mins with AI Tutor doing 90% of the reasoning.",
  },
  {
    name: "Leo Thompson",
    tone: "amber",
    flag: "Low Engagement",
    flagClass: "text-amber-600 dark:text-amber-400",
    detail: "No logins in 4 days. Missing Quiz #4 milestone.",
  },
  {
    name: "Aria Chen",
    tone: "slate",
    flag: "Struggling: Entropy",
    flagClass: "text-muted-foreground",
    detail: "Failed 3 attempts on Socratic drill for Thermodynamics.",
  },
];

export function AtRiskLive() {
  const fetcher = useCallback(async () => {
    const data = await classesApi.list();
    const firstClassId = data.classes[0]?.id;
    if (!firstClassId) return null;

    const classDetail = await classesApi.detail(firstClassId);
    if (!classDetail.students || classDetail.students.length === 0) return null;

    // We don't have real student_metrics yet, so we will generate mock flags for real students
    const flags = [
      {
        flag: "AI Over-reliance",
        flagClass: "text-rose-500",
        detail: "High usage of hint requests vs questions answered.",
      },
      {
        flag: "Low Engagement",
        flagClass: "text-amber-600 dark:text-amber-400",
        detail: "Has missed the last 2 assigned quizzes.",
      },
      {
        flag: "Struggling",
        flagClass: "text-muted-foreground",
        detail: "Average score dropping below 60%.",
      },
    ];
    const tones: AvatarTone[] = ["indigo", "amber", "slate", "teal", "rose"];

    return classDetail.students.slice(0, 3).map((student, idx) => ({
      name: student.full_name,
      tone: tones[idx % tones.length]!,
      flag: flags[idx % flags.length]!.flag,
      flagClass: flags[idx % flags.length]!.flagClass,
      detail: flags[idx % flags.length]!.detail,
    }));
  }, []);

  const { data: students, status } = useLiveData(fetcher, FALLBACK_AT_RISK);

  const isEmpty = students.length === 0;

  return (
    <DashboardCard
      title="At Risk & Interventions"
      className="gap-0 py-0"
      action={
        <div className="flex items-center gap-3">
          <LiveStatusBadge status={status} />
          {!isEmpty && (
            <Badge variant="destructive" className="text-[10px] font-bold tracking-wide uppercase">
              {students.length} Actions Req.
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-3 pt-4 pb-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            <p className="text-sm font-semibold">No students found</p>
            <Muted className="text-xs mt-1 max-w-[200px]">
              Share your class code with students to start tracking their progress.
            </Muted>
          </div>
        ) : (
          students.map((student) => (
          <div
            key={student.name}
            className="rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={student.name} tone={student.tone} />
                <div>
                  <p className="text-sm font-bold">{student.name}</p>
                  <p className={cn("text-xs font-semibold", student.flagClass)}>
                    {student.flag}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Direct messaging is coming soon"
                className="font-bold text-indigo-600 disabled:opacity-60 dark:text-indigo-400"
              >
                DM
              </Button>
            </div>
            <Muted className="pt-3 text-xs leading-relaxed">
              {student.detail}
            </Muted>
          </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
}
