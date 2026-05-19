import "dotenv/config";
import { connectToDatabase } from "../lib/db";
import { syncMealDbIngredients } from "../lib/mealdbIngredients";

async function main() {
  await connectToDatabase();
  const result = await syncMealDbIngredients();
  console.log("Ingredient catalog sync complete:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
