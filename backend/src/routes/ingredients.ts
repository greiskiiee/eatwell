import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { syncMealDbIngredients } from "../lib/mealdbIngredients";
import {
  IngredientCatalogModel,
  normalizeMealDbKey,
} from "../models/IngredientCatalog";

export const ingredientsRouter = Router();

function toDto(doc: {
  mealDbKey: string;
  mealDbName: string;
  nameMn: string;
  group: string;
  thumb: string;
}) {
  return {
    mealDbKey: doc.mealDbKey,
    mealDbName: doc.mealDbName,
    nameMn: doc.nameMn,
    group: doc.group,
    thumb: doc.thumb,
  };
}

ingredientsRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "500"), 10) || 500, 1),
    2000,
  );

  let count = await IngredientCatalogModel.estimatedDocumentCount();
  if (count === 0) {
    await syncMealDbIngredients();
    count = await IngredientCatalogModel.estimatedDocumentCount();
  }

  const filter = q
    ? {
        $or: [
          { nameMn: { $regex: q, $options: "i" } },
          { mealDbName: { $regex: q, $options: "i" } },
          { mealDbKey: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const items = await IngredientCatalogModel.find(filter)
    .sort({ nameMn: 1 })
    .limit(limit)
    .lean();

  return res.json({ items: items.map(toDto), total: count });
});

ingredientsRouter.post("/labels", async (req, res) => {
  const names = Array.isArray(req.body?.names)
    ? (req.body.names as unknown[])
        .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
        .map((n) => n.trim())
    : [];

  if (names.length === 0) {
    return res.json({ labels: {} as Record<string, { mealDbName: string; nameMn: string }> });
  }

  const keys = [...new Set(names.map(normalizeMealDbKey))];
  const docs = await IngredientCatalogModel.find({
    $or: [
      { mealDbKey: { $in: keys } },
      { mealDbName: { $in: names } },
    ],
  }).lean();

  const labels: Record<string, { mealDbName: string; nameMn: string }> = {};
  for (const name of names) {
    const key = normalizeMealDbKey(name);
    const doc =
      docs.find((d) => d.mealDbKey === key) ??
      docs.find((d) => d.mealDbName.toLowerCase() === name.toLowerCase());
    labels[name] = {
      mealDbName: doc?.mealDbName ?? name,
      nameMn: doc?.nameMn ?? name,
    };
  }

  return res.json({ labels });
});

ingredientsRouter.post(
  "/sync",
  requireAuth,
  requireRole(["admin"]),
  async (_req, res) => {
    const result = await syncMealDbIngredients();
    return res.json(result);
  },
);

ingredientsRouter.patch(
  "/:mealDbKey",
  requireAuth,
  requireRole(["admin"]),
  async (req, res) => {
    const rawKey = req.params.mealDbKey;
    const mealDbKey = normalizeMealDbKey(
      typeof rawKey === "string" ? rawKey : "",
    );
    const nameMn =
      typeof req.body?.nameMn === "string" ? req.body.nameMn.trim() : "";
    if (!mealDbKey || !nameMn) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    const doc = await IngredientCatalogModel.findOneAndUpdate(
      { mealDbKey },
      { $set: { nameMn } },
      { new: true },
    ).lean();

    if (!doc) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(toDto(doc));
  },
);
