import bcrypt from "bcryptjs";
import { PasswordResetOtpModel } from "../models/PasswordResetOtp";
import { UserModel } from "../models/User";
import { sendPasswordResetOtpEmail } from "./email";

const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;

function otpTtlMs() {
  const minutes = Number(process.env.PASSWORD_RESET_OTP_TTL_MINUTES ?? 10);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60_000;
}

function generateOtpCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function requestPasswordResetOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserModel.findOne({
    email: normalizedEmail,
    isActive: true,
  });

  if (!user) {
    return { sent: false as const };
  }

  const existing = await PasswordResetOtpModel.findOne({ email: normalizedEmail });
  if (
    existing?.lastSentAt &&
    Date.now() - existing.lastSentAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    return { sent: true as const, rateLimited: true as const };
  }

  const code = generateOtpCode();
  const otpHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + otpTtlMs());

  await PasswordResetOtpModel.findOneAndUpdate(
    { email: normalizedEmail },
    {
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    { upsert: true, new: true },
  );

  await sendPasswordResetOtpEmail({
    to: normalizedEmail,
    name: user.name ?? "",
    code,
  });

  return { sent: true as const, userId: String(user._id) };
}

export async function verifyPasswordResetOtp(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const record = await PasswordResetOtpModel.findOne({ email: normalizedEmail });

  if (!record) {
    return { ok: false as const, error: "INVALID_OTP" as const };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await PasswordResetOtpModel.deleteOne({ email: normalizedEmail });
    return { ok: false as const, error: "OTP_EXPIRED" as const };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false as const, error: "TOO_MANY_ATTEMPTS" as const };
  }

  const match = await bcrypt.compare(otp, record.otpHash);
  if (!match) {
    await PasswordResetOtpModel.updateOne(
      { email: normalizedEmail },
      { $inc: { attempts: 1 } },
    );
    return { ok: false as const, error: "INVALID_OTP" as const };
  }

  const user = await UserModel.findOne({
    email: normalizedEmail,
    isActive: true,
  });
  if (!user) {
    return { ok: false as const, error: "INVALID_OTP" as const };
  }

  return { ok: true as const, userId: String(user._id) };
}

export async function clearPasswordResetOtp(email: string) {
  await PasswordResetOtpModel.deleteOne({ email: email.trim().toLowerCase() });
}
