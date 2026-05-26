import {
  parseMultilineField,
  validateRecipeForDraft,
  validateRecipeForPublish,
  validateRecipeTextForm,
} from "@/lib/recipeForm";
import type { IngredientEntry } from "@/lib/ingredients";

const sampleIngredient: IngredientEntry = {
  food: {
    fdcId: 1,
    description: "Chicken",
    nutrients: { calories: 100, proteinG: 20, carbsG: 0, fatG: 2 },
  },
  amount: 100,
  unit: "g",
};

describe("recipeForm validation", () => {
  it("draft requires title", () => {
    expect(validateRecipeForDraft({ title: "   " })).toBe("Гарчиг оруулна уу");
    expect(validateRecipeForDraft({ title: "Buuz" })).toBeNull();
  });

  it("publish requires title", () => {
    expect(
      validateRecipeForPublish({
        title: "",
        ingredients: [sampleIngredient],
        steps: ["Steam"],
      }),
    ).toBe("Гарчиг оруулна уу");
  });

  it("publish requires at least one ingredient", () => {
    expect(
      validateRecipeForPublish({
        title: "Buuz",
        ingredients: [],
        steps: ["Steam"],
      }),
    ).toBe("Хамгийн багадаа нэг орц нэмнэ үү");
  });

  it("publish requires at least one non-empty step", () => {
    expect(
      validateRecipeForPublish({
        title: "Buuz",
        ingredients: [sampleIngredient],
        steps: ["", "   "],
      }),
    ).toBe("Хамгийн багадаа нэг алхам бичнэ үү");
  });

  it("publish passes when title, ingredients, and steps are present", () => {
    expect(
      validateRecipeForPublish({
        title: "Buuz",
        ingredients: [sampleIngredient],
        steps: ["Make dough", "Steam"],
      }),
    ).toBeNull();
  });

  it("parseMultilineField trims and drops empty lines", () => {
    expect(parseMultilineField(" flour \n\n mutton \n")).toEqual([
      "flour",
      "mutton",
    ]);
  });

  it("validateRecipeTextForm draft only needs title", () => {
    expect(
      validateRecipeTextForm(
        { title: "Draft", ingredientsText: "", stepsText: "" },
        true,
      ),
    ).toBeNull();
  });

  it("validateRecipeTextForm publish needs ingredients and steps in text", () => {
    expect(
      validateRecipeTextForm(
        { title: "Buuz", ingredientsText: "flour", stepsText: "steam" },
        false,
      ),
    ).toBeNull();

    expect(
      validateRecipeTextForm(
        { title: "Buuz", ingredientsText: "", stepsText: "steam" },
        false,
      ),
    ).toBe("Хамгийн багадаа нэг орц нэмнэ үү");

    expect(
      validateRecipeTextForm(
        { title: "Buuz", ingredientsText: "flour", stepsText: "\n  \n" },
        false,
      ),
    ).toBe("Хамгийн багадаа нэг алхам бичнэ үү");
  });
});
