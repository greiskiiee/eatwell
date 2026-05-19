import mongoose, { type InferSchemaType } from "mongoose";

export type ApprovalStatus = "pending" | "approved" | "rejected";

const TechnologistProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    displayName: { type: String, default: "" },
    credentials: { type: String, default: "" },
    bio: { type: String, default: "" },
    certificateUrl: { type: String, default: "" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

TechnologistProfileSchema.virtual("myRecipes", {
  ref: "TechnologistRecipe",
  localField: "userId",
  foreignField: "createdByUserId",
});

export type TechnologistProfile = InferSchemaType<typeof TechnologistProfileSchema>;

export const TechnologistProfileModel =
  (mongoose.models.TechnologistProfile as mongoose.Model<TechnologistProfile>) ||
  mongoose.model("TechnologistProfile", TechnologistProfileSchema);
