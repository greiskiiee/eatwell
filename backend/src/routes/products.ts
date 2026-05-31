import { Router } from "express";
import { optionalAuth } from "../middleware/optionalAuth";
import type { AuthenticatedRequest } from "../middleware/auth";
import { ProductModel, normalizeBarcode } from "../models/Product";

export const productsRouter = Router();

const ALLOWED_GRADES = ["a", "b", "c", "d", "e"] as const;
type NutriscoreGrade = (typeof ALLOWED_GRADES)[number] | "";

function isNutriscoreGrade(value: string): value is NutriscoreGrade {
  return value === "" || (ALLOWED_GRADES as readonly string[]).includes(value);
}

function toDto(doc: {
  _id: unknown;
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  ingredientsText: string;
  nutriscoreGrade: string;
  nutriments?: {
    energyKcal100g?: number | null;
    sugars100g?: number | null;
    fat100g?: number | null;
    saturatedFat100g?: number | null;
    salt100g?: number | null;
    proteins100g?: number | null;
    fiber100g?: number | null;
  } | null;
  allergens: string[];
  source: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: String(doc._id),
    barcode: doc.barcode,
    name: doc.name,
    brand: doc.brand,
    imageUrl: doc.imageUrl,
    ingredientsText: doc.ingredientsText,
    nutriscoreGrade: doc.nutriscoreGrade,
    nutriments: {
      energyKcal100g: doc.nutriments?.energyKcal100g ?? undefined,
      sugars100g: doc.nutriments?.sugars100g ?? undefined,
      fat100g: doc.nutriments?.fat100g ?? undefined,
      saturatedFat100g: doc.nutriments?.saturatedFat100g ?? undefined,
      salt100g: doc.nutriments?.salt100g ?? undefined,
      proteins100g: doc.nutriments?.proteins100g ?? undefined,
      fiber100g: doc.nutriments?.fiber100g ?? undefined,
    },
    allergens: doc.allergens ?? [],
    source: doc.source,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

productsRouter.get("/:barcode", async (req, res) => {
  const barcode = normalizeBarcode(req.params.barcode ?? "");
  if (!barcode) {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: "barcode" });
  }

  const doc = await ProductModel.findOne({ barcode }).lean();
  if (!doc) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(toDto(doc));
});

productsRouter.post(
  "/",
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    const body = req.body ?? {};

    const barcode = normalizeBarcode(toTrimmedString(body.barcode));
    const name = toTrimmedString(body.name);

    if (!barcode) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", field: "barcode" });
    }
    if (!name) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", field: "name" });
    }

    const existing = await ProductModel.findOne({ barcode }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ error: "ALREADY_EXISTS", product: toDto(existing) });
    }

    const rawGrade = toTrimmedString(body.nutriscoreGrade).toLowerCase();
    const nutriscoreGrade: NutriscoreGrade = isNutriscoreGrade(rawGrade)
      ? rawGrade
      : "";

    const nutrimentsInput = body.nutriments ?? {};
    const nutriments = {
      energyKcal100g: toOptionalNumber(nutrimentsInput.energyKcal100g),
      sugars100g: toOptionalNumber(nutrimentsInput.sugars100g),
      fat100g: toOptionalNumber(nutrimentsInput.fat100g),
      saturatedFat100g: toOptionalNumber(nutrimentsInput.saturatedFat100g),
      salt100g: toOptionalNumber(nutrimentsInput.salt100g),
      proteins100g: toOptionalNumber(nutrimentsInput.proteins100g),
      fiber100g: toOptionalNumber(nutrimentsInput.fiber100g),
    };

    const doc = await ProductModel.create({
      barcode,
      name,
      brand: toTrimmedString(body.brand),
      imageUrl: toTrimmedString(body.imageUrl),
      ingredientsText:
        typeof body.ingredientsText === "string" ? body.ingredientsText : "",
      nutriscoreGrade,
      nutriments,
      allergens: toStringArray(body.allergens),
      source: "user",
      createdByUserId: req.auth?.userId,
    });

    return res.status(201).json(toDto(doc.toObject()));
  },
);
