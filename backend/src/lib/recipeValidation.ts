export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export type RecipeCreateInput = {
  title?: unknown;
  isDraft?: unknown;
  ingredients?: unknown;
  steps?: unknown;
  isPremium?: unknown;
  price?: unknown;
};

export type RecipeValidationFailure = {
  ok: false;
  field: "title" | "ingredients" | "steps" | "price";
};

export type RecipeValidationSuccess = {
  ok: true;
  title: string;
  isDraft: boolean;
  ingredients: string[];
  steps: string[];
  isPremium: boolean;
  price: number;
};

function resolvePremiumPrice(price: unknown): number {
  if (typeof price === "number" && Number.isFinite(price)) return price;
  if (typeof price === "string" && price.trim() !== "") {
    const n = Number(price);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function validateRecipeCreate(
  body: RecipeCreateInput,
): RecipeValidationSuccess | RecipeValidationFailure {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return { ok: false, field: "title" };
  }

  const isDraft = body.isDraft !== false;
  const ingredients = normalizeStringList(body.ingredients);
  const steps = normalizeStringList(body.steps);

  if (!isDraft) {
    if (ingredients.length === 0) {
      return { ok: false, field: "ingredients" };
    }
    if (steps.length === 0) {
      return { ok: false, field: "steps" };
    }
  }

  const isPremium = Boolean(body.isPremium);
  const price = isPremium ? resolvePremiumPrice(body.price) : 0;
  if (isPremium && price <= 0) {
    return { ok: false, field: "price" };
  }

  return {
    ok: true,
    title,
    isDraft,
    ingredients,
    steps,
    isPremium,
    price,
  };
}
