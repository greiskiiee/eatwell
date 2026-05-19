import { apiFetch, API_BASE_URL } from "./api";
import { getStoredToken } from "./auth";

export type TechnologistRecipe = {
  _id: string;
  title: string;
  description?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  tags?: string[];
  ingredients?: string[];
  steps?: string[];
  nutrition?: {
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
  };
  isDraft?: boolean;
  isPremium?: boolean;
  price?: number;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export function recipeCoverImage(recipe: TechnologistRecipe): string {
  return recipe.imageUrls?.[0] ?? recipe.imageUrl ?? "";
}

export const recipeApi = {
  list: (params?: { limit?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.q?.trim()) qs.set("q", params.q.trim());
    const query = qs.toString();
    return apiFetch<TechnologistRecipe[]>(
      `/api/recipes${query ? `?${query}` : ""}`,
    );
  },

  mine: () =>
    apiFetch<TechnologistRecipe[]>("/api/recipes/mine", { token: token() }),

  get: (id: string) => apiFetch<TechnologistRecipe>(`/api/recipes/${id}`),

  create: (body: Record<string, unknown>) =>
    apiFetch<TechnologistRecipe>("/api/recipes", {
      method: "POST",
      token: token(),
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Record<string, unknown>) =>
    apiFetch<TechnologistRecipe>(`/api/recipes/${id}`, {
      method: "PATCH",
      token: token(),
      body: JSON.stringify(body),
    }),
};

export function certificateImageUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}
