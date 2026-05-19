import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { SavedRecipeModel } from "../models/SavedRecipe";

export const savedRecipesRouter = Router();

savedRecipesRouter.use(requireAuth);

savedRecipesRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const rows = await SavedRecipeModel.find({ userId: req.auth!.userId })
    .sort({ createdAt: -1 })
    .select("recipeId");
  return res.json({ recipeIds: rows.map((r) => r.recipeId) });
});

savedRecipesRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const recipeId =
    typeof req.body?.recipeId === "string" ? req.body.recipeId.trim() : "";
  if (!recipeId) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "recipeId" });
  }

  await SavedRecipeModel.updateOne(
    { userId: req.auth!.userId, recipeId },
    { $setOnInsert: { userId: req.auth!.userId, recipeId } },
    { upsert: true },
  );

  return res.status(201).json({ recipeId, saved: true });
});

savedRecipesRouter.delete("/:recipeId", async (req: AuthenticatedRequest, res) => {
  const recipeId = String(req.params.recipeId ?? "").trim();
  if (!recipeId) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "recipeId" });
  }

  await SavedRecipeModel.deleteOne({
    userId: req.auth!.userId,
    recipeId,
  });

  return res.status(204).send();
});
