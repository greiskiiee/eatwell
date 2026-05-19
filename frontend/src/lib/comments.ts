import { apiFetch } from "./api";
import { getStoredToken } from "./auth";

export type RecipeComment = {
  _id: string;
  recipeId: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
};

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export const commentsApi = {
  list: (recipeId: string) =>
    apiFetch<RecipeComment[]>(
      `/api/recipes/${encodeURIComponent(recipeId)}/comments`,
    ),

  create: (recipeId: string, body: string) =>
    apiFetch<RecipeComment>(
      `/api/recipes/${encodeURIComponent(recipeId)}/comments`,
      {
        method: "POST",
        token: token(),
        body: JSON.stringify({ body }),
      },
    ),
};
