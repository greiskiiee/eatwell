import {
  mergeFilterMealsAll,
  mergeFilterMealsAny,
  type MealDBFilterMeal,
} from "@/lib/mealdb";

const meal = (id: string, name: string): MealDBFilterMeal => ({
  idMeal: id,
  strMeal: name,
  strMealThumb: "https://example.com/thumb.jpg",
});

describe("mergeFilterMealsAny", () => {
  it("returns union of recipes matching any selected ingredient", () => {
    const results = mergeFilterMealsAny([
      [meal("1", "Kefta"), meal("2", "Bowl")],
      [meal("3", "Stuffed cabbage")],
    ]);

    expect(results.map((m) => m.idMeal).sort()).toEqual(["1", "2", "3"]);
  });

  it("sorts recipes with more ingredient overlap first", () => {
    const results = mergeFilterMealsAny([
      [meal("1", "A"), meal("2", "B")],
      [meal("2", "B"), meal("3", "C")],
    ]);

    expect(results[0]?.idMeal).toBe("2");
  });
});

describe("mergeFilterMealsAll", () => {
  it("returns only recipes containing every ingredient", () => {
    const results = mergeFilterMealsAll([
      [meal("1", "Kefta"), meal("2", "Bowl")],
      [meal("3", "Stuffed cabbage")],
    ]);

    expect(results).toHaveLength(0);
  });
});
