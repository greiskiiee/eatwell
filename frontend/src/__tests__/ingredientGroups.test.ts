import {
  categorizeIngredient,
  dedupeByName,
  dedupeIngredientNames,
  groupCatalogItems,
  groupIngredients,
} from "@/lib/ingredientGroups";

describe("ingredientGroups", () => {
  it("categorizes chicken as meat (happy path)", () => {
    expect(categorizeIngredient("Chicken")).toBe("meat");
  });

  it("returns other for unknown ingredient (bad case)", () => {
    expect(categorizeIngredient("Mystery item")).toBe("other");
  });

  it("dedupes ingredient names case-insensitively", () => {
    expect(dedupeIngredientNames(["Egg", "egg", "  "])).toEqual(["Egg"]);
  });

  it("dedupes mealdb rows by strIngredient", () => {
    const rows = dedupeByName([
      { strIngredient: "Salt", id: 1 },
      { strIngredient: "salt", id: 2 },
      { strIngredient: "  ", id: 3 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].strIngredient).toBe("Salt");
  });

  it("groups catalog items with mongolian sort", () => {
    const grouped = groupCatalogItems([
      {
        mealDbKey: "beef",
        mealDbName: "Beef",
        nameMn: "Үхрийн мах",
        thumb: "",
      },
      {
        mealDbKey: "chicken",
        mealDbName: "Chicken",
        nameMn: "Тахиа",
        thumb: "",
      },
    ]);

    const meat = grouped.find((g) => g.group.id === "meat");
    expect(meat?.items).toHaveLength(2);
    expect(meat?.items.map((i) => i.mealDbKey).sort()).toEqual(["beef", "chicken"]);
  });

  it("groups mealdb ingredients alphabetically", () => {
    const grouped = groupIngredients([
      { strIngredient: "Tomato" },
      { strIngredient: "Carrot" },
    ]);
    const veg = grouped.find((g) => g.group.id === "vegetables");
    expect(veg?.items[0].strIngredient).toBe("Carrot");
  });
});
