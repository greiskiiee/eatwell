/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { recipesRouter } from "../routes/recipes";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";
import { verifyAccessToken } from "../lib/auth";

jest.mock("../models/TechnologistRecipe", () => ({
  TechnologistRecipeModel: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("../models/Comment", () => ({
  CommentModel: {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../models/PurchasedRecipe", () => ({
  PurchasedRecipeModel: {
    exists: jest.fn(),
  },
}));

jest.mock("../lib/auth", () => ({
  verifyAccessToken: jest.fn(),
}));

const mockedCreate = TechnologistRecipeModel.create as jest.MockedFunction<
  typeof TechnologistRecipeModel.create
>;
const mockedFind = TechnologistRecipeModel.find as jest.MockedFunction<
  typeof TechnologistRecipeModel.find
>;
const mockedVerify = verifyAccessToken as jest.MockedFunction<
  typeof verifyAccessToken
>;

function mockFindChain(results: unknown[]) {
  const limit = jest.fn().mockResolvedValue(results as never);
  const sort = jest.fn().mockReturnValue({ limit });
  mockedFind.mockReturnValue({ sort } as never);
  return { sort, limit };
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/recipes", recipesRouter);
  return app;
}

const technologistAuth = { sub: "tech-user-1", role: "technologist" };

const createdRecipe = {
  _id: "recipe-id-1",
  title: "Mongolian Buuz",
  description: "Steamed dumplings",
  servings: 4,
  prepTimeMinutes: 40,
  cookTimeMinutes: 30,
  tags: ["traditional"],
  ingredients: ["flour", "mutton"],
  steps: ["Make dough", "Steam"],
  nutrition: { calories: 320, proteinG: 18, carbsG: 40, fatG: 12 },
  isDraft: false,
  isPremium: true,
  price: 5000,
  imageUrl: "https://example.com/buuz.jpg",
  imageUrls: ["https://example.com/buuz.jpg"],
  videoUrl: "",
  createdByUserId: technologistAuth.sub,
  createdBy: "food-technologist",
};

describe("Recipes routes POST — TC-R01–TC-R12", () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedVerify.mockReturnValue(technologistAuth as any);
    mockedCreate.mockResolvedValue(createdRecipe as any);
  });

  it("TC-R01 technologist creates published premium recipe — 201", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "  Mongolian Buuz  ",
        description: "Steamed dumplings",
        servings: 4,
        prepTimeMinutes: 40,
        cookTimeMinutes: 30,
        tags: ["traditional"],
        ingredients: ["flour", "mutton"],
        steps: ["Make dough", "Steam"],
        nutrition: { calories: 320, proteinG: 18, carbsG: 40, fatG: 12 },
        isDraft: false,
        isPremium: true,
        price: 5000,
        imageUrls: ["https://example.com/buuz.jpg"],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Mongolian Buuz");
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Mongolian Buuz",
        isDraft: false,
        isPremium: true,
        price: 5000,
        createdByUserId: technologistAuth.sub,
        createdBy: "food-technologist",
        ingredients: ["flour", "mutton"],
        imageUrl: "https://example.com/buuz.jpg",
        imageUrls: ["https://example.com/buuz.jpg"],
      }),
    );
  });

  it("TC-R02 technologist omits isDraft — defaults isDraft true, price 0 — 201", async () => {
    mockedCreate.mockResolvedValue({
      ...createdRecipe,
      isDraft: true,
      isPremium: false,
      price: 0,
    } as any);

    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({ title: "Draft Recipe" });

    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Draft Recipe",
        isDraft: true,
        isPremium: false,
        price: 0,
      }),
    );
  });

  it("POST / sets price to 0 when not premium", async () => {
    await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "Free Recipe",
        isPremium: false,
        price: 9999,
      });

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        isPremium: false,
        price: 0,
      }),
    );
  });

  it("TC-R04 user role cannot create recipe — 403 FORBIDDEN", async () => {
    mockedVerify.mockReturnValue({ sub: "user-1", role: "user" } as any);

    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer user-token")
      .send({ title: "Not Allowed" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("TC-R05 technologist whitespace-only title — 400 VALIDATION_ERROR title", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({ title: "   " });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "VALIDATION_ERROR",
      field: "title",
    });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("TC-R06 no Authorization header — 401 UNAUTHORIZED", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .send({ title: "No Auth" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("POST / allows admin to create recipe (happy path)", async () => {
    mockedVerify.mockReturnValue({ sub: "admin-1", role: "admin" } as any);
    mockedCreate.mockResolvedValue({
      ...createdRecipe,
      createdByUserId: "admin-1",
    } as any);

    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer admin-token")
      .send({
        title: "Admin Recipe",
        isDraft: false,
        ingredients: ["rice"],
        steps: ["Cook"],
      });

    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Admin Recipe",
        createdByUserId: "admin-1",
      }),
    );
  });

  it("TC-R08 publish without ingredients — 400 VALIDATION_ERROR ingredients", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "No Ingredients",
        isDraft: false,
        steps: ["Only step"],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "VALIDATION_ERROR",
      field: "ingredients",
    });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("TC-R09 publish without steps — 400 VALIDATION_ERROR steps", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "No Steps",
        isDraft: false,
        ingredients: ["flour"],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "VALIDATION_ERROR",
      field: "steps",
    });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("TC-R10 publish with empty ingredient strings — 400 VALIDATION_ERROR ingredients", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "Empty Ingredients",
        isDraft: false,
        ingredients: ["", "   "],
        steps: ["Cook"],
      });

    expect(res.status).toBe(400);
    expect(res.body.field).toBe("ingredients");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("TC-R11 draft with title only — 201, ingredients and steps empty", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "Draft Only Title",
        isDraft: true,
      });

    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Draft Only Title",
        isDraft: true,
        ingredients: [],
        steps: [],
      }),
    );
  });

  it("TC-R12 premium recipe with price 0 — 400 VALIDATION_ERROR price", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer tech-token")
      .send({
        title: "Premium No Price",
        isDraft: false,
        isPremium: true,
        price: 0,
        ingredients: ["flour"],
        steps: ["Cook"],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "VALIDATION_ERROR",
      field: "price",
    });
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});

describe("Recipes routes — list search", () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindChain([createdRecipe]);
  });

  it("GET / filters by ingredients query", async () => {
    const res = await request(app).get(
      "/api/recipes?ingredients=flour,mutton&limit=10",
    );

    expect(res.status).toBe(200);
    expect(mockedFind).toHaveBeenCalledWith(
      expect.objectContaining({
        isDraft: false,
        $and: expect.arrayContaining([
          { ingredients: { $regex: "flour", $options: "i" } },
          { ingredients: { $regex: "mutton", $options: "i" } },
        ]),
      }),
    );
  });

  it("GET / filters by maxMinutes total prep + cook", async () => {
    const res = await request(app).get("/api/recipes?maxMinutes=60");

    expect(res.status).toBe(200);
    expect(mockedFind).toHaveBeenCalledWith(
      expect.objectContaining({
        isDraft: false,
        $and: expect.arrayContaining([
          expect.objectContaining({ $expr: expect.any(Object) }),
        ]),
      }),
    );
  });

  it("GET / combines q, ingredients, and maxMinutes", async () => {
    const res = await request(app).get(
      "/api/recipes?q=buuz&ingredients=flour&maxMinutes=90",
    );

    expect(res.status).toBe(200);
    const filter = mockedFind.mock.calls[0]![0] as unknown as {
      $and: Record<string, unknown>[];
    };
    expect(filter.$and).toHaveLength(3);
    expect(filter.$and[0]).toEqual(
      expect.objectContaining({
        $or: expect.arrayContaining([
          expect.objectContaining({ title: expect.any(Object) }),
        ]),
      }),
    );
  });
});
