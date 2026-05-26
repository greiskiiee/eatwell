import {
  INGREDIENT_UNITS,
  formatIngredientAmount,
  formatIngredientEntry,
  ingredientToGrams,
  type IngredientEntry,
} from "@/lib/ingredients";
import type { USDAFood } from "@/lib/usda";

const food: USDAFood = {
  fdcId: 1,
  description: "Chicken breast",
  nutrients: { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
};

const entry: IngredientEntry = { food, amount: 2, unit: "piece" };

describe("recipe ingredients lib", () => {
  it("converts kg to grams (happy path)", () => {
    expect(ingredientToGrams(1, "kg")).toBe(1000);
  });

  it("converts pieces using default weight (happy path)", () => {
    expect(ingredientToGrams(2, "piece")).toBe(100);
  });

  it("formats amount with mongolian unit label (happy path)", () => {
    expect(formatIngredientAmount({ food, amount: 150, unit: "g" })).toBe(
      "150 гр",
    );
  });

  it("formats full ingredient entry string (happy path)", () => {
    expect(formatIngredientEntry(entry)).toContain("Chicken breast");
    expect(formatIngredientEntry(entry)).toContain("ширхэг");
  });

  it("converts g and ml directly (happy path)", () => {
    expect(ingredientToGrams(250, "g")).toBe(250);
    expect(ingredientToGrams(100, "ml")).toBe(100);
  });

  it("falls back to raw amount for unknown unit (edge case)", () => {
    expect(
      ingredientToGrams(3, "unknown" as IngredientEntry["unit"]),
    ).toBe(3);
    expect(
      formatIngredientAmount({
        food,
        amount: 5,
        unit: "unknown" as IngredientEntry["unit"],
      }),
    ).toBe("5 unknown");
  });

  it("exposes all unit options", () => {
    expect(INGREDIENT_UNITS.map((u) => u.id)).toEqual([
      "g",
      "kg",
      "ml",
      "piece",
    ]);
  });
});
