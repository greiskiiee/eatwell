/* eslint-disable react-hooks/set-state-in-effect */
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
  const [category, setCategory] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [meals, setMeals] = useState<MealDBRecipe[]>([]);
  const [featured, setFeatured] = useState<MealDBRecipe | null>(null);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((cats) =>
      setCategories(["All", ...cats.map((c) => c.strCategory)]),
    );
  }, []);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      const results =
        category === "All"
          ? await getRandomMeals(12)
          : await getMealsByCategory(category);
      setFeatured(results[0] ?? null);
      setMeals(results.slice(1));
    } finally {
      setLoading(false);
    }
  }, [category]);

  const loadByIngredients = useCallback(async (ingredients: string[]) => {
    setLoading(true);
    try {
      const results = await getMealsByIngredients(ingredients, 12);
      setFeatured(results[0] ?? null);
      setMeals(results.slice(1));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQ || selectedIngredients.length > 0) return;
    loadMeals();
  }, [category, searchQ, selectedIngredients, loadMeals]);

  useEffect(() => {
    if (searchQ) return;
    if (selectedIngredients.length === 0) return;

    setLoading(true);
    const t = setTimeout(() => {
      loadByIngredients(selectedIngredients);
    }, 300);
    return () => clearTimeout(t);
  }, [selectedIngredients, searchQ, loadByIngredients]);

  useEffect(() => {
    if (!searchQ) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchMeals(searchQ);
        setFeatured(results[0] ?? null);
        setMeals(results.slice(1));
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQ]);

  return {
    category,
    setCategory,
    searchQ,
    setSearchQ,
    selectedIngredients,
    setSelectedIngredients,
    meals,
    featured,
    categories,
    loading,
  };
}
