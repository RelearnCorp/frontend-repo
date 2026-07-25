import type { ApiEnvelope, ApiUser } from "@/types/api";

/**
 * Backend lives in a separate Next.js app (RelearnCorp/Backend-repository).
 * Point NEXT_PUBLIC_API_URL at its origin (default assumes `PORT=3001`).
 */
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const API_BASE = `${API_ORIGIN.replace(/\/$/, "")}/api`;

const STORAGE_KEYS = {
  accessToken: "relearn.access_token",
  refreshToken: "relearn.refresh_token",
  user: "relearn.user",
} as const;

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Token storage (localStorage; no-ops during SSR)
// ---------------------------------------------------------------------------

export const tokenStore = {
  getAccessToken: () =>
    typeof window === "undefined"
      ? null
      : localStorage.getItem(STORAGE_KEYS.accessToken),
  getRefreshToken: () =>
    typeof window === "undefined"
      ? null
      : localStorage.getItem(STORAGE_KEYS.refreshToken),
  getUser: (): ApiUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ApiUser;
    } catch {
      return null;
    }
  },
  setSession: (token: string, refreshToken: string | null, user?: ApiUser) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};

// ---------------------------------------------------------------------------
// Core request with envelope unwrapping + one-shot refresh on 401
// ---------------------------------------------------------------------------

function parseFailure(body: ApiEnvelope<unknown> | null, status: number) {
  if (body && body.success === false) {
    const code =
      typeof body.error === "string"
        ? body.error
        : (body.error?.code ?? "UNKNOWN_ERROR");
    const message =
      body.message ??
      (typeof body.error === "object" ? body.error?.message : undefined) ??
      "Request failed";
    return new ApiError(code, message, status);
  }
  return new ApiError("UNKNOWN_ERROR", `Request failed (${status})`, status);
}

async function rawRequest<T>(
  path: string,
  init: RequestInit,
  { auth = true, retryOn401 = true }: { auth?: boolean; retryOn401?: boolean },
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = tokenStore.getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response; handled below
  }

  if (res.ok && body?.success) return body.data;

  if (res.status === 401 && auth && retryOn401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return rawRequest<T>(path, init, { auth, retryOn401: false });
    }
  }

  throw parseFailure(body, res.status);
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const data = await rawRequest<{ token: string }>(
      "/auth/refresh",
      { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) },
      { auth: false, retryOn401: false },
    );
    tokenStore.setSession(data.token, null);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

export const http = {
  get: <T>(path: string, opts?: { auth?: boolean }) =>
    rawRequest<T>(path, { method: "GET" }, { auth: opts?.auth ?? true }),
  post: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    rawRequest<T>(
      path,
      {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      { auth: opts?.auth ?? true },
    ),
  postForm: <T>(path: string, form: FormData) =>
    rawRequest<T>(path, { method: "POST", body: form }, { auth: true }),
};
