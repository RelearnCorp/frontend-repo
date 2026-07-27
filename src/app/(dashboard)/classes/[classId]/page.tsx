"use client";

import { use, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, LoaderCircle, LogOut, Plus, Users } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { InitialsAvatar } from "@/components/app/initials-avatar";
import { ClassMaterialsTab } from "@/components/classes/class-materials-tab";
import { ClassQuizzesTab } from "@/components/classes/class-quizzes-tab";
import { ClassAnalyticsTab } from "@/components/classes/class-analytics-tab";
import { ClassAiUsageTab } from "@/components/classes/class-ai-usage-tab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Muted } from "@/components/ui/typography";
import { getSidebarSections } from "@/constants/nav";
import { useApiData } from "@/hooks/use-api-data";
import { useAuth } from "@/hooks/use-auth";
import { classesApi } from "@/services/api";
import { ApiError } from "@/services/http";

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 font-mono font-bold"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="text-emerald-600" /> : <Copy />}
      {code}
    </Button>
  );
}

function LeaveClassDialog({
  classId,
  className,
}: {
  classId: string;
  className: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLeave = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await classesApi.leave(classId);
      router.push("/classes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't leave the class.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" className="gap-1.5 font-semibold" />}>
        <LogOut />
        Leave Class
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave {className}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You&apos;ll lose access to its materials and quizzes unless you rejoin
          with the class code.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Leave Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OverviewTab({
  classId,
  detail,
  role,
}: {
  classId: string;
  detail: NonNullable<ReturnType<typeof useClassDetail>["data"]>;
  role: "teacher" | "student";
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <h3 className="text-sm font-bold">Roster</h3>
        {detail.students.length === 0 ? (
          <Muted className="text-xs">No students enrolled yet.</Muted>
        ) : (
          <ul className="space-y-2">
            {detail.students.map((student) => (
              <li
                key={student.id}
                className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/5"
              >
                <InitialsAvatar name={student.full_name} tone="slate" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{student.full_name}</p>
                  <Muted className="truncate text-xs">{student.email}</Muted>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold">Details</h3>
        <div className="space-y-3 rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Students</span>
            <Badge variant="outline" className="gap-1.5">
              <Users className="size-3" />
              {detail.student_count}
            </Badge>
          </div>
          {role === "teacher" && detail.class_code && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Class code</span>
              <CopyCodeButton code={detail.class_code} />
            </div>
          )}
          {role === "student" && detail.teacher?.full_name && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Teacher</span>
              <span className="font-semibold">{detail.teacher.full_name}</span>
            </div>
          )}
        </div>
        {role === "student" && (
          <LeaveClassDialog classId={classId} className={detail.name} />
        )}
      </div>
    </div>
  );
}

function useClassDetail(classId: string) {
  const fetcher = useCallback(() => classesApi.detail(classId), [classId]);
  return useApiData(fetcher);
}

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);
  const { user } = useAuth();
  const role = user?.role?.name === "teacher" ? "teacher" : "student";

  const { data, status, error, refetch } = useClassDetail(classId);

  return (
    <>
      <AppSidebar sections={getSidebarSections(role)} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar
          title={data?.name ?? "Class"}
          subtitle={role === "teacher" ? "Manage class" : "View class"}
        >
          {role === "teacher" && (
            <Button
              className="gap-1.5 font-semibold"
              nativeButton={false}
              render={<Link href={`/classes/${classId}/quizzes/new`} />}
            >
              <Plus />
              Create Quiz
            </Button>
          )}
        </AppTopbar>

        <main className="p-6 lg:p-8">
          {status === "loading" && (
            <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading class…
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={refetch}>
                Try again
              </Button>
            </div>
          )}

          {status === "success" && data && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTab value="overview">Overview</TabsTab>
                <TabsTab value="materials">Materials</TabsTab>
                <TabsTab value="quizzes">Quizzes</TabsTab>
                {role === "teacher" && (
                  <>
                    <TabsTab value="analytics">Analytics</TabsTab>
                    <TabsTab value="ai-usage">AI Usage</TabsTab>
                  </>
                )}
              </TabsList>
              <TabsPanel value="overview">
                <OverviewTab classId={classId} detail={data} role={role} />
              </TabsPanel>
              <TabsPanel value="materials">
                <ClassMaterialsTab classId={classId} role={role} />
              </TabsPanel>
              <TabsPanel value="quizzes">
                <ClassQuizzesTab classId={classId} role={role} />
              </TabsPanel>
              {role === "teacher" && (
                <>
                  <TabsPanel value="analytics">
                    <ClassAnalyticsTab classId={classId} />
                  </TabsPanel>
                  <TabsPanel value="ai-usage">
                    <ClassAiUsageTab classId={classId} />
                  </TabsPanel>
                </>
              )}
            </Tabs>
          )}
        </main>
      </div>
    </>
  );
}
