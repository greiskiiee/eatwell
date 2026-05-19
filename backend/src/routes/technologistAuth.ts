import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { signAccessToken } from "../lib/auth";
import { imageUpload } from "../lib/imageMulter";
import { uploadFileBuffer, isCloudinaryConfigured } from "../lib/cloudinary";
import { toPublicUser } from "../lib/userResponse";

export const technologistAuthRouter = Router();

technologistAuthRouter.post(
  "/signup",
  (req, res, next) => {
    imageUpload.single("certificate")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          field: "certificate",
          message: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    const { email, password, name, credentials } = req.body ?? {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "email" });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", field: "password" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", field: "certificate" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let certificateUrl = "";
    if (isCloudinaryConfigured()) {
      try {
        certificateUrl = await uploadFileBuffer(
          req.file.buffer,
          req.file.mimetype,
          "eatwell/certificates",
        );
      } catch {
        return res.status(500).json({ error: "UPLOAD_FAILED" });
      }
    } else {
      return res.status(503).json({ error: "CLOUDINARY_NOT_CONFIGURED" });
    }

    try {
      const user = await UserModel.create({
        email: normalizedEmail,
        passwordHash,
        name: typeof name === "string" ? name : "",
        role: "technologist",
        isActive: true,
      });

      await TechnologistProfileModel.create({
        userId: user._id,
        displayName: user.name,
        credentials: typeof credentials === "string" ? credentials : "",
        certificateUrl,
        approvalStatus: "pending",
      });

      return res.status(201).json({
        message: "APPLICATION_SUBMITTED",
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          approvalStatus: "pending",
        },
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("duplicate key")) {
        return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
      }
      throw e;
    }
  },
);

technologistAuthRouter.post("/login", async (req, res) => {
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
  if (!user || user.role !== "technologist") {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }
  if (!user.isActive) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const profile = await TechnologistProfileModel.findOne({ userId: user._id });
  if (!profile || profile.approvalStatus === "pending") {
    return res.status(403).json({ error: "APPROVAL_PENDING" });
  }
  if (profile.approvalStatus === "rejected") {
    return res.status(403).json({
      error: "APPROVAL_REJECTED",
      rejectionReason: profile.rejectionReason || "",
    });
  }

  const token = signAccessToken({ sub: String(user._id), role: user.role });
  return res.json({
    token,
    user: {
      ...toPublicUser(user),
      approvalStatus: profile.approvalStatus,
    },
  });
});
