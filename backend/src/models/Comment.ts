import mongoose, { type InferSchemaType } from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    recipeId: { type: String, required: true, trim: true, index: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

CommentSchema.index({ recipeId: 1, createdAt: -1 });

export type Comment = InferSchemaType<typeof CommentSchema>;

export const CommentModel =
  (mongoose.models.Comment as mongoose.Model<Comment>) ||
  mongoose.model("Comment", CommentSchema);
