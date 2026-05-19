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

export async function searchMeals(query: string): Promise<MealDBRecipe[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealsByCategory(
  category: string,
): Promise<MealDBRecipe[]> {
  // filter endpoint returns partial data, so we fetch full details
  const res = await fetch(
    `${BASE}/filter.php?c=${encodeURIComponent(category)}`,
  );
  const data = await res.json();
  const meals: { idMeal: string }[] = data.meals ?? [];
  // fetch up to 12 full details in parallel
  const details = await Promise.all(
    meals.slice(0, 12).map((m) => getMealById(m.idMeal)),
  );
  return details.filter(Boolean) as MealDBRecipe[];
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

export async function getMealsByIngredient(
  ingredient: string,
  limit = 12,
): Promise<MealDBRecipe[]> {
  const partial = await filterMealsByIngredient(ingredient);
  const details = await Promise.all(
    partial.slice(0, limit).map((m) => getMealById(m.idMeal)),
  );
  return details.filter(Boolean) as MealDBRecipe[];
}

/** Meals that contain every selected ingredient */
export async function getMealsByIngredients(
  ingredients: string[],
  limit = 12,
): Promise<MealDBRecipe[]> {
  if (ingredients.length === 0) return [];

  const idSets = await Promise.all(
    ingredients.map(async (ing) => {
      const meals = await filterMealsByIngredient(ing);
      return new Set(meals.map((m) => m.idMeal));
    }),
  );

  const commonIds = [...idSets[0]!].filter((id) =>
    idSets.every((set) => set.has(id)),
  );

  const details = await Promise.all(
    commonIds.slice(0, limit).map((id) => getMealById(id)),
  );
  return details.filter(Boolean) as MealDBRecipe[];
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
