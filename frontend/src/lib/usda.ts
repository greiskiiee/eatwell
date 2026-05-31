import {
  type IngredientEntry,
  ingredientToGrams,
} from "./ingredients";

export interface USDAFood {
  fdcId: number;
  description: string;
  nutrients: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
}

function dedupeFoods(foods: USDAFood[]): USDAFood[] {
  const seen = new Set<number>();
  const out: USDAFood[] = [];
  for (const food of foods) {
    if (seen.has(food.fdcId)) continue;
    seen.add(food.fdcId);
    out.push(food);
  }
  return out;
}

const PREPARED_FOOD =
  /\b(salad|soup|pie|sandwich|casserole|stew|prepared|as purchased|made with)\b/i;

export function scoreIngredientMatch(query: string, description: string): number {
  const q = query.trim().toLowerCase();
  const d = description.toLowerCase();
  if (!q || !d) return 0;

  let score = 0;
  const words = d.split(/[\s,]+/).filter(Boolean);

  if (d.startsWith(q)) score += 100;
  else if (words.some((w) => w.startsWith(q))) score += 60;
  else if (d.includes(q)) score += 20;

  if (/\braw\b/.test(d)) score += 30;
  if (PREPARED_FOOD.test(d)) score -= 80;
  score -= words.length;

  return score;
}

export function rankIngredientResults(
  query: string,
  foods: USDAFood[],
): USDAFood[] {
  return [...foods].sort(
    (a, b) =>
      scoreIngredientMatch(query, b.description) -
      scoreIngredientMatch(query, a.description),
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUsdaFood(f: any): USDAFood {
  const get = (name: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    f.foodNutrients?.find((n: any) =>
      n.nutrientName?.toLowerCase().includes(name),
    )?.value ?? 0;

  return {
    fdcId: f.fdcId,
    description: f.description,
    nutrients: {
      calories: get("energy"),
      proteinG: get("protein"),
      carbsG: get("carbohydrate"),
      fatG: get("total lipid"),
    },
  };
}

export async function searchIngredients(query: string): Promise<USDAFood[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const key = process.env.NEXT_PUBLIC_USDA_API_KEY;
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: trimmed,
        dataType: ["Foundation", "SR Legacy"],
        pageSize: 15,
      }),
    },
  );
  const data = await res.json();

  const foods: USDAFood[] = (data.foods ?? []).map(mapUsdaFood);
  return rankIngredientResults(trimmed, dedupeFoods(foods));
}

export function calcNutrition(ingredients: IngredientEntry[]) {
  return ingredients.reduce(
    (acc, entry) => {
      const grams = ingredientToGrams(entry.amount, entry.unit);
      const ratio = grams / 100;
      const { food } = entry;
      return {
        calories: acc.calories + food.nutrients.calories * ratio,
        proteinG: acc.proteinG + food.nutrients.proteinG * ratio,
        carbsG: acc.carbsG + food.nutrients.carbsG * ratio,
        fatG: acc.fatG + food.nutrients.fatG * ratio,
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}
