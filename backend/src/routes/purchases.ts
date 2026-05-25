import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { PurchasedRecipeModel } from "../models/PurchasedRecipe";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";

export const purchasesRouter = Router();

const METHODS = ["khan", "golomt", "turiin", "qpay"] as const;

purchasesRouter.get(
  "/me",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const purchases = await PurchasedRecipeModel.find({
      userId: req.auth!.userId,
    })
      .sort({ purchasedAt: -1 })
      .lean();

    const recipeIds = purchases.map((p) => p.recipeId);
    const recipes = await TechnologistRecipeModel.find({
      _id: { $in: recipeIds },
    }).lean();
    const recipeMap = new Map(recipes.map((r) => [String(r._id), r]));

    return res.json({
      purchases: purchases.map((p) => ({
        recipeId: String(p.recipeId),
        amount: p.amount,
        method: p.method,
        purchasedAt: p.purchasedAt,
        recipe: recipeMap.get(String(p.recipeId)) ?? null,
      })),
    });
  },
);

purchasesRouter.get(
  "/check/:recipeId",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const recipeId = String(req.params.recipeId ?? "");
    if (!mongoose.isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    const existing = await PurchasedRecipeModel.findOne({
      userId: req.auth!.userId,
      recipeId,
    }).lean();

    return res.json({ purchased: Boolean(existing) });
  },
);

purchasesRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const recipeId =
    typeof req.body?.recipeId === "string" ? req.body.recipeId.trim() : "";
  const method =
    typeof req.body?.method === "string" ? req.body.method.trim() : "";

  if (!mongoose.isValidObjectId(recipeId)) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "recipeId" });
  }
  if (!METHODS.includes(method as (typeof METHODS)[number])) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "method" });
  }

  const recipe = await TechnologistRecipeModel.findById(recipeId).lean();
  if (!recipe || recipe.isDraft) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }
  if (!recipe.isPremium || (recipe.price ?? 0) <= 0) {
    return res.status(400).json({ error: "NOT_PREMIUM" });
  }

  if (
    recipe.createdByUserId &&
    String(recipe.createdByUserId) === req.auth!.userId
  ) {
    return res.status(400).json({ error: "OWN_RECIPE" });
  }

  const amount = recipe.price ?? 0;

  const purchase = await PurchasedRecipeModel.findOneAndUpdate(
    { userId: req.auth!.userId, recipeId },
    {
      userId: req.auth!.userId,
      recipeId,
      amount,
      method,
      purchasedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  return res.status(201).json({
    purchased: true,
    recipeId: String(purchase.recipeId),
    amount: purchase.amount,
    method: purchase.method,
    purchasedAt: purchase.purchasedAt,
  });
});
