import "dotenv/config";
import { connectToDatabase } from "./lib/db";
import { createApp } from "./app";

const app = createApp();

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

async function main() {
  console.log(`[boot] NODE_ENV=${process.env.NODE_ENV ?? "development"}`);
  await connectToDatabase();
  console.log("[boot] MongoDB connected");
  app.listen(PORT, HOST, () => {
    console.log(`[boot] Server listening on ${HOST}:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
