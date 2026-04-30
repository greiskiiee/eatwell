import mongoose, { type InferSchemaType } from "mongoose";

const TechnologistRecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    servings: { type: Number, min: 1 },
    prepTimeMinutes: { type: Number, min: 0 },
    cookTimeMinutes: { type: Number, min: 0 },
    tags: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    nutrition: {
      calories: { type: Number, min: 0 },
      proteinG: { type: Number, min: 0 },
      carbsG: { type: Number, min: 0 },
      fatG: { type: Number, min: 0 },
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    isDraft: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
    price: { type: Number, min: 0, default: 0 },
    createdBy: { type: String, default: "food-technologist" },
    videoUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },

  { timestamps: true },
);

TechnologistRecipeSchema.index({ title: "text", description: "text" });

export type TechnologistRecipe = InferSchemaType<
  typeof TechnologistRecipeSchema
>;

export const TechnologistRecipeModel =
  (mongoose.models.TechnologistRecipe as mongoose.Model<TechnologistRecipe>) ||
  mongoose.model("TechnologistRecipe", TechnologistRecipeSchema);
