"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, TrendingUp, Users, CheckCircle, Zap } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { DashboardData, ProgressData } from "@/types/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const isTeacher = user?.role?.name === "teacher";

      if (isTeacher) {
        const data = await analyticsApi.dashboard();
        setDashboardData(data);
      } else {
        const data = await analyticsApi.progress();
        setProgressData(data);
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
    // Deferred a tick so the state updates inside loadAnalytics() happen in a
    // promise callback rather than synchronously in the effect body.
    Promise.resolve().then(() => loadAnalytics());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTeacher = user?.role?.name === "teacher";

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isTeacher ? "View performance across all your classes" : "Track your learning progress"}
        </p>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
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
              <div className="text-sm text-muted-foreground">Loading analytics...</div>
            </div>
          )}

          {!loading && isTeacher && dashboardData && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Total Classes</span>}
                  action={<Users className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">{dashboardData.total_classes}</p>
                </DashboardCard>

                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Avg Score</span>}
                  action={<TrendingUp className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">
                    {(
                      (dashboardData.statistics?.reduce(
                        (sum, s) =>
                          sum +
                          (typeof s.statistics.average_score === "number"
                            ? s.statistics.average_score
                            : 0),
                        0,
                      ) ?? 0) / Math.max(dashboardData.statistics?.length || 1, 1)
                    ).toFixed(1)}
                    %
                  </p>
                </DashboardCard>

                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Quizzes Taken</span>}
                  action={<CheckCircle className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">
                    {dashboardData.statistics?.reduce((sum, s) => sum + s.statistics.total_quizzes_taken, 0)}
                  </p>
                </DashboardCard>

                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Total AI Uses</span>}
                  action={<Zap className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">
                    {dashboardData.statistics?.reduce((sum, s) => sum + s.ai_usage.total_requests, 0)}
                  </p>
                </DashboardCard>
              </div>

              {/* Class Performance Chart */}
              {dashboardData.statistics.length > 0 && (
                <DashboardCard title="Class Performance">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.statistics}>
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
                      <Bar dataKey="statistics.average_score" fill="#3b82f6" name="Avg Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </DashboardCard>
              )}

              {/* Per-Class Details */}
              {dashboardData.statistics.map((stat) => (
                <DashboardCard key={stat.class_id} title={stat.class_name}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Quizzes Taken</p>
                      <p className="text-lg font-bold">{stat.statistics.total_quizzes_taken}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Average Score</p>
                      <p className="text-lg font-bold">
                        {typeof stat.statistics.average_score === "number"
                          ? stat.statistics.average_score.toFixed(1)
                          : stat.statistics.average_score}
                        %
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Highest Score</p>
                      <p className="text-lg font-bold">{stat.statistics.highest_score}%</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">AI Requests</p>
                      <p className="text-lg font-bold">{stat.ai_usage.total_requests}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">
                      AI Usage Breakdown
                    </p>
                    {stat.ai_usage.total_requests === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No AI activity in this class yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Chat</p>
                          <p className="text-lg font-bold">{stat.ai_usage.by_type.chat}</p>
                        </div>
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Hints</p>
                          <p className="text-lg font-bold">{stat.ai_usage.by_type.hint}</p>
                        </div>
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Explanations</p>
                          <p className="text-lg font-bold">{stat.ai_usage.by_type.explanation}</p>
                        </div>
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Unique Users</p>
                          <p className="text-lg font-bold">{stat.ai_usage.unique_users}</p>
                        </div>
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Tokens Used</p>
                          <p className="text-lg font-bold">{stat.ai_usage.total_tokens}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </DashboardCard>
              ))}
            </>
          )}

          {!loading && !isTeacher && progressData && (
            <>
              {/* Student Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Quizzes Completed</span>}
                  action={<CheckCircle className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">{progressData.completed_quizzes}</p>
                </DashboardCard>

                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Average Score</span>}
                  action={<TrendingUp className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">{progressData.average_score.toFixed(1)}%</p>
                </DashboardCard>

                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Best Score</span>}
                  action={<TrendingUp className="size-8 text-primary/50" />}
                >
                  <p className="text-3xl font-bold">{progressData.best_score}%</p>
                </DashboardCard>

                <DashboardCard
                  title={<span className="text-sm text-muted-foreground">Learning Mode</span>}
                  action={<Zap className="size-8 text-primary/50" />}
                >
                  <p className="text-sm font-semibold">
                    {progressData.quizzes[0]?.learning_mode || "Normal"}
                  </p>
                </DashboardCard>
              </div>

              {/* Student Quiz History */}
              {progressData.quizzes.length > 0 && (
                <DashboardCard title="Quiz History">
                  <div className="space-y-3">
                    {progressData.quizzes.map((attempt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded bg-muted/50">
                        <div>
                          <p className="font-medium">{attempt.quiz?.title || "Quiz"}</p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.completed_at
                              ? new Date(attempt.completed_at).toLocaleDateString()
                              : "Not completed"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{attempt.percentage_score || 0}%</p>
                          <p className="text-xs text-muted-foreground">{attempt.learning_mode}</p>
                        </div>
                      </div>
                    ))}
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
