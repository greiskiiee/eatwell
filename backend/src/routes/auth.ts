import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { UserModel, type UserRole } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { signAccessToken } from "../lib/auth";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

export const authRouter = Router();
export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

authRouter.post("/signup", async (req, res) => {
  const { email, password, name, role } = req.body ?? {};

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
  const userRole: UserRole =
    role === "technologist" || role === "admin" || role === "user"
      ? role
      : "user";

  try {
    const user = await UserModel.create({
      email: normalizedEmail,
      passwordHash,
      name: typeof name === "string" ? name : "",
      role: userRole,
    });

    if (userRole === "technologist") {
      await TechnologistProfileModel.create({
        userId: user._id,
        displayName: user.name,
      });
    }

    const token = signAccessToken({ sub: String(user._id), role: user.role });
    return res.status(201).json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
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

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const token = signAccessToken({ sub: String(user._id), role: user.role });
  return res.json({
    token,
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    },
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
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await UserModel.findById(req.auth!.userId).select(
    "-passwordHash",
  );
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(user);
});
