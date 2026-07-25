import { http, tokenStore } from "@/services/http";
import type {
  AiUsageData,
  AttemptStartData,
  AttemptSubmitData,
  AuthData,
  ChatData,
  ClassDetailData,
  ClassListData,
  DashboardData,
  EnrollData,
  HealthData,
  HintData,
  HintLevel,
  LearningMode,
  MaterialListData,
  MaterialUploadData,
  ProgressData,
  QuestionListData,
  QuestionType,
  ApiQuestion,
  ApiQuiz,
  ApiClass,
  QuizAnswer,
  RefreshData,
} from "@/types/api";

/** Typed client for every endpoint in RelearnCorp/Backend-repository. */

export const authApi = {
  register: async (input: {
    email: string;
    password: string;
    full_name: string;
  }) => {
    const data = await http.post<AuthData>("/auth/register", input, {
      auth: false,
    });
    tokenStore.setSession(data.token, data.refreshToken, data.user);
    return data;
  },

  login: async (input: { email: string; password: string }) => {
    const data = await http.post<AuthData>("/auth/login", input, {
      auth: false,
    });
    tokenStore.setSession(data.token, data.refreshToken, data.user);
    return data;
  },

  refresh: (refresh_token: string) =>
    http.post<RefreshData>("/auth/refresh", { refresh_token }, { auth: false }),

  logout: async () => {
    const refresh_token = tokenStore.getRefreshToken();
    try {
      if (refresh_token) {
        await http.post("/auth/logout", { refresh_token });
      }
    } catch {
      // Best-effort server call — the local session is cleared below
      // regardless of network failure or an already-expired token.
    } finally {
      tokenStore.clear();
    }
  },
};

export const classesApi = {
  list: () => http.get<ClassListData>("/classes/list"),

  detail: (classId: string) =>
    http.get<ClassDetailData>(`/classes/${classId}`),

  create: (input: { name: string; description?: string }) =>
    http.post<ApiClass>("/classes/create", input),

  enroll: (class_code: string) =>
    http.post<EnrollData>("/classes/enroll", { class_code }),

  leave: (classId: string) =>
    http.post<{ message: string }>(`/classes/${classId}/leave`),
};

export const materialsApi = {
  list: (classId: string) =>
    http.get<MaterialListData>(
      `/materials/list?class_id=${encodeURIComponent(classId)}`,
    ),

  upload: (input: { file: File; class_id: string; title: string }) => {
    const form = new FormData();
    form.append("file", input.file);
    form.append("class_id", input.class_id);
    form.append("title", input.title);
    return http.postForm<MaterialUploadData>("/materials/upload", form);
  },
};

export const quizzesApi = {
  create: (input: {
    class_id: string;
    title: string;
    description?: string;
  }) => http.post<ApiQuiz>("/quizzes/create", input),

  addQuestion: (
    quizId: string,
    input: {
      question_text: string;
      question_type: QuestionType;
      options?: Record<string, string>;
      correct_answer: string;
    },
  ) => http.post<ApiQuestion>(`/quizzes/${quizId}/questions`, input),

  listQuestions: (quizId: string) =>
    http.get<QuestionListData>(`/quizzes/${quizId}/questions`),

  startAttempt: (quizId: string, learning_mode?: LearningMode) =>
    http.post<AttemptStartData>(`/quizzes/${quizId}/attempt`, {
      learning_mode,
    }),

  submitAttempt: (attemptId: string, answers: QuizAnswer[]) =>
    http.post<AttemptSubmitData>(`/quizzes/attempt/${attemptId}/submit`, {
      answers,
    }),
};

export const aiApi = {
  /**
   * Note: the backend requires an existing chat session row and has no
   * create-session endpoint yet; an unknown id returns SESSION_NOT_FOUND.
   * Callers should handle that error (and network failure) gracefully.
   */
  chat: (input: { session_id: string; message: string; context?: string }) =>
    http.post<ChatData>("/ai/chat", input),

  hint: (input: { question_id: string; hint_level?: HintLevel }) =>
    http.post<HintData>("/ai/hint", input),
};

export const analyticsApi = {
  dashboard: (classId?: string) =>
    http.get<DashboardData>(
      classId
        ? `/analytics/dashboard?class_id=${encodeURIComponent(classId)}`
        : "/analytics/dashboard",
    ),

  progress: (classId?: string) =>
    http.get<ProgressData>(
      classId
        ? `/analytics/progress?class_id=${encodeURIComponent(classId)}`
        : "/analytics/progress",
    ),

  aiUsage: (classId: string) =>
    http.get<AiUsageData>(
      `/analytics/ai-usage?class_id=${encodeURIComponent(classId)}`,
    ),
};

export const healthApi = {
  check: () => http.get<HealthData>("/health", { auth: false }),
};
