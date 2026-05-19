import { apiFetch } from "./api";
import { getStoredToken } from "./auth";
import type { AuthUser } from "./auth";

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

type MeResponse = {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  allergens?: string[];
  avatarUrl?: string;
};

export function mapMeToAuthUser(data: MeResponse): AuthUser {
  return {
    id: data.id ?? String(data._id),
    email: data.email,
    name: data.name,
    role: data.role,
    allergens: data.allergens ?? [],
    avatarUrl: data.avatarUrl ?? "",
  };
}

export const usersApi = {
  me: () =>
    apiFetch<MeResponse>("/api/auth/me", { token: token() }).then(mapMeToAuthUser),

  update: (
    userId: string,
    body: { name?: string; password?: string; avatarUrl?: string },
  ) =>
    apiFetch<MeResponse>(`/api/users/${userId}`, {
      method: "PATCH",
      token: token(),
      body: JSON.stringify(body),
    }).then(mapMeToAuthUser),

  updateAllergens: (allergens: string[]) =>
    apiFetch<MeResponse>("/api/auth/allergens", {
      method: "PATCH",
      token: token(),
      body: JSON.stringify({ allergens }),
    }).then(mapMeToAuthUser),
};
