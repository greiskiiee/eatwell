import { apiFetch } from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "technologist" | "admin";
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

export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (params: { name: string; email: string; password: string; role?: AuthUser["role"] }) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  me: (token: string) => apiFetch<AuthUser>("/api/auth/me", { token }),
};

