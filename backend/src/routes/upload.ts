import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { uploadImageBuffer, isCloudinaryConfigured } from "../lib/cloudinary";
import { imageUpload } from "../lib/imageMulter";
import { UserModel } from "../models/User";
import { toPublicUser } from "../lib/userResponse";

export const uploadRouter = Router();

function handleMulter(field: string) {
  return (req: AuthenticatedRequest, res: import("express").Response, next: import("express").NextFunction) => {
    imageUpload.single(field)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          field,
          message: err.message,
        });
      }
      next();
    });
  };
}

uploadRouter.post(
  "/avatar",
  requireAuth,
  handleMulter("image"),
  async (req: AuthenticatedRequest, res) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: "CLOUDINARY_NOT_CONFIGURED" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "image" });
    }

    try {
      const url = await uploadImageBuffer(
        req.file.buffer,
        req.file.mimetype,
        "eatwell/avatars",
      );

      const user = await UserModel.findByIdAndUpdate(
        req.auth!.userId,
        { avatarUrl: url },
        { new: true, runValidators: true },
      ).select("-passwordHash");

      if (!user) return res.status(404).json({ error: "NOT_FOUND" });

      return res.json({ url, user: toPublicUser(user) });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const message =
        err instanceof Error ? err.message : "Unknown upload error";
      return res.status(500).json({
        error: "UPLOAD_FAILED",
        message:
          process.env.NODE_ENV === "production" ? undefined : message,
      });
    }
  },
);

uploadRouter.post(
  "/recipe-image",
  requireAuth,
  handleMulter("image"),
  async (req: AuthenticatedRequest, res) => {
    if (req.auth!.role !== "technologist" && req.auth!.role !== "admin") {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: "CLOUDINARY_NOT_CONFIGURED" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "image" });
    }

    try {
      const url = await uploadImageBuffer(
        req.file.buffer,
        req.file.mimetype,
        "eatwell/recipes",
      );
      return res.json({ url });
    } catch (err) {
      console.error("Recipe image upload failed:", err);
      const message =
        err instanceof Error ? err.message : "Unknown upload error";
      return res.status(500).json({
        error: "UPLOAD_FAILED",
        message:
          process.env.NODE_ENV === "production" ? undefined : message,
      });
    }
  },
);
