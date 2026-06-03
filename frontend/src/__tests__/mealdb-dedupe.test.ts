import { dedupeMealsById } from "@/lib/mealdb";

describe("dedupeMealsById", () => {
  it("removes duplicate idMeal entries", () => {
    const meals = [
      { idMeal: "52866", strMeal: "A", strMealThumb: "", strCategory: "", strArea: "", strInstructions: "", strTags: null, strYoutube: null },
      { idMeal: "52866", strMeal: "A dup", strMealThumb: "", strCategory: "", strArea: "", strInstructions: "", strTags: null, strYoutube: null },
      { idMeal: "53156", strMeal: "B", strMealThumb: "", strCategory: "", strArea: "", strInstructions: "", strTags: null, strYoutube: null },
    ];
    expect(dedupeMealsById(meals)).toHaveLength(2);
    expect(dedupeMealsById(meals).map((m) => m.idMeal)).toEqual(["52866", "53156"]);
  });
});
