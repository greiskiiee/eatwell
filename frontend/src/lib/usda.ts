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

export async function searchIngredients(query: string): Promise<USDAFood[]> {
  const key = process.env.NEXT_PUBLIC_USDA_API_KEY;
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=1&api_key=${key}`,
  );
  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const foods: USDAFood[] = (data.foods ?? []).map((f: any) => {
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
  });

  return dedupeFoods(foods);
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
