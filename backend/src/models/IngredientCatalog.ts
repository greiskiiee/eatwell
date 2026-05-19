import mongoose, { type InferSchemaType } from "mongoose";

const IngredientCatalogSchema = new mongoose.Schema(
  {
    mealDbKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mealDbName: { type: String, required: true, trim: true },
    nameMn: { type: String, required: true, trim: true },
    group: { type: String, default: "other" },
    thumb: { type: String, default: "" },
  },
  { timestamps: true },
);

IngredientCatalogSchema.index({ nameMn: "text", mealDbName: "text" });

export type IngredientCatalog = InferSchemaType<typeof IngredientCatalogSchema>;

export const IngredientCatalogModel =
  (mongoose.models.IngredientCatalog as mongoose.Model<IngredientCatalog>) ||
  mongoose.model("IngredientCatalog", IngredientCatalogSchema);

export function normalizeMealDbKey(name: string) {
  return name.trim().toLowerCase();
}
