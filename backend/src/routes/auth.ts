import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { UserModel } from "../models/User";
import { signAccessToken, signResetToken, verifyResetToken } from "../lib/auth";
import {
  clearPasswordResetOtp,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
} from "../lib/passwordReset";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { toPublicUser } from "../lib/userResponse";

export const authRouter = Router();
export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

authRouter.post("/signup", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "email" });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: "password" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // Regular signup is always "user" — technologists use /api/technologist-auth/signup
  const userRole = "user" as const;

  try {
    const user = await UserModel.create({
      email: normalizedEmail,
      passwordHash,
      name: typeof name === "string" ? name : "",
      role: userRole,
    });

    const token = signAccessToken({ sub: String(user._id), role: user.role });
    return res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("duplicate key")) {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    throw e;
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "email" });
  }
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: "password" });
  }

  const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
  if (!user || !user.isActive)
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  if (user.role === "technologist") {
    return res.status(403).json({
      error: "USE_TECHNOLOGIST_LOGIN",
      message: "Use /technologist/login for food technologist accounts",
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const token = signAccessToken({ sub: String(user._id), role: user.role });
  return res.json({
    token,
    user: toPublicUser(user),
  });
});

authRouter.post("/google", async (req, res) => {
  const { idToken } = req.body ?? {};
  if (!idToken || typeof idToken !== "string") {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: "idToken" });
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "MISSING_GOOGLE_CLIENT_ID" });
  }

  let payload:
    | {
        email?: string;
        name?: string;
      }
    | undefined;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "INVALID_GOOGLE_TOKEN" });
  }

  const email = payload?.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "GOOGLE_EMAIL_REQUIRED" });

  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.create({
      email,
      passwordHash: `google-oauth-${Date.now()}`,
      name: payload?.name ?? "",
      role: "user",
      isActive: true,
    });
  }

  if (!user.isActive)
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const token = signAccessToken({ sub: String(user._id), role: user.role });
  return res.json({
    token,
    user: toPublicUser(user),
  });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "email" });
  }

  await requestPasswordResetOtp(email);

  return res.json({
    message: "Хэрэв энэ и-мэйл бүртгэлтэй бол нууц үг сэргээх код илгээгдэнэ.",
  });
});

authRouter.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body ?? {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "email" });
  }
  if (!otp || typeof otp !== "string" || !/^\d{4}$/.test(otp)) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "otp" });
  }

  const result = await verifyPasswordResetOtp(email, otp);
  if (!result.ok) {
    const status = result.error === "TOO_MANY_ATTEMPTS" ? 429 : 400;
    return res.status(status).json({ error: result.error });
  }

  const resetToken = signResetToken(result.userId);
  return res.json({ resetToken });
});

authRouter.post("/reset-password", async (req, res) => {
  const { resetToken, password } = req.body ?? {};
  if (!resetToken || typeof resetToken !== "string") {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: "resetToken" });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "VALIDATION_ERROR", field: "password" });
  }

  let userId: string;
  try {
    userId = verifyResetToken(resetToken);
  } catch {
    return res.status(400).json({ error: "INVALID_RESET_TOKEN" });
  }

  const user = await UserModel.findById(userId);
  if (!user || !user.isActive) {
    return res.status(400).json({ error: "INVALID_RESET_TOKEN" });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  await clearPasswordResetOtp(user.email);

  return res.json({ message: "Нууц үг амжилттай шинэчлэгдлээ." });
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await UserModel.findById(req.auth!.userId).select(
    "-passwordHash",
  );
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(user);
});

authRouter.patch(
  "/allergens",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { allergens } = req.body ?? {};

    if (!Array.isArray(allergens)) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", field: "allergens" });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.auth!.userId,
      { allergens },
      { new: true, runValidators: true },
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ error: "NOT_FOUND" });

    return res.json(user);
  },
);
