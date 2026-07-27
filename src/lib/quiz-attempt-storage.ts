import type { AttemptStartData, AttemptSubmitData } from "@/types/api";

/**
 * The backend has no `GET` endpoint to re-fetch a quiz attempt or its result
 * by id — `AttemptStartData`/`AttemptSubmitData` only ever exist as the
 * direct response of `startAttempt`/`submitAttempt`. sessionStorage relays
 * that real response across the unavoidable client-side navigation between
 * the quiz, attempt, and result pages; it never invents data, and a missing
 * entry (e.g. after a reload) is treated as genuinely unavailable rather
 * than backfilled with placeholders.
 */
const ATTEMPT_PREFIX = "relearn.quiz-attempt.";
const RESULT_PREFIX = "relearn.quiz-result.";

export function saveQuizAttempt(attemptId: string, data: AttemptStartData) {
  sessionStorage.setItem(ATTEMPT_PREFIX + attemptId, JSON.stringify(data));
}

export function loadQuizAttempt(attemptId: string): AttemptStartData | null {
  const raw = sessionStorage.getItem(ATTEMPT_PREFIX + attemptId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AttemptStartData;
  } catch {
    return null;
  }
}

export function clearQuizAttempt(attemptId: string) {
  sessionStorage.removeItem(ATTEMPT_PREFIX + attemptId);
}

export function saveQuizResult(attemptId: string, data: AttemptSubmitData) {
  sessionStorage.setItem(RESULT_PREFIX + attemptId, JSON.stringify(data));
}

export function loadQuizResult(attemptId: string): AttemptSubmitData | null {
  const raw = sessionStorage.getItem(RESULT_PREFIX + attemptId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AttemptSubmitData;
  } catch {
    return null;
  }
}
