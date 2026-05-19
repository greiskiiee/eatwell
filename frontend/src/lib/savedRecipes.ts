import { apiFetch } from "./api";
import { getStoredToken } from "./auth";

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export const savedRecipesApi = {
  list: () =>
    apiFetch<{ recipeIds: string[] }>("/api/saved-recipes", { token: token() }),

  add: (recipeId: string) =>
    apiFetch<{ recipeId: string; saved: boolean }>("/api/saved-recipes", {
      method: "POST",
      token: token(),
      body: JSON.stringify({ recipeId }),
    }),

  remove: (recipeId: string) =>
    apiFetch<void>(`/api/saved-recipes/${encodeURIComponent(recipeId)}`, {
      method: "DELETE",
      token: token(),
    }),
};
