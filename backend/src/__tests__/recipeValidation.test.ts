import { describe, expect, it } from "@jest/globals";
import { validateRecipeCreate } from "../lib/recipeValidation";

describe("validateRecipeCreate", () => {
  it("requires title", () => {
    expect(validateRecipeCreate({ title: "  " })).toEqual({
      ok: false,
      field: "title",
    });
  });

  it("requires ingredients when publishing", () => {
    expect(
      validateRecipeCreate({
        title: "Buuz",
        isDraft: false,
        steps: ["Steam"],
      }),
    ).toEqual({ ok: false, field: "ingredients" });
  });

  it("requires steps when publishing", () => {
    expect(
      validateRecipeCreate({
        title: "Buuz",
        isDraft: false,
        ingredients: ["flour"],
      }),
    ).toEqual({ ok: false, field: "steps" });
  });

  it("allows draft with title only", () => {
    const result = validateRecipeCreate({
      title: "Draft",
      isDraft: true,
    });
    expect(result).toEqual({
      ok: true,
      title: "Draft",
      isDraft: true,
      ingredients: [],
      steps: [],
      isPremium: false,
      price: 0,
    });
  });

  it("normalizes ingredient and step lists on publish", () => {
    const result = validateRecipeCreate({
      title: "  Buuz  ",
      isDraft: false,
      ingredients: [" flour ", "", "mutton"],
      steps: [" Mix ", "  "],
    });
    expect(result).toEqual({
      ok: true,
      title: "Buuz",
      isDraft: false,
      ingredients: ["flour", "mutton"],
      steps: ["Mix"],
      isPremium: false,
      price: 0,
    });
  });

  it("rejects premium recipe with price 0", () => {
    expect(
      validateRecipeCreate({
        title: "Premium",
        isDraft: false,
        isPremium: true,
        price: 0,
        ingredients: ["flour"],
        steps: ["Cook"],
      }),
    ).toEqual({ ok: false, field: "price" });
  });

  it("accepts premium recipe with positive price", () => {
    const result = validateRecipeCreate({
      title: "Premium",
      isDraft: false,
      isPremium: true,
      price: 5000,
      ingredients: ["flour"],
      steps: ["Cook"],
    });
    expect(result).toMatchObject({
      ok: true,
      isPremium: true,
      price: 5000,
    });
  });
});
