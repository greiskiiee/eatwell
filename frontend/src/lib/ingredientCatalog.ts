import { apiFetch } from "./api";
import { categorizeIngredient } from "./ingredientGroups";
import { getAllIngredients } from "./mealdb";

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

function normalizeMealDbKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

let catalogCache: CatalogIngredient[] | null = null;

/** @internal test helper */
export function resetIngredientCatalogCache() {
  catalogCache = null;
}

async function loadMealDbCatalog(): Promise<CatalogIngredient[]> {
  if (catalogCache) return catalogCache;
  const rows = await getAllIngredients();
  const built: CatalogIngredient[] = [];
  for (const row of rows) {
    const mealDbName = row.strIngredient?.trim() ?? "";
    if (!mealDbName) continue;
    built.push({
      mealDbKey: normalizeMealDbKey(mealDbName),
      mealDbName,
      nameMn: mealDbName,
      group: categorizeIngredient(mealDbName),
      thumb: row.strThumb?.trim() ?? "",
    });
  }
  catalogCache = built.sort((a, b) => a.mealDbName.localeCompare(b.mealDbName));
  return catalogCache;
}

/** Ingredient picker catalog from TheMealDB list.php?i=list */
export async function fetchIngredientCatalog(
  q?: string,
): Promise<CatalogIngredient[]> {
  const items = await loadMealDbCatalog();
  const query = q?.trim().toLowerCase();
  if (!query) return items;
  return items.filter(
    (i) =>
      i.mealDbName.toLowerCase().includes(query) ||
      i.nameMn.toLowerCase().includes(query) ||
      i.mealDbKey.includes(query),
  );
}

export async function fetchIngredientLabels(
  names: string[],
): Promise<IngredientLabels> {
  if (names.length === 0) return {};
  const data = await apiFetch<{ labels: IngredientLabels }>(
    "/api/ingredients/labels",
    {
      method: "POST",
      body: JSON.stringify({ names }),
    },
  );
  return data.labels;
}
