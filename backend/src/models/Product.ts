import mongoose, { type InferSchemaType } from "mongoose";

const ProductNutrimentsSchema = new mongoose.Schema(
  {
    energyKcal100g: { type: Number, min: 0 },
    sugars100g: { type: Number, min: 0 },
    fat100g: { type: Number, min: 0 },
    saturatedFat100g: { type: Number, min: 0 },
    salt100g: { type: Number, min: 0 },
    proteins100g: { type: Number, min: 0 },
    fiber100g: { type: Number, min: 0 },
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    ingredientsText: { type: String, default: "" },
    nutriscoreGrade: {
      type: String,
      enum: ["a", "b", "c", "d", "e", ""],
      default: "",
      lowercase: true,
      trim: true,
    },
    nutriments: { type: ProductNutrimentsSchema, default: () => ({}) },
    allergens: { type: [String], default: [] },
    source: { type: String, default: "user", trim: true },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", brand: "text" });

export type Product = InferSchemaType<typeof ProductSchema>;

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<Product>) ||
  mongoose.model("Product", ProductSchema);

export function normalizeBarcode(value: string): string {
  return value.trim().replace(/\s+/g, "");
}
