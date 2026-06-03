/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { systemGroupsForSelected } from "@/lib/ingredientAny";
import { recipeApi, type TechnologistRecipe } from "@/lib/recipes";

export function useFilteredSystemRecipes({
  searchQ,
  selectedIngredients,
  selectedTag,
  maxMinutes,
  debounceMs = 0,
}: {
  searchQ: string;
  selectedIngredients: string[];
  selectedTag: string | null;
  maxMinutes: number | null;
  debounceMs?: number;
}) {
  const hasActiveFilters = useMemo(
    () =>
      Boolean(searchQ.trim()) ||
      selectedIngredients.length > 0 ||
      selectedTag != null ||
      (maxMinutes != null && maxMinutes > 0),
    [searchQ, selectedIngredients, selectedTag, maxMinutes],
  );

  const [recipes, setRecipes] = useState<TechnologistRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasActiveFilters) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const t = window.setTimeout(() => {
      setLoading(true);
      setRecipes([]);

      recipeApi
        .list({
          limit: 50,
          q: searchQ.trim() || undefined,
          ingredientGroups:
            selectedIngredients.length > 0
              ? systemGroupsForSelected(selectedIngredients)
              : undefined,
          tags: selectedTag ? [selectedTag] : undefined,
          maxMinutes,
        })
        .then((list) => {
          if (!cancelled) setRecipes(list);
        })
        .catch(() => {
          if (!cancelled) setRecipes([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [
    hasActiveFilters,
    searchQ,
    selectedIngredients,
    selectedTag,
    maxMinutes,
    debounceMs,
  ]);

  return { recipes, loading, hasActiveFilters };
}
