import mongoose, { type InferSchemaType } from "mongoose";

const PasswordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true },
);

PasswordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetOtp = InferSchemaType<typeof PasswordResetOtpSchema>;

export const PasswordResetOtpModel =
  (mongoose.models.PasswordResetOtp as mongoose.Model<PasswordResetOtp>) ||
  mongoose.model("PasswordResetOtp", PasswordResetOtpSchema);
