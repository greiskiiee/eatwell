import { Router } from "express";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";

export const technologistRouter = Router();

technologistRouter.get(
  "/me",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    const profile = await TechnologistProfileModel.findOne({
      userId: req.auth!.userId,
    }).populate({
      path: "myRecipes",
      options: { sort: { updatedAt: -1 } },
    });

    if (!profile) {
      return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
    }

    return res.json(profile);
  },
);

technologistRouter.patch(
  "/me",
  requireAuth,
  requireRole(["technologist", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    const { credentials, bio, displayName } = req.body ?? {};
    const update: Record<string, string> = {};

    if (typeof credentials === "string") update.credentials = credentials.trim();
    if (typeof bio === "string") update.bio = bio.trim();
    if (typeof displayName === "string") update.displayName = displayName.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    const profile = await TechnologistProfileModel.findOneAndUpdate(
      { userId: req.auth!.userId },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
    }

    return res.json(profile);
  },
);
