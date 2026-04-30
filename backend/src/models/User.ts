import mongoose, { type InferSchemaType } from "mongoose";

export type UserRole = "user" | "technologist" | "admin";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "technologist", "admin"],
      default: "user",
      index: true,
    },
    isActive: { type: Boolean, default: true },
    allergens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof UserSchema>;

export const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model("User", UserSchema);
