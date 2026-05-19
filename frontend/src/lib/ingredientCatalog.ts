import { apiFetch } from "./api";

export type CatalogIngredient = {
  mealDbKey: string;
  mealDbName: string;
  nameMn: string;
  group: string;
  thumb: string;
};

export type IngredientLabels = Record<
  string,
  { mealDbName: string; nameMn: string }
>;

export async function fetchIngredientCatalog(q?: string): Promise<CatalogIngredient[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  const path = `/api/ingredients${params.toString() ? `?${params}` : ""}`;
  const data = await apiFetch<{ items: CatalogIngredient[] }>(path);
  return data.items;
}

export async function fetchIngredientLabels(
  names: string[],
): Promise<IngredientLabels> {
  if (names.length === 0) return {};
  const data = await apiFetch<{ labels: IngredientLabels }>("/api/ingredients/labels", {
    method: "POST",
    body: JSON.stringify({ names }),
  });
  return data.labels;
}
