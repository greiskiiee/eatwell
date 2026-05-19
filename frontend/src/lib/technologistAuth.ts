import { API_BASE_URL } from "./api";
import type { AuthUser } from "./auth";

export type TechnologistSignupResponse = {
  message: string;
  user: AuthUser & { approvalStatus: string };
};

export const technologistAuthApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/technologist-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error("Login failed") as Error & {
        status?: number;
        data?: unknown;
      };
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data as { token: string; user: AuthUser };
  },

  signup: async (form: FormData) => {
    const res = await fetch(`${API_BASE_URL}/api/technologist-auth/signup`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error("Signup failed") as Error & {
        status?: number;
        data?: unknown;
      };
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data as TechnologistSignupResponse;
  },
};
