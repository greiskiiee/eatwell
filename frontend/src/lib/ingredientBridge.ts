import type { CatalogIngredient } from "./ingredientCatalog";
import type { USDAFood } from "./usda";

export type UsdaMealDbMatch = {
  mealDbName: string;
  mealDbKey: string;
  nameMn: string;
  matchKind: "catalog-key" | "catalog-word" | "fallback";
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalizeMealDbName(word: string) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Map a USDA food entry to the MealDB ingredient name used for recipe search. */
export function usdaToMealDbMatch(
  food: USDAFood,
  catalog: CatalogIngredient[],
): UsdaMealDbMatch | null {
  const desc = food.description.toLowerCase();
  if (!desc.trim()) return null;

  const sorted = [...catalog].sort(
    (a, b) => b.mealDbKey.length - a.mealDbKey.length,
  );

  for (const item of sorted) {
    const key = item.mealDbKey;
    if (!key) continue;
    const re = new RegExp(`\\b${escapeRegex(key)}\\b`, "i");
    if (re.test(desc)) {
      return {
        mealDbName: item.mealDbName,
        mealDbKey: item.mealDbKey,
        nameMn: item.nameMn,
        matchKind: "catalog-key",
      };
    }
  }

  const words = desc
    .split(/[\s,()]+/)
    .map((w) => w.replace(/[^a-z0-9-]/gi, ""))
    .filter((w) => w.length >= 3);

  for (const word of words) {
    const item = catalog.find((c) => c.mealDbKey === word);
    if (item) {
      return {
        mealDbName: item.mealDbName,
        mealDbKey: item.mealDbKey,
        nameMn: item.nameMn,
        matchKind: "catalog-word",
      };
    }
  }

  const first = words[0];
  if (!first) return null;

  const partial = catalog.find(
    (c) => c.mealDbKey.startsWith(first) || first.startsWith(c.mealDbKey),
  );
  if (partial) {
    return {
      mealDbName: partial.mealDbName,
      mealDbKey: partial.mealDbKey,
      nameMn: partial.nameMn,
      matchKind: "fallback",
    };
  }

  return {
    mealDbName: capitalizeMealDbName(first),
    mealDbKey: first,
    nameMn: food.description,
    matchKind: "fallback",
  };
}

export function usdaToMealDbName(
  food: USDAFood,
  catalog: CatalogIngredient[],
): string | null {
  return usdaToMealDbMatch(food, catalog)?.mealDbName ?? null;
}
