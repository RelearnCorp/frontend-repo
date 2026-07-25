/**
 * Types for the Relearn backend (RelearnCorp/Backend-repository).
 *
 * Shapes mirror the actual route implementations (zod schemas +
 * sendSuccess/createSuccessResponse payloads), which take precedence over
 * FE_Integration.md where the two disagree — notably auth returns
 * `token`/`refreshToken` (camelCase) and `/ai/chat` requires `session_id`
 * with an optional free-text `context` instead of `learning_mode`.
 */

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
};

export type ApiFailure = {
  success: false;
  /** Either a plain code ("FORBIDDEN") or `{ code, message }` from error-handler */
  error: string | { code: string; message?: string };
  message?: string;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type RoleName = "teacher" | "student" | "admin";

export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  role_id?: string;
  role?: { id?: string; name: RoleName; permissions?: Record<string, boolean> };
  created_at?: string;
  updated_at?: string;
};

export type AuthData = {
  token: string;
  refreshToken: string;
  user: ApiUser;
};

export type RefreshData = { token: string };

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export type ApiClass = {
  id: string;
  name: string;
  description?: string | null;
  teacher_id?: string;
  teacher?: ApiUser | null;
  class_code?: string;
  student_count?: number;
  created_at?: string;
};

export type ClassListData = { classes: ApiClass[]; count: number };

export type ClassDetailData = ApiClass & {
  students: ApiUser[];
  student_count: number;
  updated_at?: string;
};

export type EnrollData = {
  class_id: string;
  class_name: string;
  teacher?: ApiUser | null;
};

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export type MaterialFileType = "pdf" | "text" | "image" | "video";

export type ApiMaterial = {
  id: string;
  class_id: string;
  title: string;
  content?: string | null;
  file_url?: string | null;
  file_type: MaterialFileType;
  created_by?: string;
  created_at: string;
};

export type MaterialListData = { materials: ApiMaterial[]; count: number };

export type MaterialUploadData = Pick<
  ApiMaterial,
  "id" | "title" | "file_url" | "file_type" | "created_at"
>;

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

export type LearningMode = "normal" | "socratic" | "explainable";

export type QuestionType = "multiple_choice" | "short_answer" | "essay";

export type ApiQuiz = {
  id: string;
  class_id: string;
  title: string;
  description?: string | null;
  is_published: boolean;
  created_at: string;
};

export type ApiQuestion = {
  id: string;
  quiz_id?: string;
  question_text?: string;
  question_type?: QuestionType;
  /** Some routes use `content`/`type` (DB column names) instead */
  content?: string;
  type?: QuestionType;
  options?: Record<string, string> | null;
  order_index: number;
  explanation?: string | null;
};

export type QuestionListData = { questions: ApiQuestion[]; count: number };

export type AttemptStartData = {
  attempt_id: string;
  quiz_id: string;
  learning_mode: LearningMode;
  questions: ApiQuestion[];
  total_questions: number;
  created_at: string;
};

export type QuizAnswer = { question_id: string; student_answer: string };

export type AttemptSubmitData = {
  attempt_id: string;
  score: number;
  total_questions: number;
  percentage_score: number;
  status: string;
  completed_at: string;
};

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

export type ChatData = {
  session_id: string;
  message: string;
  usage?: { input_tokens?: number; output_tokens?: number };
};

export type HintLevel = "1" | "2" | "3";

export type HintData = {
  hint: string;
  level: HintLevel;
  question_id: string;
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type ClassStatistics = {
  total_quizzes_taken: number;
  average_score: number | string;
  highest_score: number;
  lowest_score: number;
};

export type AiUsageStats = {
  total_requests: number;
  total_tokens: number;
  by_type: { chat: number; hint: number; explanation: number };
  unique_users: number;
};

export type DashboardData = {
  teacher_id: string;
  total_classes: number;
  statistics: {
    class_id: string;
    class_name: string;
    statistics: ClassStatistics;
    ai_usage: AiUsageStats;
  }[];
};

export type ProgressAttempt = {
  id?: string;
  quiz_id?: string;
  score?: number;
  percentage_score?: number;
  status?: string;
  learning_mode?: LearningMode;
  completed_at?: string;
  quiz?: { id: string; title: string } | null;
};

export type ProgressData = {
  student_id: string;
  completed_quizzes: number;
  average_score: number;
  best_score: number;
  quizzes: ProgressAttempt[];
};

export type AiUsageData = AiUsageStats & { class_id: string };

export type HealthData = {
  status: string;
  timestamp: string;
  environment?: string;
};
