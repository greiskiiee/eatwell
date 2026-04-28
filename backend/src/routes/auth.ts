import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel, type UserRole } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { signAccessToken } from "../lib/auth";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const { email, password, name, role } = req.body ?? {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "email" });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "password" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const userRole: UserRole =
    role === "technologist" || role === "admin" || role === "user" ? role : "user";

  try {
    const user = await UserModel.create({
      email: normalizedEmail,
      passwordHash,
      name: typeof name === "string" ? name : "",
      role: userRole,
    });

    if (userRole === "technologist") {
      await TechnologistProfileModel.create({ userId: user._id, displayName: user.name });
    }

    const token = signAccessToken({ sub: String(user._id), role: user.role });
    return res.status(201).json({
      token,
      user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
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
    return res.status(400).json({ error: "VALIDATION_ERROR", field: "password" });
  }

  const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
  if (!user || !user.isActive) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const token = signAccessToken({ sub: String(user._id), role: user.role });
  return res.json({
    token,
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await UserModel.findById(req.auth!.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(user);
});

