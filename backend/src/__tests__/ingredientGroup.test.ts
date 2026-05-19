import { describe, expect, it } from "@jest/globals";
import { categorizeIngredient } from "../lib/ingredientGroup";

describe("categorizeIngredient", () => {
  it("classifies meat (happy path)", () => {
    expect(categorizeIngredient("Chicken breast")).toBe("meat");
  });

  it("classifies seafood (happy path)", () => {
    expect(categorizeIngredient("Salmon fillet")).toBe("seafood");
  });

  it("classifies vegetables (happy path)", () => {
    expect(categorizeIngredient("Tomato")).toBe("vegetables");
  });

  it("returns other for unknown (bad case)", () => {
    expect(categorizeIngredient("Mystery powder xyz")).toBe("other");
  });

  it("is case insensitive", () => {
    expect(categorizeIngredient("MILK")).toBe("dairy");
  });
});
