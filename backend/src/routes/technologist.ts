import { Router } from "express";
import mongoose from "mongoose";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";
import { PurchasedRecipeModel } from "../models/PurchasedRecipe";
import { CommentModel } from "../models/Comment";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";

export const technologistRouter = Router();

technologistRouter.get(
  "/me",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    const profile = await TechnologistProfileModel.findOne({
      userId: req.auth!.userId,
    }).populate({
      path: "myRecipes",
      options: { sort: { updatedAt: -1 } },
    });

    if (!profile) {
      return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
    }

    return res.json(profile);
  },
);

technologistRouter.get(
  "/analytics",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    const userId = new mongoose.Types.ObjectId(req.auth!.userId);

    const recipes = await TechnologistRecipeModel.find({
      createdByUserId: userId,
    })
      .select("title imageUrl views isDraft isPremium price createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const recipeIds = recipes.map((r) => r._id);

    const [purchaseAgg, commentAgg] = await Promise.all([
      PurchasedRecipeModel.aggregate([
        { $match: { recipeId: { $in: recipeIds } } },
        {
          $group: {
            _id: "$recipeId",
            count: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
      ]),
      CommentModel.aggregate([
        { $match: { recipeId: { $in: recipeIds.map((id) => String(id)) } } },
        { $group: { _id: "$recipeId", count: { $sum: 1 } } },
      ]),
    ]);

    const purchaseMap = new Map<string, { count: number; revenue: number }>();
    for (const row of purchaseAgg) {
      purchaseMap.set(String(row._id), {
        count: row.count ?? 0,
        revenue: row.revenue ?? 0,
      });
    }

    const commentMap = new Map<string, number>();
    for (const row of commentAgg) {
      commentMap.set(String(row._id), row.count ?? 0);
    }

    const items = recipes.map((r) => {
      const id = String(r._id);
      const p = purchaseMap.get(id) ?? { count: 0, revenue: 0 };
      return {
        _id: id,
        title: r.title,
        imageUrl: r.imageUrl ?? "",
        isDraft: Boolean(r.isDraft),
        isPremium: Boolean(r.isPremium),
        price: r.price ?? 0,
        views: r.views ?? 0,
        purchases: p.count,
        revenue: p.revenue,
        comments: commentMap.get(id) ?? 0,
        createdAt: r.createdAt,
      };
    });

    const totals = items.reduce(
      (acc, r) => ({
        recipes: acc.recipes + 1,
        published: acc.published + (r.isDraft ? 0 : 1),
        views: acc.views + r.views,
        purchases: acc.purchases + r.purchases,
        revenue: acc.revenue + r.revenue,
        comments: acc.comments + r.comments,
      }),
      { recipes: 0, published: 0, views: 0, purchases: 0, revenue: 0, comments: 0 },
    );

    return res.json({ items, totals });
  },
);

technologistRouter.patch(
  "/me",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    const { credentials, bio, displayName } = req.body ?? {};
    const update: Record<string, string> = {};

    if (typeof credentials === "string") update.credentials = credentials.trim();
    if (typeof bio === "string") update.bio = bio.trim();
    if (typeof displayName === "string") update.displayName = displayName.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    const profile = await TechnologistProfileModel.findOneAndUpdate(
      { userId: req.auth!.userId },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
    }

    return res.json(profile);
  },
);
