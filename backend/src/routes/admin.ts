import { Router } from "express";
import { UserModel } from "../models/User";
import {
  TechnologistProfileModel,
  type ApprovalStatus,
} from "../models/TechnologistProfile";
import { TechnologistRecipeModel } from "../models/TechnologistRecipe";
import { CommentModel } from "../models/Comment";
import { SavedRecipeModel } from "../models/SavedRecipe";
import { IngredientCatalogModel } from "../models/IngredientCatalog";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";
import { sendTechnologistApprovalEmail } from "../lib/email";

export const adminRouter = Router();

adminRouter.get("/stats", requireAuth, requireRole(["admin"]), async (_req, res) => {
  const [
    totalUsers,
    userCount,
    technologistCount,
    adminCount,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    totalRecipes,
    draftRecipes,
    totalComments,
    totalSaved,
    ingredientTotal,
    untranslatedIngredients,
    recentUsers,
    recentApplications,
  ] = await Promise.all([
    UserModel.countDocuments({ isActive: true }),
    UserModel.countDocuments({ isActive: true, role: "user" }),
    UserModel.countDocuments({ isActive: true, role: "technologist" }),
    UserModel.countDocuments({ isActive: true, role: "admin" }),
    TechnologistProfileModel.countDocuments({ approvalStatus: "pending" }),
    TechnologistProfileModel.countDocuments({ approvalStatus: "approved" }),
    TechnologistProfileModel.countDocuments({ approvalStatus: "rejected" }),
    TechnologistRecipeModel.countDocuments(),
    TechnologistRecipeModel.countDocuments({ isDraft: true }),
    CommentModel.countDocuments(),
    SavedRecipeModel.countDocuments(),
    IngredientCatalogModel.estimatedDocumentCount(),
    IngredientCatalogModel.countDocuments({
      $expr: {
        $eq: [{ $toLower: "$nameMn" }, { $toLower: "$mealDbName" }],
      },
    }),
    UserModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt")
      .lean(),
    TechnologistProfileModel.find({ approvalStatus: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const pendingUserIds = recentApplications.map((p) => p.userId);
  const pendingUsers = await UserModel.find({ _id: { $in: pendingUserIds } })
    .select("email name")
    .lean();
  const pendingUserMap = new Map(
    pendingUsers.map((u) => [String(u._id), u]),
  );

  return res.json({
    users: {
      total: totalUsers,
      regular: userCount,
      technologists: technologistCount,
      admins: adminCount,
    },
    applications: {
      pending: pendingApplications,
      approved: approvedApplications,
      rejected: rejectedApplications,
    },
    recipes: {
      total: totalRecipes,
      published: totalRecipes - draftRecipes,
      drafts: draftRecipes,
    },
    engagement: {
      comments: totalComments,
      savedRecipes: totalSaved,
    },
    ingredients: {
      total: ingredientTotal,
      untranslated: untranslatedIngredients,
    },
    recentUsers: recentUsers.map((u) => ({
      id: String(u._id),
      name: u.name ?? "",
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
    recentApplications: recentApplications.map((p) => {
      const user = pendingUserMap.get(String(p.userId));
      return {
        userId: String(p.userId),
        email: user?.email ?? "",
        name: user?.name ?? p.displayName,
        credentials: p.credentials ?? "",
        createdAt: p.createdAt,
      };
    }),
  });
});

adminRouter.get("/users", requireAuth, requireRole(["admin"]), async (req, res) => {
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "50"), 10) || 50, 1),
    200,
  );
  const role =
    typeof req.query.role === "string" && req.query.role !== "all"
      ? req.query.role
      : undefined;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const filter: Record<string, unknown> = { isActive: true };
  if (role) filter.role = role;
  if (q) {
    filter.$or = [
      { email: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
    ];
  }

  const users = await UserModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("name email role createdAt avatarUrl")
    .lean();

  const total = await UserModel.countDocuments(filter);

  return res.json({
    users: users.map((u) => ({
      id: String(u._id),
      name: u.name ?? "",
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl ?? "",
      createdAt: u.createdAt,
    })),
    total,
  });
});

adminRouter.get(
  "/technologist-applications",
  requireAuth,
  requireRole(["admin"]),
  async (req, res) => {
    const status =
      typeof req.query.status === "string"
        ? (req.query.status as ApprovalStatus)
        : "pending";

    const profiles = await TechnologistProfileModel.find({
      approvalStatus: status,
    }).sort({ createdAt: -1 });

    const userIds = profiles.map((p) => p.userId);
    const users = await UserModel.find({ _id: { $in: userIds } }).select(
      "email name role createdAt",
    );
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const applications = profiles.map((p) => {
      const user = userMap.get(String(p.userId));
      return {
        userId: String(p.userId),
        email: user?.email ?? "",
        name: user?.name ?? p.displayName,
        credentials: p.credentials,
        certificateUrl: p.certificateUrl,
        approvalStatus: p.approvalStatus,
        rejectionReason: p.rejectionReason,
        createdAt: p.createdAt,
      };
    });

    return res.json(applications);
  },
);

adminRouter.patch(
  "/technologist-applications/:userId",
  requireAuth,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    const { userId } = req.params;
    const { action, rejectionReason } = req.body ?? {};

    if (action !== "approve" && action !== "reject") {
      return res.status(400).json({ error: "VALIDATION_ERROR", field: "action" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "technologist") {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    const profile = await TechnologistProfileModel.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ error: "NOT_FOUND" });

    const approved = action === "approve";
    profile.approvalStatus = approved ? "approved" : "rejected";
    profile.rejectionReason =
      approved || typeof rejectionReason !== "string"
        ? ""
        : rejectionReason.trim();
    await profile.save();

    try {
      await sendTechnologistApprovalEmail({
        to: user.email,
        name: user.name || user.email,
        approved,
        rejectionReason: profile.rejectionReason || undefined,
      });
    } catch (err) {
      console.error("[email] Failed to send approval notification:", err);
    }

    return res.json({
      userId: String(user._id),
      approvalStatus: profile.approvalStatus,
      rejectionReason: profile.rejectionReason,
    });
  },
);
