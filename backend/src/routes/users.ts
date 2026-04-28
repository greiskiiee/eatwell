import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel, type UserRole } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

export const usersRouter = Router();

function canManageUser(requester: { userId: string; role: string }, targetUserId: string) {
  return requester.role === "admin" || requester.userId === targetUserId;
}

// Admin only: list users (basic fields)
usersRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.auth!.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
  const users = await UserModel.find().select("email name role isActive createdAt updatedAt");
  return res.json(users);
});

// Self or admin: update user
usersRouter.patch("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  if (!canManageUser(req.auth!, id)) return res.status(403).json({ error: "FORBIDDEN" });

  const update: Record<string, unknown> = {};
  const { name, password, role, isActive } = req.body ?? {};

  if (typeof name === "string") update.name = name;

  if (typeof password === "string" && password.length > 0) {
    if (password.length < 8) {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "password" });
    }
    update.passwordHash = await bcrypt.hash(password, 10);
  }

  if (typeof isActive === "boolean") {
    if (req.auth!.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
    update.isActive = isActive;
  }

  if (typeof role === "string") {
    if (req.auth!.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
    const nextRole: UserRole =
      role === "user" || role === "technologist" || role === "admin" ? role : "user";
    update.role = nextRole;
  }

  const user = await UserModel.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!user) return res.status(404).json({ error: "NOT_FOUND" });

  // ensure profile exists when promoted to technologist
  if (req.auth!.role === "admin" && user.role === "technologist") {
    await TechnologistProfileModel.updateOne(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, displayName: user.name } },
      { upsert: true },
    );
  }

  return res.json(user);
});

// Self or admin: delete user
usersRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  if (!canManageUser(req.auth!, id)) return res.status(403).json({ error: "FORBIDDEN" });

  const deleted = await UserModel.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "NOT_FOUND" });
  await TechnologistProfileModel.deleteOne({ userId: deleted._id });

  return res.status(204).send();
});

