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
