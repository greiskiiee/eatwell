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

export async function searchIngredients(query: string): Promise<USDAFood[]> {
  const key = process.env.NEXT_PUBLIC_USDA_API_KEY;
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=8&api_key=${key}`,
  );
  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.foods ?? []).map((f: any) => {
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
}

export function calcNutrition(
  ingredients: { food: USDAFood; grams: number }[],
) {
  return ingredients.reduce(
    (acc, { food, grams }) => {
      const ratio = grams / 100;
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
