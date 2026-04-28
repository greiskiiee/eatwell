import { Router } from "express";
import mongoose from "mongoose";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";

export const technologistRecipesRouter = Router();

technologistRecipesRouter.post(
  "/",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
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
  } = req.body ?? {};

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "title" });
  }

  const doc = await TechnologistRecipeModel.create({
    title,
    description,
    servings,
    prepTimeMinutes,
    cookTimeMinutes,
    tags,
    ingredients,
    steps,
    nutrition,
    createdByUserId: req.auth!.userId,
  });

  return res.status(201).json(doc);
});

technologistRecipesRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;

  const filter: Record<string, unknown> = {};
  if (tag) filter.tags = tag;
  if (q) filter.$text = { $search: q };

  const docs = await TechnologistRecipeModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(docs);
});

technologistRecipesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "id" });
  }
  const doc = await TechnologistRecipeModel.findById(id);
  if (!doc) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(doc);
});

technologistRecipesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "id" });
  }

  const existing = await TechnologistRecipeModel.findById(id);
  if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
  if (
    req.auth!.role !== "admin" &&
    existing.createdByUserId &&
    String(existing.createdByUserId) !== req.auth!.userId
  ) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const update = req.body ?? {};
  delete update._id;
  delete update.createdAt;
  delete update.updatedAt;
  delete update.createdByUserId;

  const doc = await TechnologistRecipeModel.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!doc) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(doc);
});

technologistRecipesRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "id" });
  }

  const existing = await TechnologistRecipeModel.findById(id);
  if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
  if (
    req.auth!.role !== "admin" &&
    existing.createdByUserId &&
    String(existing.createdByUserId) !== req.auth!.userId
  ) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const deleted = await TechnologistRecipeModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "NOT_FOUND" });
  return res.status(204).send();
});

