import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { connectToDatabase } from "./lib/db";
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

const app = express();

const allowedOrigins = ["http://localhost:3000", process.env.CORS_ORIGIN];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function main() {
  await connectToDatabase();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
