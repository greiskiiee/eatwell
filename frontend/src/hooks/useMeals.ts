import { useState, useEffect, useCallback } from "react";
import {
  MealDBRecipe,
  searchMeals,
  getMealsByCategory,
  getRandomMeals,
  dedupeMealsById,
  getCategoryList,
  getMealsByIngredientGroups,
} from "@/lib/mealdb";
import { selectedToIngredientGroups } from "@/lib/ingredientAny";

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
    getCategoryList()
      .then((cats) => setMealDbCategories(cats.map((c) => c.toLowerCase())))
      .catch(() => setMealDbCategories([]));
  }, []);

  const setResults = useCallback((results: MealDBRecipe[]) => {
    const unique = dedupeMealsById(results);
    setFeatured(unique[0] ?? null);
    setMeals(unique.slice(1));
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
          const groups = selectedToIngredientGroups(selectedIngredients);
          const results = await getMealsByIngredientGroups(groups);
          if (!signal.cancelled) {
            setFeatured(null);
            setMeals(dedupeMealsById(results));
          }
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

        const results = await getRandomMeals(24);
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
  }, [fetchMeals]);

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
