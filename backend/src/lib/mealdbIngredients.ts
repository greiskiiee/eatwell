import { fetchJson } from "./http";
import { INGREDIENT_MN_SEED } from "../data/ingredientMnSeed";
import { categorizeIngredient } from "./ingredientGroup";
import {
  IngredientCatalogModel,
  normalizeMealDbKey,
} from "../models/IngredientCatalog";

const MEALDB_LIST = "https://www.themealdb.com/api/json/v1/1/list.php?i=list";

type MealDbListRow = {
  strIngredient: string;
  idIngredient?: string;
  strThumb?: string | null;
};

type MealDbListResponse = { meals: MealDbListRow[] | null };

export async function syncMealDbIngredients(): Promise<{
  created: number;
  updated: number;
  total: number;
}> {
  const data = await fetchJson<MealDbListResponse>(MEALDB_LIST);
  const meals = data.meals ?? [];

  let created = 0;
  let updated = 0;

  for (const row of meals) {
    const mealDbName = row.strIngredient?.trim();
    if (!mealDbName) continue;

    const mealDbKey = normalizeMealDbKey(mealDbName);
    const thumb = row.strThumb?.trim() ?? "";
    const group = categorizeIngredient(mealDbName);
    const seedMn = INGREDIENT_MN_SEED[mealDbKey];

    const existing = await IngredientCatalogModel.findOne({ mealDbKey }).lean();

    if (!existing) {
      await IngredientCatalogModel.create({
        mealDbKey,
        mealDbName,
        nameMn: seedMn ?? mealDbName,
        group,
        thumb,
      });
      created += 1;
    } else {
      const patch: Record<string, string> = {};
      if (!existing.thumb && thumb) patch.thumb = thumb;
      if (existing.group === "other" && group !== "other") patch.group = group;
      if (Object.keys(patch).length > 0) {
        await IngredientCatalogModel.updateOne({ mealDbKey }, { $set: patch });
        updated += 1;
      }
    }
  }

  return { created, updated, total: meals.length };
}
