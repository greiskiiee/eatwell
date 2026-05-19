/**
 * @jest-environment node
 */
import { dedupeIngredientNames } from "@/lib/ingredientGroups";

describe("useIngredientLabels helpers", () => {
  it("dedupes names used by the hook", () => {
    expect(dedupeIngredientNames(["Chicken", "chicken", "Beef"])).toEqual([
      "Chicken",
      "Beef",
    ]);
  });
});
