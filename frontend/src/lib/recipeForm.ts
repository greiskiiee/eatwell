import type { IngredientEntry } from "./ingredients";

export type RecipeFormInput = {
  title: string;
  ingredients: readonly unknown[];
  steps: string[];
};

export type RecipeTextFormInput = {
  title: string;
  ingredientsText: string;
  stepsText: string;
};

export function parseMultilineField(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateRecipeForDraft({ title }: Pick<RecipeFormInput, "title">) {
  if (!title.trim()) {
    return "Гарчиг оруулна уу";
  }
  return null;
}

export function validateRecipeForPublish({
  title,
  ingredients,
  steps,
}: RecipeFormInput) {
  const titleError = validateRecipeForDraft({ title });
  if (titleError) return titleError;

  if (ingredients.length === 0) {
    return "Хамгийн багадаа нэг орц нэмнэ үү";
  }

  if (!steps.some((step) => step.trim())) {
    return "Хамгийн багадаа нэг алхам бичнэ үү";
  }

  return null;
}

/** For edit-recipe page (newline-separated textareas). */
export function validateRecipeTextForm(
  { title, ingredientsText, stepsText }: RecipeTextFormInput,
  isDraft: boolean,
) {
  if (isDraft) {
    return validateRecipeForDraft({ title });
  }

  return validateRecipeForPublish({
    title,
    ingredients: parseMultilineField(ingredientsText),
    steps: stepsText.split("\n"),
  });
}

/** Typed helper for new-recipe (IngredientEntry[]). */
export function validateNewRecipeForm(
  input: {
    title: string;
    ingredients: IngredientEntry[];
    steps: string[];
  },
  isDraft: boolean,
) {
  if (isDraft) {
    return validateRecipeForDraft({ title: input.title });
  }
  return validateRecipeForPublish(input);
}
