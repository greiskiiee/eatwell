import mongoose, { type InferSchemaType } from "mongoose";

const SavedRecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeId: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

SavedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export type SavedRecipe = InferSchemaType<typeof SavedRecipeSchema>;

export const SavedRecipeModel =
  (mongoose.models.SavedRecipe as mongoose.Model<SavedRecipe>) ||
  mongoose.model("SavedRecipe", SavedRecipeSchema);
