import {
  getMatchingAllergens,
  lineContainsAllergen,
  recipeHasAllergen,
} from "@/lib/allergens";

describe("allergens", () => {
  it("matches ingredient in recipe line (happy path)", () => {
    expect(lineContainsAllergen("200g Chicken breast", "chicken")).toBe(true);
    expect(lineContainsAllergen("1 cup Milk", "milk")).toBe(true);
  });

  it("does not false-positive on substrings (bad case)", () => {
    expect(lineContainsAllergen("Eggplant", "egg")).toBe(false);
  });

  it("returns matched user allergens", () => {
    const matched = getMatchingAllergens(
      ["2 eggs", "flour", "milk"],
      ["egg", "peanut"],
    );
    expect(matched).toEqual(["egg"]);
    expect(recipeHasAllergen(["2 eggs"], ["egg"])).toBe(true);
    expect(recipeHasAllergen(["rice"], ["egg"])).toBe(false);
  });
});
