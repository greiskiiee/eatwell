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
  return data.meals ?? [];
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
  return meals
    .slice(0, limit)
    .map((m) => mealFromFilter(m, { strCategory: category, strArea: "" }));
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
  return results.filter(Boolean);
}

export async function getCategories(): Promise<MealDBCategory[]> {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories ?? [];
}

export async function getAllIngredients(): Promise<MealDBIngredient[]> {
  const res = await fetch(`${BASE}/list.php?i=list`);
  const data = await res.json();
  return data.meals ?? [];
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
