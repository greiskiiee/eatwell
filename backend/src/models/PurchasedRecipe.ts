import mongoose, { type InferSchemaType } from "mongoose";

const PurchasedRecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnologistRecipe",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["khan", "golomt", "turiin", "qpay"],
      required: true,
    },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

PurchasedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export type PurchasedRecipe = InferSchemaType<typeof PurchasedRecipeSchema>;

export const PurchasedRecipeModel =
  (mongoose.models.PurchasedRecipe as mongoose.Model<PurchasedRecipe>) ||
  mongoose.model("PurchasedRecipe", PurchasedRecipeSchema);
