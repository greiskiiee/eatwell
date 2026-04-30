import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

dotenv.config();

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

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/technologist-recipes", technologistRecipesRouter);
app.use("/api/external-recipes", externalRecipesRouter);
app.use("/api/barcode", barcodeRouter);
app.use("/api/recipes", recipesRouter);

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
