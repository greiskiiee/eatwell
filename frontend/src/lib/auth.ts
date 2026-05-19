import { apiFetch } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "technologist" | "admin";
  allergens?: string[];
  avatarUrl?: string;
};

export const AUTH_TOKEN_KEY = "chimge_token";
export const AUTH_USER_KEY = "chimge_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Prefer `useAuth().setAuth` in React components so context stays in sync. */
export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chimge-auth-change"));
  }
}

/** Prefer `useAuth().logout` in React components so context stays in sync. */
export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chimge-auth-change"));
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (params: {
    name: string;
    email: string;
    password: string;
    role?: AuthUser["role"];
  }) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  google: (idToken: string) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
  me: (token: string) => apiFetch<AuthUser>("/api/auth/me", { token }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyResetOtp: (email: string, otp: string) =>
    apiFetch<{ resetToken: string }>("/api/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (resetToken: string, password: string) =>
    apiFetch<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ resetToken, password }),
    }),
};
