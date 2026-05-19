import { describe, expect, it } from "@jest/globals";
import { normalizeMealDbKey } from "../models/IngredientCatalog";

describe("normalizeMealDbKey", () => {
  it("lowercases and trims (happy path)", () => {
    expect(normalizeMealDbKey("  Chicken  ")).toBe("chicken");
  });

  it("handles multi-word keys", () => {
    expect(normalizeMealDbKey("Olive Oil")).toBe("olive oil");
  });
});
