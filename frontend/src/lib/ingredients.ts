import type { USDAFood } from "./usda";

export type IngredientUnit = "g" | "kg" | "ml" | "piece";

export const INGREDIENT_UNITS: { id: IngredientUnit; label: string }[] = [
  { id: "g", label: "гр" },
  { id: "kg", label: "кг" },
  { id: "ml", label: "мл" },
  { id: "piece", label: "ширхэг" },
];

export interface IngredientEntry {
  food: USDAFood;
  amount: number;
  unit: IngredientUnit;
}

/** Convert amount to grams for nutrition (USDA data is per 100g). */
export function ingredientToGrams(amount: number, unit: IngredientUnit): number {
  switch (unit) {
    case "kg":
      return amount * 1000;
    case "g":
      return amount;
    case "ml":
      return amount;
    case "piece":
      return amount * 50;
    default:
      return amount;
  }
}

export function formatIngredientAmount(entry: IngredientEntry): string {
  const u = INGREDIENT_UNITS.find((x) => x.id === entry.unit);
  return `${entry.amount} ${u?.label ?? entry.unit}`;
}

export function formatIngredientEntry(entry: IngredientEntry): string {
  return `${formatIngredientAmount(entry)} — ${entry.food.description}`;
}
