"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, LoaderCircle, Users, FileText, HelpCircle } from "lucide-react";
import { classesApi, materialsApi, quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ClassDetailData, ApiMaterial, ApiQuiz } from "@/types/api";

function LeaveClassButton({ classId }: { classId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    setError(null);
    setIsLeaving(true);
    try {
      await classesApi.leave(classId);
      router.push("/classrooms");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to leave class");
      setIsLeaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">Leave Class</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave this class?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You&apos;ll lose access to its materials and quizzes unless you
          rejoin with the class code.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="destructive" onClick={handleLeave} disabled={isLeaving}>
            {isLeaving && <LoaderCircle className="animate-spin mr-2 size-4" />}
            Leave Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ClassDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadClassDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [data, materialsData, quizzesData] = await Promise.all([
        classesApi.detail(classId),
        materialsApi.list(classId),
        quizzesApi.list(classId)
      ]);

      if (!data) {
        setError("Class data not found");
        return;
      }

      setClassData(data);
      setMaterials(materialsData.materials || []);
      setQuizzes(quizzesData.quizzes || []);
    } catch (err) {
      console.error("Failed to load class detail:", err);

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load class details");
      }
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    Promise.resolve().then(() => loadClassDetail());
  }, [loadClassDetail]);

  const isTeacher = user?.role?.name === "teacher" && user?.id === classData?.teacher_id;

  const copyClassCode = () => {
    if (classData?.class_code) {
      navigator.clipboard.writeText(classData.class_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf": return "📄";
      case "image": return "🖼️";
      case "video": return "🎬";
      case "text": return "📝";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <LoaderCircle className="animate-spin size-4" /> Loading class...
          </div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="border-b border-border px-6 py-4 lg:px-8">
          <Link href="/classrooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to Classrooms
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <Alert className="max-w-md">{error || "Class not found"}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8 flex items-center justify-between">
        <Link href="/classrooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Classrooms
        </Link>
        {!isTeacher && <LeaveClassButton classId={classId} />}
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Class Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
            {classData.description && (
              <p className="text-lg text-muted-foreground">{classData.description}</p>
            )}
            {classData.teacher && (
              <p className="text-sm text-muted-foreground">
                Taught by {classData.teacher.full_name}
              </p>
            )}
          </div>

          {/* Class Code Card (for teachers) */}
          {isTeacher && (
            <DashboardCard
              title="Class Code"
              description="Share this code with students to let them join"
            >
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded font-mono font-bold text-lg">
                  {classData.class_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyClassCode}
                  title={copied ? "Copied!" : "Copy code"}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </DashboardCard>
          )}

          {/* 2-Column Layout for Materials & Quizzes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Materials Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="size-5" /> Materials
                </h2>
                {isTeacher && (
                  <Link href={`/classrooms/${classId}/materials`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                )}
              </div>
              
              {materials.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No materials available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <DashboardCard
                      key={material.id}
                      title={material.title}
                      titleRender={<h3 className="text-sm font-medium truncate" />}
                      action={<span className="text-lg">{getFileIcon(material.file_type)}</span>}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => material.file_url && window.open(material.file_url, '_blank')}
                    >
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(material.created_at).toLocaleDateString()}
                      </div>
                    </DashboardCard>
                  ))}
                  {materials.length > 5 && (
                    <Link href={`/classrooms/${classId}/materials`} className="block text-center text-sm text-primary hover:underline">
                      View all {materials.length} materials
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Quizzes Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <HelpCircle className="size-5" /> Quizzes
                </h2>
                {isTeacher && (
                  <Link href={`/classrooms/${classId}/quizzes`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                )}
              </div>

              {quizzes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No quizzes available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <Link key={quiz.id} href={`/classrooms/${classId}/quizzes/${quiz.id}`} className="block group">
                      <DashboardCard
                        title={quiz.title}
                        titleRender={<h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors" />}
                        className="p-4 hover:border-primary/50 transition-all h-full"
                      >
                         <div className="text-xs text-muted-foreground mt-1">
                           {new Date(quiz.created_at).toLocaleDateString()}
                         </div>
                      </DashboardCard>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Students List (for teachers) */}
          {isTeacher && (
            <DashboardCard
              title={`Students (${classData.students.length})`}
              action={<Users className="size-5 text-muted-foreground" />}
            >
              {classData.students.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students enrolled yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {classData.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded border border-border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {student.role?.name || "student"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          )}
        </div>
      </main>
    </div>
  );
}
