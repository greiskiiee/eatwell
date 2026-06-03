export interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  // ingredients (MealDB stores them as strIngredient1...20)
  [key: string]: string | null;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBIngredient {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string | null;
  strThumb?: string | null;
}

export interface MealDBFilterMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

const BASE = "https://www.themealdb.com/api/json/v1/1";

/** Max meals returned for category / ingredient browse lists */
export const MEALDB_LIST_LIMIT = 100;

function mealFromFilter(
  partial: MealDBFilterMeal,
  extras: Pick<MealDBRecipe, "strCategory" | "strArea"> = {
    strCategory: "",
    strArea: "",
  },
): MealDBRecipe {
  return {
    idMeal: partial.idMeal,
    strMeal: partial.strMeal,
    strMealThumb: partial.strMealThumb,
    strCategory: extras.strCategory,
    strArea: extras.strArea,
    strInstructions: "",
    strTags: null,
    strYoutube: null,
  };
}

export async function searchMeals(query: string): Promise<MealDBRecipe[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return dedupeMealsById(data.meals ?? []);
}

export async function getMealsByCategory(
  category: string,
  limit = MEALDB_LIST_LIMIT,
): Promise<MealDBRecipe[]> {
  const res = await fetch(
    `${BASE}/filter.php?c=${encodeURIComponent(category)}`,
  );
  const data = await res.json();
  const meals: MealDBFilterMeal[] = data.meals ?? [];
  return dedupeMealsById(
    meals
      .slice(0, limit)
      .map((m) => mealFromFilter(m, { strCategory: category, strArea: "" })),
  );
}

export async function getMealById(id: string): Promise<MealDBRecipe | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] ?? null;
}

export async function getRandomMeals(count = 10): Promise<MealDBRecipe[]> {
  const results = await Promise.all(
    Array.from({ length: count }, () =>
      fetch(`${BASE}/random.php`)
        .then((r) => r.json())
        .then((d) => d.meals?.[0]),
    ),
  );
  return dedupeMealsById(results.filter(Boolean));
}

export async function getCategories(): Promise<MealDBCategory[]> {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories ?? [];
}

/** All category names — list.php?c=list */
export async function getCategoryList(): Promise<string[]> {
  const res = await fetch(`${BASE}/list.php?c=list`);
  const data = await res.json();
  const meals: { strCategory?: string }[] = data.meals ?? [];
  return meals
    .map((m) => m.strCategory?.trim())
    .filter((c): c is string => Boolean(c));
}

/** All area names — list.php?a=list */
export async function getAreaList(): Promise<string[]> {
  const res = await fetch(`${BASE}/list.php?a=list`);
  const data = await res.json();
  const meals: { strArea?: string }[] = data.meals ?? [];
  return meals
    .map((m) => m.strArea?.trim())
    .filter((a): a is string => Boolean(a));
}

/** All ingredients — list.php?i=list */
export async function getAllIngredients(): Promise<MealDBIngredient[]> {
  const res = await fetch(`${BASE}/list.php?i=list`);
  const data = await res.json();
  return data.meals ?? [];
}

export function dedupeMealsById(meals: MealDBRecipe[]): MealDBRecipe[] {
  const seen = new Set<string>();
  const out: MealDBRecipe[] = [];
  for (const meal of meals) {
    if (seen.has(meal.idMeal)) continue;
    seen.add(meal.idMeal);
    out.push(meal);
  }
  return out;
}

export async function filterMealsByIngredient(
  ingredient: string,
): Promise<MealDBFilterMeal[]> {
  const res = await fetch(
    `${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`,
  );
  const data = await res.json();
  return data.meals ?? [];
}

/** Merge filter results: recipes matching any ingredient, best overlap first. */
export function mergeFilterMealsAny(
  lists: MealDBFilterMeal[][],
  limit = MEALDB_LIST_LIMIT,
): MealDBRecipe[] {
  const scored = new Map<string, { meal: MealDBFilterMeal; matches: number }>();

  for (const list of lists) {
    for (const meal of list) {
      const existing = scored.get(meal.idMeal);
      if (existing) existing.matches += 1;
      else scored.set(meal.idMeal, { meal, matches: 1 });
    }
  }

  return [...scored.values()]
    .sort(
      (a, b) =>
        b.matches - a.matches ||
        a.meal.strMeal.localeCompare(b.meal.strMeal),
    )
    .slice(0, limit)
    .map(({ meal }) => mealFromFilter(meal));
}

/** Merge filter results: only recipes containing every ingredient. */
export function mergeFilterMealsAll(
  lists: MealDBFilterMeal[][],
  limit = MEALDB_LIST_LIMIT,
): MealDBRecipe[] {
  if (lists.length === 0) return [];

  const byId = new Map<string, MealDBFilterMeal>();
  for (const meal of lists[0] ?? []) {
    byId.set(meal.idMeal, meal);
  }

  const common = [...byId.values()].filter((meal) =>
    lists.every((list) => list.some((m) => m.idMeal === meal.idMeal)),
  );

  return common.slice(0, limit).map((m) => mealFromFilter(m));
}

export async function getMealsByIngredient(
  ingredient: string,
  limit = MEALDB_LIST_LIMIT,
): Promise<MealDBRecipe[]> {
  const partial = await filterMealsByIngredient(ingredient);
  return partial.slice(0, limit).map((m) => mealFromFilter(m));
}

/** Meals matching selected ingredients (any match; best overlap first). */
export async function getMealsByIngredients(
  ingredients: string[],
  limit = MEALDB_LIST_LIMIT,
): Promise<MealDBRecipe[]> {
  if (ingredients.length === 0) return [];

  const lists = await Promise.all(
    ingredients.map((ing) => filterMealsByIngredient(ing)),
  );

  return mergeFilterMealsAny(lists, limit);
}

/** Meals that contain every selected ingredient (strict). */
export async function getMealsByAllIngredients(
  ingredients: string[],
  limit = MEALDB_LIST_LIMIT,
): Promise<MealDBRecipe[]> {
  if (ingredients.length === 0) return [];

  const lists = await Promise.all(
    ingredients.map((ing) => filterMealsByIngredient(ing)),
  );

  return mergeFilterMealsAll(lists, limit);
}

async function unionMealsForIngredients(
  ingredients: string[],
): Promise<Map<string, MealDBFilterMeal>> {
  const byId = new Map<string, MealDBFilterMeal>();
  const lists = await Promise.all(ingredients.map((ing) => filterMealsByIngredient(ing)));
  for (const list of lists) {
    for (const meal of list) {
      if (!byId.has(meal.idMeal)) byId.set(meal.idMeal, meal);
    }
  }
  return byId;
}

/**
 * AND across groups, OR within a group.
 * Example: [[Ground Beef, Beef Brisket], [Rice]] means (beef* AND rice).
 */
export async function getMealsByIngredientGroups(
  groups: string[][],
  limit = MEALDB_LIST_LIMIT,
): Promise<MealDBRecipe[]> {
  const clean = groups
    .map((g) => [...new Set(g.map((x) => x.trim()).filter(Boolean))])
    .filter((g) => g.length > 0);
  if (clean.length === 0) return [];

  const unionMaps = await Promise.all(clean.map((g) => unionMealsForIngredients(g)));

  let commonIds = new Set<string>([...unionMaps[0]!.keys()]);
  for (const map of unionMaps.slice(1)) {
    commonIds = new Set([...commonIds].filter((id) => map.has(id)));
  }

  // If no recipe contains ALL groups, fall back to "any match" so users still see results.
  // This avoids a confusing empty state when ingredient variants don't overlap perfectly.
  if (commonIds.size === 0) {
    const allMeals: MealDBFilterMeal[][] = [];
    for (const group of clean) {
      // fetch lists again per ingredient? we already have unionMaps (deduped).
      // Convert union map values to a list to use existing ranking.
      const m = await unionMealsForIngredients(group);
      allMeals.push([...m.values()]);
    }
    return mergeFilterMealsAny(allMeals, limit);
  }

  const first = unionMaps[0]!;
  const out: MealDBRecipe[] = [];
  for (const id of commonIds) {
    const meal = first.get(id) ?? unionMaps.find((m) => m.get(id))?.get(id);
    if (meal) out.push(mealFromFilter(meal));
  }

  return dedupeMealsById(
    out.sort((a, b) => a.strMeal.localeCompare(b.strMeal)).slice(0, limit),
  );
}

// Extract ingredients list from a MealDB recipe
export function extractIngredients(meal: MealDBRecipe): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(`${measure?.trim() ?? ""} ${ing.trim()}`.trim());
    }
  }
  return ingredients;
}
