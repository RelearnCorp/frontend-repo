"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, BookOpen } from "lucide-react";
import { classesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { useAuth } from "@/hooks/use-auth";
import type { ApiClass } from "@/types/api";

export default function ClassroomsPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classesApi.list();
      setClasses(data.classes || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load classes");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Deferred a tick so the state updates inside loadClasses() happen in a
    // promise callback rather than synchronously in the effect body.
    Promise.resolve().then(() => loadClasses());
  }, []);

  const isTeacher = user?.role?.name === "teacher";

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Classrooms</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isTeacher
                ? "Create and manage your classes"
                : "Join and view your enrolled classes"}
            </p>
          </div>
          {isTeacher && (
            <Link href="/classrooms/create">
              <Button size="lg" className="gap-2">
                <Plus className="size-5" />
                Create Class
              </Button>
            </Link>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading classrooms...</div>
          </div>
        )}

        {error && <Alert>{error}</Alert>}

        {!loading && !error && classes.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="mx-auto size-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold">No classrooms yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isTeacher
                ? "Create your first class to get started"
                : "Ask your teacher for a class code to join a classroom"}
            </p>
          </div>
        )}

        {!loading && classes.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/classrooms/${cls.id}`}
                className="group"
              >
                <DashboardCard
                  title={cls.name}
                  titleRender={<h3 className="line-clamp-2 group-hover:text-primary transition-colors" />}
                  description={
                    cls.description ? (
                      <span className="line-clamp-2">{cls.description}</span>
                    ) : undefined
                  }
                  className="h-full transition-all hover:shadow-lg hover:border-primary/50"
                >
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="size-4" />
                      <span>{cls.student_count || 0} students</span>
                    </div>
                    {cls.teacher && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {cls.teacher.full_name}
                      </span>
                    )}
                  </div>
                </DashboardCard>
              </Link>
            ))}
          </div>
        )}

        {!isTeacher && !loading && classes.length > 0 && (
          <div className="mt-8 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Want to join another class? Ask your teacher for the class code.
            </p>
            <Link href="/classrooms/enroll">
              <Button variant="outline" size="sm" className="mt-4">
                Enter Class Code
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
