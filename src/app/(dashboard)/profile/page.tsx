"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, Users, CheckCircle, Zap } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { DashboardData, ProgressData } from "@/types/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ==================== MOCK DATA ====================

const MOCK_DASHBOARD_DATA: DashboardData = {
  total_classes: 3,
  statistics: [
    {
      class_id: "mock-class-1",
      class_name: "Matematika Diskrit",
      statistics: {
        total_quizzes_taken: 12,
        average_score: 82.5,
        highest_score: 95,
        lowest_score: 0
      },
      ai_usage: {
        total_requests: 45,
        unique_users: 18,
        total_tokens: 12500,
        by_type: {
          chat: 20,
          hint: 10,
          explanation: 15,
        },
      },
    },
    {
      class_id: "mock-class-2",
      class_name: "Struktur Data",
      statistics: {
        total_quizzes_taken: 10,
        average_score: 78.3,
        highest_score: 92,
        lowest_score: 0
      },
      ai_usage: {
        total_requests: 32,
        unique_users: 15,
        total_tokens: 9800,
        by_type: {
          chat: 12,
          hint: 8,
          explanation: 12,
        },
      },
    },
    {
      class_id: "mock-class-3",
      class_name: "Pemrograman Web",
      statistics: {
        total_quizzes_taken: 15,
        average_score: 88.7,
        highest_score: 100,
        lowest_score: 0
      },
      ai_usage: {
        total_requests: 58,
        unique_users: 22,
        total_tokens: 15600,
        by_type: {
          chat: 28,
          hint: 12,
          explanation: 18,
        },
      },
    },
  ],
  teacher_id: ""
};

const MOCK_PROGRESS_DATA: ProgressData = {
  completed_quizzes: 8,
  average_score: 84.5,
  best_score: 96,
  quizzes: [
    {
      quiz: {
        title: "Quiz Matematika Diskrit",
        id: ""
      },
      completed_at: new Date().toISOString(),
      percentage_score: 92,
      learning_mode: "socratic",
    },
    {
      quiz: {
        title: "Quiz Struktur Data",
        id: ""
      },
      completed_at: new Date(
        Date.now() - 86400000 * 2
      ).toISOString(),
      percentage_score: 85,
      learning_mode: "normal",
    },
    {
      quiz: {
        title: "Quiz Pemrograman Web",
        id: ""
      },
      completed_at: new Date(
        Date.now() - 86400000 * 5
      ).toISOString(),
      percentage_score: 96,
      learning_mode: "normal",
    },
  ],
  student_id: ""
};

// ==================== COMPONENT ====================

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [progressData, setProgressData] =
    useState<ProgressData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [usingMockData, setUsingMockData] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      const isTeacher = user?.role?.name === "teacher";

      if (isTeacher) {
        try {
          const data = await analyticsApi.dashboard();
          setDashboardData(data);
        } catch (err) {
          // Jika API mengembalikan 500,
          // gunakan mock data
          if (err instanceof ApiError && err.status === 500) {
            console.warn(
              "Analytics dashboard API returned 500. ",
            );

            setDashboardData(MOCK_DASHBOARD_DATA);
            setUsingMockData(true);
          } else {
            throw err;
          }
        }
      } else {
        try {
          const data = await analyticsApi.progress();
          setProgressData(data);
        } catch (err) {
          // Jika API mengembalikan 500,
          // gunakan mock data
          if (err instanceof ApiError && err.status === 500) {
            console.warn(
              "Analytics progress API returned 500. Using mock data.",
            );

            setProgressData(MOCK_PROGRESS_DATA);
            setUsingMockData(true);
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadAnalytics());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTeacher = user?.role?.name === "teacher";

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isTeacher
            ? "View performance across all your classes"
            : "Track your learning progress"}
        </p>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Mock Data Warning */}
          {usingMockData && (
            <Alert>
              Analytics API is currently unavailable.
              Showing placeholder data instead.
            </Alert>
          )}

          {/* Non-500 Error */}
          {error && !usingMockData && (
            <Alert>
              {error}
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">
                Loading analytics...
              </div>
            </div>
          )}

          {/* ==================== TEACHER ==================== */}

          {!loading &&
            isTeacher &&
            dashboardData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Total Classes
                      </span>
                    }
                    action={
                      <Users className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {dashboardData.total_classes}
                    </p>
                  </DashboardCard>

                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Avg Score
                      </span>
                    }
                    action={
                      <TrendingUp className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {(
                        (dashboardData.statistics?.reduce(
                          (sum, s) =>
                            sum +
                            (typeof s.statistics.average_score ===
                            "number"
                              ? s.statistics.average_score
                              : 0),
                          0,
                        ) ?? 0) /
                        Math.max(
                          dashboardData.statistics?.length || 1,
                          1,
                        )
                      ).toFixed(1)}
                      %
                    </p>
                  </DashboardCard>

                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Quizzes Taken
                      </span>
                    }
                    action={
                      <CheckCircle className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {dashboardData.statistics?.reduce(
                        (sum, s) =>
                          sum +
                          s.statistics.total_quizzes_taken,
                        0,
                      )}
                    </p>
                  </DashboardCard>

                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Total AI Uses
                      </span>
                    }
                    action={
                      <Zap className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {dashboardData.statistics?.reduce(
                        (sum, s) =>
                          sum + s.ai_usage.total_requests,
                        0,
                      )}
                    </p>
                  </DashboardCard>
                </div>

                {dashboardData.statistics.length > 0 && (
                  <DashboardCard title="Class Performance">
                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >
                      <BarChart
                        data={dashboardData.statistics}
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          dataKey="class_name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                          dataKey="statistics.average_score"
                          fill="#3b82f6"
                          name="Avg Score"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </DashboardCard>
                )}

                {dashboardData.statistics.map((stat) => (
                  <DashboardCard
                    key={stat.class_id}
                    title={stat.class_name}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">
                          Quizzes Taken
                        </p>
                        <p className="text-lg font-bold">
                          {stat.statistics.total_quizzes_taken}
                        </p>
                      </div>

                      <div className="p-3 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">
                          Average Score
                        </p>
                        <p className="text-lg font-bold">
                          {typeof stat.statistics.average_score ===
                          "number"
                            ? stat.statistics.average_score.toFixed(1)
                            : stat.statistics.average_score}
                          %
                        </p>
                      </div>

                      <div className="p-3 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">
                          Highest Score
                        </p>
                        <p className="text-lg font-bold">
                          {stat.statistics.highest_score}%
                        </p>
                      </div>

                      <div className="p-3 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">
                          AI Requests
                        </p>
                        <p className="text-lg font-bold">
                          {stat.ai_usage.total_requests}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                ))}
              </>
            )}

          {/* ==================== STUDENT ==================== */}

          {!loading &&
            !isTeacher &&
            progressData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Quizzes Completed
                      </span>
                    }
                    action={
                      <CheckCircle className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {progressData.completed_quizzes}
                    </p>
                  </DashboardCard>

                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Average Score
                      </span>
                    }
                    action={
                      <TrendingUp className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {progressData.average_score.toFixed(1)}%
                    </p>
                  </DashboardCard>

                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Best Score
                      </span>
                    }
                    action={
                      <TrendingUp className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-3xl font-bold">
                      {progressData.best_score}%
                    </p>
                  </DashboardCard>

                  <DashboardCard
                    title={
                      <span className="text-sm text-muted-foreground">
                        Learning Mode
                      </span>
                    }
                    action={
                      <Zap className="size-8 text-primary/50" />
                    }
                  >
                    <p className="text-sm font-semibold">
                      {progressData.quizzes[0]?.learning_mode ||
                        "Normal"}
                    </p>
                  </DashboardCard>
                </div>

                {progressData.quizzes.length > 0 && (
                  <DashboardCard title="Quiz History">
                    <div className="space-y-3">
                      {progressData.quizzes.map(
                        (attempt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">
                                {attempt.quiz?.title ||
                                  "Quiz"}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {attempt.completed_at
                                  ? new Date(
                                      attempt.completed_at,
                                    ).toLocaleDateString()
                                  : "Not completed"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold">
                                {attempt.percentage_score || 0}%
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {attempt.learning_mode}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </DashboardCard>
                )}
              </>
            )}
        </div>
      </main>
    </div>
  );
}