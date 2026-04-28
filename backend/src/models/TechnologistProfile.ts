import mongoose, { type InferSchemaType } from "mongoose";

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
  },
  { timestamps: true },
);

export type TechnologistProfile = InferSchemaType<typeof TechnologistProfileSchema>;

export const TechnologistProfileModel =
  (mongoose.models.TechnologistProfile as mongoose.Model<TechnologistProfile>) ||
  mongoose.model("TechnologistProfile", TechnologistProfileSchema);

