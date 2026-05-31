import {
  usdaToMealDbMatch,
  usdaToMealDbName,
} from "@/lib/ingredientBridge";
import type { CatalogIngredient } from "@/lib/ingredientCatalog";
import type { USDAFood } from "@/lib/usda";

const catalog: CatalogIngredient[] = [
  {
    mealDbKey: "chicken",
    mealDbName: "Chicken",
    nameMn: "Тахианы мах",
    group: "meat",
    thumb: "",
  },
  {
    mealDbKey: "rice",
    mealDbName: "Rice",
    nameMn: "Будаа",
    group: "grains",
    thumb: "",
  },
  {
    mealDbKey: "chicken breast",
    mealDbName: "Chicken Breast",
    nameMn: "Тахианы мах",
    group: "meat",
    thumb: "",
  },
];

const food = (description: string): USDAFood => ({
  fdcId: 1,
  description,
  nutrients: { calories: 120, proteinG: 22, carbsG: 0, fatG: 3 },
});

describe("ingredientBridge", () => {
  it("maps USDA chicken breast to MealDB chicken ingredient", () => {
    const match = usdaToMealDbMatch(
      food("Chicken, broilers or fryers, breast, meat only, raw"),
      catalog,
    );
    expect(match?.mealDbName).toBe("Chicken");
    expect(match?.matchKind).toBe("catalog-key");
  });

  it("maps by catalog word when description uses rice", () => {
    expect(
      usdaToMealDbName(food("Rice, white, long-grain, regular, raw"), catalog),
    ).toBe("Rice");
  });

  it("falls back to capitalized first word when not in catalog", () => {
    const match = usdaToMealDbMatch(
      food("Quinoa, uncooked"),
      catalog,
    );
    expect(match?.mealDbName).toBe("Quinoa");
    expect(match?.matchKind).toBe("fallback");
  });
});
