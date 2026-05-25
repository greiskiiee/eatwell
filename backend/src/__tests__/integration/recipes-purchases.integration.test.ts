import request from "supertest";
import { beforeAll, afterAll, afterEach, describe, expect, it } from "@jest/globals";
import { createApp } from "../../app";
import {
  clearIntegrationDb,
  connectIntegrationDb,
  disconnectIntegrationDb,
} from "./db";
import {
  authHeader,
  createTechnologistUser,
  signupUser,
} from "./helpers";

describe("Recipes & purchases integration", () => {
  const app = createApp();

  beforeAll(async () => {
    await connectIntegrationDb();
  });

  afterEach(async () => {
    await clearIntegrationDb();
  });

  afterAll(async () => {
    await disconnectIntegrationDb();
  });

  it("premium recipe is locked until purchased", async () => {
    const buyer = await signupUser(app, {
      email: "buyer@integration.test",
      password: "password123",
    });
    expect(buyer.status).toBe(201);
    const buyerToken = buyer.body.token as string;

    const { token: techToken } = await createTechnologistUser({
      email: "tech@integration.test",
      password: "password123",
      name: "Chef Tech",
    });

    const created = await request(app)
      .post("/api/recipes")
      .set(authHeader(techToken))
      .send({
        title: "Premium Test Stew",
        description: "Integration premium recipe",
        ingredients: ["beef", "onion"],
        steps: ["Cook beef", "Add onion"],
        isDraft: false,
        isPremium: true,
        price: 5000,
      });

    expect(created.status).toBe(201);
    const recipeId = String(created.body._id);

    const locked = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .set(authHeader(buyerToken));

    expect(locked.status).toBe(200);
    expect(locked.body.locked).toBe(true);
    expect(locked.body.ingredients).toEqual([]);
    expect(locked.body.steps).toEqual([]);

    const purchase = await request(app)
      .post("/api/purchases")
      .set(authHeader(buyerToken))
      .send({ recipeId, method: "qpay" });

    expect(purchase.status).toBe(201);
    expect(purchase.body.purchased).toBe(true);
    expect(purchase.body.amount).toBe(5000);

    const unlocked = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .set(authHeader(buyerToken));

    expect(unlocked.status).toBe(200);
    expect(unlocked.body.locked).toBe(false);
    expect(unlocked.body.ingredients).toContain("beef");
    expect(unlocked.body.steps).toHaveLength(2);

    const mine = await request(app)
      .get("/api/purchases/me")
      .set(authHeader(buyerToken));

    expect(mine.status).toBe(200);
    expect(mine.body.purchases).toHaveLength(1);
    expect(mine.body.purchases[0].recipeId).toBe(recipeId);

    const check = await request(app)
      .get(`/api/purchases/check/${recipeId}`)
      .set(authHeader(buyerToken));

    expect(check.status).toBe(200);
    expect(check.body.purchased).toBe(true);
  });

  it("lists published recipes and supports search", async () => {
    const { token: techToken } = await createTechnologistUser({
      email: "list-tech@integration.test",
      password: "password123",
    });

    const buuz = await request(app)
      .post("/api/recipes")
      .set(authHeader(techToken))
      .send({
        title: "Mongolian Buuz",
        description: "Steamed dumplings",
        ingredients: ["flour", "mutton"],
        steps: ["Wrap", "Steam"],
        isDraft: false,
        isPremium: false,
      });
    expect(buuz.status).toBe(201);

    const smoothie = await request(app)
      .post("/api/recipes")
      .set(authHeader(techToken))
      .send({
        title: "Banana Smoothie",
        description: "Sweet drink",
        ingredients: ["banana", "milk"],
        steps: ["Blend", "Serve"],
        isDraft: false,
        isPremium: false,
      });
    expect(smoothie.status).toBe(201);

    const all = await request(app).get("/api/recipes");
    expect(all.status).toBe(200);
    expect(all.body.length).toBeGreaterThanOrEqual(2);

    const search = await request(app).get("/api/recipes?q=buuz");
    expect(search.status).toBe(200);
    expect(search.body.some((r: { title: string }) => r.title.includes("Buuz"))).toBe(
      true,
    );
  });

  it("saved recipes toggle for authenticated user", async () => {
    const user = await signupUser(app, {
      email: "saver@integration.test",
      password: "password123",
    });
    const token = user.body.token as string;
    const recipeId = "mealdb-52772";

    const save = await request(app)
      .post("/api/saved-recipes")
      .set(authHeader(token))
      .send({ recipeId });

    expect(save.status).toBe(201);
    expect(save.body.saved).toBe(true);

    const list = await request(app)
      .get("/api/saved-recipes")
      .set(authHeader(token));

    expect(list.status).toBe(200);
    expect(list.body.recipeIds).toContain(recipeId);

    const remove = await request(app)
      .delete(`/api/saved-recipes/${recipeId}`)
      .set(authHeader(token));

    expect(remove.status).toBe(204);

    const after = await request(app)
      .get("/api/saved-recipes")
      .set(authHeader(token));

    expect(after.body.recipeIds).not.toContain(recipeId);
  });
});
