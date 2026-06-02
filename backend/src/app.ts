import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { technologistRecipesRouter } from "./routes/technologistRecipes";
import { externalRecipesRouter } from "./routes/externalRecipes";
import { barcodeRouter } from "./routes/barcode";
import { recipesRouter } from "./routes/recipes";
import { technologistAuthRouter } from "./routes/technologistAuth";
import { adminRouter } from "./routes/admin";
import { technologistRouter } from "./routes/technologist";
import { uploadRouter } from "./routes/upload";
import { savedRecipesRouter } from "./routes/savedRecipes";
import { ingredientsRouter } from "./routes/ingredients";
import { purchasesRouter } from "./routes/purchases";
import { productsRouter } from "./routes/products";

export function createApp() {
  const app = express();

  function parseOriginList(value?: string) {
    if (!value) return [];
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const allowedOrigins = new Set(
    [
      "http://localhost:3000",
      "https://eatwell-liart.vercel.app",
      ...parseOriginList(process.env.CORS_ORIGIN),
      ...parseOriginList(process.env.FRONTEND_URL),
    ].filter(Boolean),
  );

  function isAllowedOrigin(origin?: string) {
    if (!origin) return true; // server-to-server / curl / same-origin
    if (allowedOrigins.has(origin)) return true;

    // Optional: allow Vercel preview deployments if enabled
    if (
      process.env.ALLOW_VERCEL_PREVIEWS === "true" &&
      /^https:\/\/eatwell-.*\.vercel\.app$/i.test(origin)
    ) {
      return true;
    }
    return false;
  }

  app.use(
    cors({
      origin(origin, callback) {
        // IMPORTANT: don't throw on disallowed origins; that would skip CORS headers
        // and surface as a confusing browser CORS + 5xx combo.
        callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
      optionsSuccessStatus: 204,
    }),
  );
  app.use(express.json());
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/technologist-auth", technologistAuthRouter);
  app.use("/api/technologist", technologistRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/technologist-recipes", technologistRecipesRouter);
  app.use("/api/external-recipes", externalRecipesRouter);
  app.use("/api/barcode", barcodeRouter);
  app.use("/api/recipes", recipesRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/saved-recipes", savedRecipesRouter);
  app.use("/api/ingredients", ingredientsRouter);
  app.use("/api/purchases", purchasesRouter);
  app.use("/api/products", productsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
