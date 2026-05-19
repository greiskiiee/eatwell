import {
  fetchIngredientCatalog,
  fetchIngredientLabels,
} from "@/lib/ingredientCatalog";

describe("ingredientCatalog api", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("fetchIngredientCatalog returns items (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          items: [
            {
              mealDbKey: "chicken",
              mealDbName: "Chicken",
              nameMn: "Тахиа",
              group: "meat",
              thumb: "",
            },
          ],
        }),
    });

    const items = await fetchIngredientCatalog();
    expect(items).toHaveLength(1);
    expect(items[0].nameMn).toBe("Тахиа");
  });

  it("fetchIngredientCatalog passes search query", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [] }),
    });

    await fetchIngredientCatalog("тахиа");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("q=%D1%82%D0%B0%D1%85%D0%B8%D0%B0"),
      expect.any(Object),
    );
  });

  it("fetchIngredientCatalog throws on error (bad case)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: "SERVER_ERROR" }),
    });

    await expect(fetchIngredientCatalog()).rejects.toThrow(
      "API request failed",
    );
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
