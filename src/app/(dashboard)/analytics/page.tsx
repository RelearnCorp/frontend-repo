"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, TrendingUp, Users, CheckCircle, Zap } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { DashboardData, ProgressData } from "@/types/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

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
                   title="this is analytics "
                  description="Teacher can view the analytics of their class here">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Classes</p>
                      <p className="text-3xl font-bold mt-2">{dashboardData.total_classes}</p>
                    </div>
                    <Users className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>

                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-3xl font-bold mt-2">
                        {(
                          (dashboardData.statistics?.reduce(
                            (sum, s) =>
                              sum +
                              (typeof s.statistics.average_score === "number"
                                ? s.statistics.average_score
                                : 0),
                            0
                          ) ?? 0) /
                          Math.max(dashboardData.statistics?.length ?? 0, 1)
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <TrendingUp className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>

                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                      <p className="text-3xl font-bold mt-2">
                        {dashboardData.statistics
                          ?.reduce((sum, s) => sum + s.statistics.total_quizzes_taken, 0)}
                      </p>
                    </div>
                    <CheckCircle className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>

                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total AI Uses</p>
                      <p className="text-3xl font-bold mt-2">
                        {dashboardData.statistics
                          ?.reduce((sum, s) => sum + s.ai_usage.total_requests, 0)}
                      </p>
                    </div>
                    <Zap className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>
              </div>

              {/* Class Performance Chart */}
              {dashboardData.statistics.length > 0 && (
                <DashboardCard>
                  <h3 className="font-semibold mb-4">Class Performance</h3>
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
                <DashboardCard key={stat.class_id}>
                  <h3 className="font-semibold mb-4">{stat.class_name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                </DashboardCard>
              ))}
            </>
          )}

          {!loading && !isTeacher && progressData && (
            <>
              {/* Student Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                      <p className="text-3xl font-bold mt-2">{progressData.completed_quizzes}</p>
                    </div>
                    <CheckCircle className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>

                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-3xl font-bold mt-2">{progressData.average_score.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>

                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Best Score</p>
                      <p className="text-3xl font-bold mt-2">{progressData.best_score}%</p>
                    </div>
                    <TrendingUp className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>

                <DashboardCard>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Learning Mode</p>
                      <p className="text-sm font-semibold mt-2">
                        {progressData.quizzes[0]?.learning_mode || "Normal"}
                      </p>
                    </div>
                    <Zap className="size-8 text-primary/50" />
                  </div>
                </DashboardCard>
              </div>

              {/* Student Quiz History */}
              {progressData.quizzes.length > 0 && (
                <DashboardCard>
                  <h3 className="font-semibold mb-4">Quiz History</h3>
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
