"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, HelpCircle, AlertCircle, BookOpen } from "lucide-react";
import { quizzesApi, classesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { ApiQuiz, ClassDetailData } from "@/types/api";

export default function QuizzesPage() {
  const params = useParams();
  const { user } = useAuth();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassDetailData | null>(null);
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classDetail] = await Promise.all([
        classesApi.detail(classId),
      ]);
      setClassData(classDetail);
      
      // Note: We would fetch quizzes here when the backend endpoint is available
      // For now, showing placeholder
      setQuizzes([]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load quizzes");
      }
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = user?.role?.name === "teacher";

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href={`/classrooms/${classId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Class
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isTeacher ? "Create and manage quizzes for your class" : "Take quizzes and track your progress"}
              </p>
            </div>
            {isTeacher && (
              <Link href={`/classrooms/${classId}/quizzes/create`}>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Create Quiz
                </Button>
              </Link>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading quizzes...</div>
            </div>
          )}

          {!loading && quizzes.length === 0 && (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <HelpCircle className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold">No quizzes yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isTeacher ? "Create your first quiz to assess student learning" : "Your teacher hasn't created any quizzes yet"}
              </p>
              {isTeacher && (
                <Link href={`/classrooms/${classId}/quizzes/create`}>
                  <Button className="mt-4 gap-2">
                    <Plus className="size-4" />
                    Create Quiz
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!loading && quizzes.length > 0 && (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Link key={quiz.id} href={`/classrooms/${classId}/quizzes/${quiz.id}`}>
                  <DashboardCard className="p-4 hover:shadow-lg hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {quiz.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`text-xs px-2 py-1 rounded ${quiz.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {quiz.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </DashboardCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
