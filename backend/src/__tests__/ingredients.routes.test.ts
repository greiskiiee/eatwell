/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ingredientsRouter } from "../routes/ingredients";
import { IngredientCatalogModel } from "../models/IngredientCatalog";
import { syncMealDbIngredients } from "../lib/mealdbIngredients";
import { verifyAccessToken } from "../lib/auth";

jest.mock("../models/IngredientCatalog", () => ({
  IngredientCatalogModel: {
    estimatedDocumentCount: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  normalizeMealDbKey: (name: string) => name.trim().toLowerCase(),
}));

jest.mock("../lib/mealdbIngredients", () => ({
  syncMealDbIngredients: jest.fn(),
}));

jest.mock("../lib/auth", () => ({
  verifyAccessToken: jest.fn(),
}));

const mockedModel = IngredientCatalogModel as any;
const mockedSync = syncMealDbIngredients as jest.MockedFunction<
  typeof syncMealDbIngredients
>;
const mockedVerify = verifyAccessToken as jest.MockedFunction<
  typeof verifyAccessToken
>;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/ingredients", ingredientsRouter);
  return app;
}

const sampleItem = {
  mealDbKey: "chicken",
  mealDbName: "Chicken",
  nameMn: "Тахиа",
  group: "meat",
  thumb: "https://example.com/chicken.png",
};

function mockFindLean(rows: unknown[]) {
  mockedModel.find.mockReturnValue({
    sort: () => ({
      limit: () => ({
        lean: async () => rows,
      }),
    }),
  } as any);
}

describe("Ingredients routes", () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET / lists ingredients (happy path)", async () => {
    mockedModel.estimatedDocumentCount.mockResolvedValue(2);
    mockFindLean([sampleItem]);

    const res = await request(app).get("/api/ingredients");

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].nameMn).toBe("Тахиа");
    expect(mockedSync).not.toHaveBeenCalled();
  });

  it("GET / syncs when catalog is empty", async () => {
    mockedModel.estimatedDocumentCount
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);
    mockedSync.mockResolvedValue({ created: 1, updated: 0, total: 1 });
    mockFindLean([sampleItem]);

    const res = await request(app).get("/api/ingredients");

    expect(res.status).toBe(200);
    expect(mockedSync).toHaveBeenCalled();
  });

  it("GET / filters by search query", async () => {
    mockedModel.estimatedDocumentCount.mockResolvedValue(1);
    mockFindLean([sampleItem]);

    const res = await request(app).get("/api/ingredients?q=тахиа");

    expect(res.status).toBe(200);
    expect(mockedModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.any(Array),
      }),
    );
  });

  it("POST /labels returns empty map for empty names", async () => {
    const res = await request(app)
      .post("/api/ingredients/labels")
      .send({ names: [] });

    expect(res.status).toBe(200);
    expect(res.body.labels).toEqual({});
  });

  it("POST /labels resolves mongolian names (happy path)", async () => {
    mockedModel.find.mockReturnValue({
      lean: async () => [sampleItem],
    } as any);

    const res = await request(app)
      .post("/api/ingredients/labels")
      .send({ names: ["Chicken"] });

    expect(res.status).toBe(200);
    expect(res.body.labels.Chicken.nameMn).toBe("Тахиа");
  });

  it("POST /labels matches by mealDbName when key differs (happy path)", async () => {
    mockedModel.find.mockReturnValue({
      lean: async () => [
        { ...sampleItem, mealDbKey: "chicken", mealDbName: "Chicken" },
      ],
    } as any);

    const res = await request(app)
      .post("/api/ingredients/labels")
      .send({ names: ["CHICKEN"] });

    expect(res.status).toBe(200);
    expect(res.body.labels.CHICKEN.nameMn).toBe("Тахиа");
  });

  it("POST /labels falls back when unknown (bad case)", async () => {
    mockedModel.find.mockReturnValue({
      lean: async () => [],
    } as any);

    const res = await request(app)
      .post("/api/ingredients/labels")
      .send({ names: ["Unknown Spice"] });

    expect(res.status).toBe(200);
    expect(res.body.labels["Unknown Spice"].nameMn).toBe("Unknown Spice");
  });

  it("POST /sync requires auth (bad case)", async () => {
    const res = await request(app).post("/api/ingredients/sync");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });

  it("POST /sync rejects non-admin (bad case)", async () => {
    mockedVerify.mockReturnValue({ sub: "u1", role: "user" });

    const res = await request(app)
      .post("/api/ingredients/sync")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });

  it("POST /sync succeeds for admin (happy path)", async () => {
    mockedVerify.mockReturnValue({ sub: "admin1", role: "admin" });
    mockedSync.mockResolvedValue({ created: 2, updated: 1, total: 100 });

    const res = await request(app)
      .post("/api/ingredients/sync")
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(2);
  });

  it("PATCH /:key validates body (bad case)", async () => {
    mockedVerify.mockReturnValue({ sub: "admin1", role: "admin" });

    const res = await request(app)
      .patch("/api/ingredients/chicken")
      .set("Authorization", "Bearer admin-token")
      .send({ nameMn: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("PATCH /:key returns 404 when missing (bad case)", async () => {
    mockedVerify.mockReturnValue({ sub: "admin1", role: "admin" });
    mockedModel.findOneAndUpdate.mockReturnValue({
      lean: async () => null,
    } as any);

    const res = await request(app)
      .patch("/api/ingredients/missing")
      .set("Authorization", "Bearer admin-token")
      .send({ nameMn: "Шинэ нэр" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });

  it("PATCH /:key updates nameMn (happy path)", async () => {
    mockedVerify.mockReturnValue({ sub: "admin1", role: "admin" });
    mockedModel.findOneAndUpdate.mockReturnValue({
      lean: async () => ({ ...sampleItem, nameMn: "Шинэ тахиа" }),
    } as any);

    const res = await request(app)
      .patch("/api/ingredients/chicken")
      .set("Authorization", "Bearer admin-token")
      .send({ nameMn: "Шинэ тахиа" });

    expect(res.status).toBe(200);
    expect(res.body.nameMn).toBe("Шинэ тахиа");
  });
});
