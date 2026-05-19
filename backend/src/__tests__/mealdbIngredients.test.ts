/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { syncMealDbIngredients } from "../lib/mealdbIngredients";
import { fetchJson } from "../lib/http";
import { IngredientCatalogModel } from "../models/IngredientCatalog";

jest.mock("../lib/http", () => ({
  fetchJson: jest.fn(),
}));

jest.mock("../models/IngredientCatalog", () => ({
  IngredientCatalogModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  },
  normalizeMealDbKey: (name: string) => name.trim().toLowerCase(),
}));

const mockedFetch = fetchJson as jest.MockedFunction<typeof fetchJson>;
const mockedModel = IngredientCatalogModel as any;

describe("syncMealDbIngredients", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates new ingredients with seed translation (happy path)", async () => {
    mockedFetch.mockResolvedValue({
      meals: [
        { strIngredient: "Chicken", strThumb: "https://thumb/chicken.png" },
        { strIngredient: "  ", strThumb: null },
      ],
    });
    mockedModel.findOne.mockReturnValue({
      lean: async () => null,
    });
    mockedModel.create.mockResolvedValue({});

    const result = await syncMealDbIngredients();

    expect(result.created).toBe(1);
    expect(result.total).toBe(2);
    expect(mockedModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mealDbKey: "chicken",
        mealDbName: "Chicken",
        nameMn: "Тахиа",
      }),
    );
  });

  it("updates thumb and group on existing row (happy path)", async () => {
    mockedFetch.mockResolvedValue({
      meals: [{ strIngredient: "Tomato", strThumb: "https://thumb/tomato.png" }],
    });
    mockedModel.findOne.mockReturnValue({
      lean: async () => ({
        mealDbKey: "tomato",
        thumb: "",
        group: "other",
      }),
    });
    mockedModel.updateOne.mockResolvedValue({ acknowledged: true });

    const result = await syncMealDbIngredients();

    expect(result.updated).toBe(1);
    expect(mockedModel.updateOne).toHaveBeenCalled();
  });

  it("handles empty mealdb response (bad case)", async () => {
    mockedFetch.mockResolvedValue({ meals: null });

    const result = await syncMealDbIngredients();

    expect(result).toEqual({ created: 0, updated: 0, total: 0 });
  });

  it("uses english name when seed missing (happy path)", async () => {
    mockedFetch.mockResolvedValue({
      meals: [{ strIngredient: "Zaatar", strThumb: "" }],
    });
    mockedModel.findOne.mockReturnValue({ lean: async () => null });
    mockedModel.create.mockResolvedValue({});

    await syncMealDbIngredients();

    expect(mockedModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ nameMn: "Zaatar" }),
    );
  });

  it("skips update when nothing to patch (bad case / noop)", async () => {
    mockedFetch.mockResolvedValue({
      meals: [{ strIngredient: "Salt", strThumb: "" }],
    });
    mockedModel.findOne.mockReturnValue({
      lean: async () => ({
        mealDbKey: "salt",
        thumb: "existing",
        group: "spices",
      }),
    });

    const result = await syncMealDbIngredients();

    expect(result.updated).toBe(0);
    expect(mockedModel.updateOne).not.toHaveBeenCalled();
  });
});
