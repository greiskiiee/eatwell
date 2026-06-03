import {
  fetchIngredientCatalog,
  fetchIngredientLabels,
  resetIngredientCatalogCache,
} from "@/lib/ingredientCatalog";

describe("ingredientCatalog api", () => {
  beforeEach(() => {
    resetIngredientCatalogCache();
    global.fetch = jest.fn();
  });

  it("fetchIngredientCatalog returns items from MealDB list (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        meals: [
          { strIngredient: "Chicken", strThumb: "https://example.com/chicken.png" },
          { strIngredient: "Beef" },
        ],
      }),
    });

    const items = await fetchIngredientCatalog();
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.find((i) => i.mealDbName === "Chicken")).toMatchObject({
      mealDbKey: "chicken",
      group: "meat",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("list.php?i=list"),
    );
  });

  it("fetchIngredientCatalog filters client-side by query", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        meals: [
          { strIngredient: "Chicken" },
          { strIngredient: "Rice" },
        ],
      }),
    });

    const items = await fetchIngredientCatalog("chick");
    expect(items).toHaveLength(1);
    expect(items[0].mealDbName).toBe("Chicken");
  });

  it("fetchIngredientLabels returns empty for no names", async () => {
    const labels = await fetchIngredientLabels([]);
    expect(labels).toEqual({});
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetchIngredientLabels resolves names (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          labels: {
            Chicken: { mealDbName: "Chicken", nameMn: "Тахиа" },
          },
        }),
    });

    const labels = await fetchIngredientLabels(["Chicken"]);
    expect(labels.Chicken.nameMn).toBe("Тахиа");
  });
});
