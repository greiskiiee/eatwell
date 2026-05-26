/** User allergens are stored as MealDB-style English names (e.g. "Chicken", "milk"). */

export function lineContainsAllergen(line: string, allergen: string): boolean {
  const a = allergen.trim().toLowerCase();
  if (!a) return false;
  const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Allow simple plurals: egg → eggs, tomato → tomatoes (not perfect but practical)
  return new RegExp(`\\b${escaped}(?:es|s)?\\b`, "i").test(line);
}

/** Returns user allergen strings that appear in any recipe ingredient line. */
export function getMatchingAllergens(
  recipeIngredientLines: string[],
  userAllergens: string[],
): string[] {
  const list = userAllergens.map((a) => a.trim()).filter(Boolean);
  if (list.length === 0 || recipeIngredientLines.length === 0) return [];

  const matched: string[] = [];
  for (const allergen of list) {
    if (recipeIngredientLines.some((line) => lineContainsAllergen(line, allergen))) {
      matched.push(allergen);
    }
  }
  return matched;
}

export function recipeHasAllergen(
  recipeIngredientLines: string[],
  userAllergens: string[],
): boolean {
  return getMatchingAllergens(recipeIngredientLines, userAllergens).length > 0;
}
