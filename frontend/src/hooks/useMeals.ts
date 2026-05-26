import { useState, useEffect, useCallback } from "react";
import {
  MealDBRecipe,
  searchMeals,
  getMealsByCategory,
  getRandomMeals,
  getCategories,
  getMealsByIngredients,
} from "@/lib/mealdb";

export function useMeals() {
  const [searchQ, setSearchQ] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);

  const [meals, setMeals] = useState<MealDBRecipe[]>([]);
  const [featured, setFeatured] = useState<MealDBRecipe | null>(null);
  const [mealDbCategories, setMealDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((cats) =>
        setMealDbCategories(cats.map((c) => c.strCategory.toLowerCase())),
      )
      .catch(() => setMealDbCategories([]));
  }, []);

  const setResults = useCallback((results: MealDBRecipe[]) => {
    setFeatured(results[0] ?? null);
    setMeals(results.slice(1));
  }, []);

  const fetchMeals = useCallback(
    async (signal: { cancelled: boolean }) => {
      setLoading(true);
      try {
        if (maxMinutes != null) {
          if (!signal.cancelled) setResults([]);
          return;
        }

        if (searchQ) {
          const results = await searchMeals(searchQ);
          if (!signal.cancelled) setResults(results);
          return;
        }

        if (selectedIngredients.length > 0) {
          const results = await getMealsByIngredients(selectedIngredients, 12);
          if (!signal.cancelled) setResults(results);
          return;
        }

        if (selectedTag) {
          const isMealDb = mealDbCategories.includes(selectedTag.toLowerCase());
          if (isMealDb) {
            const results = await getMealsByCategory(selectedTag);
            if (!signal.cancelled) setResults(results);
            return;
          }
          if (!signal.cancelled) setResults([]);
          return;
        }

        const results = await getRandomMeals(12);
        if (!signal.cancelled) setResults(results);
      } finally {
        if (!signal.cancelled) setLoading(false);
      }
    },
    [
      searchQ,
      selectedIngredients,
      selectedTag,
      maxMinutes,
      mealDbCategories,
      setResults,
    ],
  );

  useEffect(() => {
    const signal = { cancelled: false };
    const delay =
      searchQ || selectedIngredients.length > 0 ? 350 : 0;
    const t = setTimeout(() => {
      fetchMeals(signal);
    }, delay);
    return () => {
      signal.cancelled = true;
      clearTimeout(t);
    };
  }, [fetchMeals, searchQ, selectedIngredients]);

  return {
    searchQ,
    setSearchQ,
    selectedIngredients,
    setSelectedIngredients,
    selectedTag,
    setSelectedTag,
    maxMinutes,
    setMaxMinutes,
    meals,
    featured,
    loading,
  };
}
