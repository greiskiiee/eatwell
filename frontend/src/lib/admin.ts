import { apiFetch } from "./api";
import { getStoredToken } from "./auth";
import type { CatalogIngredient } from "./ingredientCatalog";
import type {
  AdminStats,
  AdminUserRow,
  ApprovalApplication,
} from "./types-admin";

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export const adminApi = {
  getStats: () =>
    apiFetch<AdminStats>("/api/admin/stats", { token: token() }),

  listUsers: (params?: { q?: string; role?: string; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.q?.trim()) search.set("q", params.q.trim());
    if (params?.role && params.role !== "all") search.set("role", params.role);
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return apiFetch<{ users: AdminUserRow[]; total: number }>(
      `/api/admin/users${qs ? `?${qs}` : ""}`,
      { token: token() },
    );
  },

  listApplications: (status = "pending") =>
    apiFetch<ApprovalApplication[]>(
      `/api/admin/technologist-applications?status=${status}`,
      { token: token() },
    ),

  reviewApplication: (
    userId: string,
    action: "approve" | "reject",
    rejectionReason?: string,
  ) =>
    apiFetch<{ userId: string; approvalStatus: string }>(
      `/api/admin/technologist-applications/${userId}`,
      {
        method: "PATCH",
        token: token(),
        body: JSON.stringify({ action, rejectionReason }),
      },
    ),

  listIngredients: (q?: string) => {
    const params = new URLSearchParams({ limit: "2000" });
    if (q?.trim()) params.set("q", q.trim());
    return apiFetch<{ items: CatalogIngredient[]; total: number }>(
      `/api/ingredients?${params}`,
      { token: token() },
    );
  },

  updateIngredientNameMn: (mealDbKey: string, nameMn: string) =>
    apiFetch<CatalogIngredient>(
      `/api/ingredients/${encodeURIComponent(mealDbKey)}`,
      {
        method: "PATCH",
        token: token(),
        body: JSON.stringify({ nameMn }),
      },
    ),

  syncIngredients: () =>
    apiFetch<{ created: number; updated: number; total: number }>(
      "/api/ingredients/sync",
      { method: "POST", token: token() },
    ),
};
