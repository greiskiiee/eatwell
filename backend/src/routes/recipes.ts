import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { optionalAuth } from "../middleware/optionalAuth";
import { toPublicComment } from "../lib/commentResponse";
import { CommentModel } from "../models/Comment";
import { PurchasedRecipeModel } from "../models/PurchasedRecipe";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";
import { validateRecipeCreate } from "../lib/recipeValidation";

export const recipesRouter = Router();

function normalizeImageUrls(body: {
  imageUrl?: unknown;
  imageUrls?: unknown;
}): { imageUrl: string; imageUrls: string[] } {
  const urls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter(
        (u): u is string => typeof u === "string" && u.trim().length > 0,
      )
    : [];
  const legacy =
    typeof body.imageUrl === "string" && body.imageUrl.trim().length > 0
      ? body.imageUrl.trim()
      : "";
  const imageUrls = urls.length > 0 ? urls : legacy ? [legacy] : [];
  return {
    imageUrls,
    imageUrl: imageUrls[0] ?? "",
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseIngredientQuery(value: unknown): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

recipesRouter.get("/", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const ingredients = parseIngredientQuery(req.query.ingredients);
  const maxMinutes = Number(req.query.maxMinutes);

  const filter: Record<string, unknown> = { isDraft: false };
  const and: Record<string, unknown>[] = [];

  if (q) {
    and.push({
      $or: [
        { title: { $regex: escapeRegex(q), $options: "i" } },
        { description: { $regex: escapeRegex(q), $options: "i" } },
      ],
    });
  }

  for (const ingredient of ingredients) {
    and.push({
      ingredients: { $regex: escapeRegex(ingredient), $options: "i" },
    });
  }

  if (Number.isFinite(maxMinutes) && maxMinutes > 0) {
    and.push({
      $expr: {
        $and: [
          {
            $gt: [
              {
                $add: [
                  { $ifNull: ["$prepTimeMinutes", 0] },
                  { $ifNull: ["$cookTimeMinutes", 0] },
                ],
              },
              0,
            ],
          },
          {
            $lte: [
              {
                $add: [
                  { $ifNull: ["$prepTimeMinutes", 0] },
                  { $ifNull: ["$cookTimeMinutes", 0] },
                ],
              },
              maxMinutes,
            ],
          },
        ],
      },
    });
  }

  if (and.length > 0) {
    filter.$and = and;
  }

  const recipes = await TechnologistRecipeModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
  return res.json(recipes);
});

recipesRouter.get(
  "/mine",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    if (req.auth!.role !== "technologist" && req.auth!.role !== "admin") {
      return res.status(403).json({ error: "FORBIDDEN" });
    }

    const filter =
      req.auth!.role === "admin" && typeof req.query.userId === "string"
        ? { createdByUserId: req.query.userId }
        : { createdByUserId: req.auth!.userId };

    const recipes = await TechnologistRecipeModel.find(filter).sort({
      updatedAt: -1,
    });
    return res.json(recipes);
  },
);

recipesRouter.get("/:recipeId/comments", async (req, res) => {
  const recipeId = String(req.params.recipeId ?? "").trim();
  if (!recipeId) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "recipeId" });
  }

  const comments = await CommentModel.find({ recipeId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("author", "name avatarUrl");

  return res.json(
    comments.map((c) => toPublicComment(c as never)),
  );
});

recipesRouter.post(
  "/:recipeId/comments",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const recipeId = String(req.params.recipeId ?? "").trim();
    const body =
      typeof req.body?.body === "string" ? req.body.body.trim() : "";

    if (!recipeId) {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "recipeId" });
    }
    if (!body) {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "body" });
    }
    if (body.length > 2000) {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "body" });
    }

    const created = await CommentModel.create({
      recipeId,
      author: req.auth!.userId,
      body,
    });

    const populated = await CommentModel.findById(created._id).populate(
      "author",
      "name avatarUrl",
    );
    if (!populated) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }

    return res
      .status(201)
      .json(toPublicComment(populated as never));
  },
);

recipesRouter.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "id" });
  }
  const recipe = await TechnologistRecipeModel.findById(id).lean();
  if (!recipe) return res.status(404).json({ error: "NOT_FOUND" });

  const isPremium = Boolean(recipe.isPremium) && (recipe.price ?? 0) > 0;
  let locked = false;

  if (isPremium) {
    const userId = req.auth?.userId;
    const isOwner =
      userId &&
      recipe.createdByUserId &&
      String(recipe.createdByUserId) === userId;
    const isAdmin = req.auth?.role === "admin";

    let purchased = false;
    if (userId) {
      purchased = Boolean(
        await PurchasedRecipeModel.exists({ userId, recipeId: id }),
      );
    }

    if (!isOwner && !isAdmin && !purchased) {
      locked = true;
    }
  }

  if (locked) {
    return res.json({
      ...recipe,
      ingredients: [],
      steps: [],
      videoUrl: "",
      locked: true,
    });
  }

  return res.json({ ...recipe, locked: false });
});

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
    imageUrl,
    imageUrls,
    videoUrl,
  } = req.body ?? {};

  const validated = validateRecipeCreate({
    title,
    isDraft,
    ingredients,
    steps,
    isPremium,
    price,
  });
  if (!validated.ok) {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: validated.field });
  }

  const images = normalizeImageUrls({ imageUrl, imageUrls });

  const recipe = await TechnologistRecipeModel.create({
    title: validated.title,
    description,
    servings,
    prepTimeMinutes,
    cookTimeMinutes,
    tags,
    ingredients: validated.ingredients,
    steps: validated.steps,
    nutrition,
    isDraft: validated.isDraft,
    isPremium: validated.isPremium,
    price: validated.price,
    imageUrl: images.imageUrl,
    imageUrls: images.imageUrls,
    videoUrl: typeof videoUrl === "string" ? videoUrl : "",
    createdByUserId: req.auth!.userId,
    createdBy: "food-technologist",
  });

  return res.status(201).json(recipe);
});

recipesRouter.patch(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    if (req.auth!.role !== "technologist" && req.auth!.role !== "admin") {
      return res.status(403).json({ error: "FORBIDDEN" });
    }

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

    const body = { ...(req.body ?? {}) };
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.createdByUserId;

    if ("imageUrl" in body || "imageUrls" in body) {
      const images = normalizeImageUrls(body);
      body.imageUrl = images.imageUrl;
      body.imageUrls = images.imageUrls;
    }

    const recipe = await TechnologistRecipeModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!recipe) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(recipe);
  },
);
