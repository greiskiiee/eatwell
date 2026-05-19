"use client";

import { useCallback, useEffect, useState } from "react";
import { recipeApi, type TechnologistRecipe } from "@/lib/recipes";

export function useMyRecipes() {
  const [recipes, setRecipes] = useState<TechnologistRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await recipeApi.mine();
      setRecipes(data);
    } catch {
      setError("Жоруудыг ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { recipes, loading, error, refresh };
}
