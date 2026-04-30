import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";

export const recipesRouter = Router();

recipesRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.auth!.role !== "technologist" && req.auth!.role !== "admin") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }
  const {
    title,
    description,
    servings,
    prepTimeMinutes,
    cookTimeMinutes,
    tags,
    ingredients,
    steps,
    nutrition,
    isDraft,
    isPremium,
    price,
  } = req.body ?? {};

  if (!title?.trim())
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "title" });

  const recipe = await TechnologistRecipeModel.create({
    title: title.trim(),
    description,
    servings,
    prepTimeMinutes,
    cookTimeMinutes,
    tags,
    ingredients,
    steps,
    nutrition,
    isDraft: isDraft ?? true,
    isPremium: isPremium ?? false,
    price: isPremium ? price : 0,
    createdByUserId: req.auth!.userId,
    createdBy: "food-technologist",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return res.status(201).json(recipe);
});
