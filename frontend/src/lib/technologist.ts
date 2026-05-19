import { apiFetch } from "./api";
import { getStoredToken } from "./auth";

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export type TechnologistProfile = {
  displayName: string;
  credentials: string;
  bio: string;
  certificateUrl?: string;
  approvalStatus?: string;
};

export const technologistApi = {
  getProfile: () =>
    apiFetch<TechnologistProfile>("/api/technologist/me", { token: token() }),

  updateProfile: (body: {
    credentials?: string;
    bio?: string;
    displayName?: string;
  }) =>
    apiFetch<TechnologistProfile>("/api/technologist/me", {
      method: "PATCH",
      token: token(),
      body: JSON.stringify(body),
    }),
};
