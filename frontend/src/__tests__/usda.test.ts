import {
  rankIngredientResults,
  scoreIngredientMatch,
  type USDAFood,
} from "@/lib/usda";

const mk = (fdcId: number, description: string): USDAFood => ({
  fdcId,
  description,
  nutrients: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
});

describe("usda ingredient search ranking", () => {
  it("prefers raw cucumber over cucumber salad", () => {
    expect(
      scoreIngredientMatch("cucumber", "Cucumber, with peel, raw"),
    ).toBeGreaterThan(
      scoreIngredientMatch(
        "cucumber",
        "Cucumber salad made with cucumber and vinegar",
      ),
    );
  });

  it("ranks raw ingredients before prepared dishes", () => {
    const ranked = rankIngredientResults("cucumber", [
      mk(1, "Cucumber salad made with cucumber and vinegar"),
      mk(2, "Cucumber, with peel, raw"),
      mk(3, "Pickles, cucumber, dill or kosher dill"),
    ]);
    expect(ranked[0].description).toBe("Cucumber, with peel, raw");
  });
});
