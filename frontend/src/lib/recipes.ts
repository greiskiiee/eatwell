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
  locked?: boolean;
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
  list: (params?: {
    limit?: number;
    q?: string;
    ingredients?: string[];
    ingredientGroups?: string[][];
    tags?: string[];
    maxMinutes?: number | null;
  }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.q?.trim()) qs.set("q", params.q.trim());
    if (params?.ingredientGroups?.length) {
      qs.set("ingredientGroups", JSON.stringify(params.ingredientGroups));
    } else if (params?.ingredients?.length) {
      qs.set("ingredients", params.ingredients.join(","));
    }
    if (params?.tags?.length) {
      qs.set("tags", params.tags.join(","));
    }
    if (params?.maxMinutes != null && params.maxMinutes > 0) {
      qs.set("maxMinutes", String(params.maxMinutes));
    }
    const query = qs.toString();
    return apiFetch<TechnologistRecipe[]>(
      `/api/recipes${query ? `?${query}` : ""}`,
    );
  },

  tags: () => apiFetch<string[]>("/api/recipes/tags"),

  mine: () =>
    apiFetch<TechnologistRecipe[]>("/api/recipes/mine", { token: token() }),

  get: (id: string) =>
    apiFetch<TechnologistRecipe>(`/api/recipes/${id}`, {
      token: getStoredToken() ?? undefined,
    }),

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
