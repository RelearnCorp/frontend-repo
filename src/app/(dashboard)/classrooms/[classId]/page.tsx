"use client";

import { useEffect, useState,useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Users, AlertCircle, FileText, HelpCircle } from "lucide-react";
import { classesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { ClassDetailData } from "@/types/api";


export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadClassDetail();
  }, [classId]);

// eslint-disable-next-line react-hooks/preserve-manual-memoization
const loadClassDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await classesApi.detail(classId);

      if (!data) {
        setError("Class data not found");
        return;
      }

      setClassData(data);
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
    loadClassDetail();
  }, [loadClassDetail]);

  const isTeacher =
    user?.role?.name === "teacher" &&
    user?.id === classData?.teacher_id;
  const copyClassCode = () => {
    if (classData?.class_code) {
      navigator.clipboard.writeText(classData.class_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveClass = async () => {
    if (!confirm("Are you sure you want to leave this class?")) return;
    try {
      await classesApi.leave(classId);
      router.push("/classrooms");
    } catch (err) {
      alert("Failed to leave class");
    }
  };

  if (loading) {
    return (
      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading class...</div>
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
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error || "Class not found"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href="/classrooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Classrooms
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
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
            <DashboardCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Class Code</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share this code with students to let them join
                  </p>
                </div>
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
              </div>
            </DashboardCard>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Link href={`/classrooms/${classId}/materials`}>
              <Button variant="outline" className="gap-2">
                <FileText className="size-4" />
                Materials
              </Button>
            </Link>
            <Link href={`/classrooms/${classId}/quizzes`}>
              <Button variant="outline" className="gap-2">
                <HelpCircle className="size-4" />
                Quizzes
              </Button>
            </Link>
            {!isTeacher && (
              <Button
                variant="destructive"
                onClick={handleLeaveClass}
              >
                Leave Class
              </Button>
            )}
          </div>

          {/* Students List (for teachers) */}
          {isTeacher && (
            <DashboardCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-5" />
                    <h3 className="font-semibold">Students ({classData.students.length})</h3>
                  </div>
                </div>

                {classData.students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students enrolled yet</p>
                ) : (
                  <div className="space-y-2">
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
              </div>
            </DashboardCard>
          )}
        </div>
      </main>
    </div>
  );
}
