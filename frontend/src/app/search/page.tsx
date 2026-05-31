"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MealCard } from "@/components/MealCard";
import { SystemRecipeCard } from "@/components/SystemRecipeCard";
import { IngredientFilter } from "@/components/IngredientFilter";
import { TagFilter } from "@/components/TagFilter";
import { SearchTimeFilter } from "@/components/SearchTimeFilter";
import { useSavedRecipes } from "@/context/SavedRecipesContext";
import { useIngredientLabels } from "@/hooks/useIngredientLabels";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import {
  getMealsByCategory,
  getMealsByIngredients,
  searchMeals,
  type MealDBRecipe,
} from "@/lib/mealdb";
import { recipeApi, type TechnologistRecipe } from "@/lib/recipes";

function mealMatchesQuery(meal: MealDBRecipe, q: string) {
  if (!q) return true;
  return meal.strMeal.toLowerCase().includes(q.toLowerCase());
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
  const [systemRecipes, setSystemRecipes] = useState<TechnologistRecipe[]>([]);
  const [meals, setMeals] = useState<MealDBRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { isSaved, toggleSave } = useSavedRecipes();
  const { labelFor } = useIngredientLabels(selectedIngredients);
  const { findByLabel } = useTagCatalog();

  const hasFilters = useMemo(
    () =>
      Boolean(debouncedQ) ||
      selectedIngredients.length > 0 ||
      selectedTag != null ||
      maxMinutes != null,
    [debouncedQ, selectedIngredients, selectedTag, maxMinutes],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(query.trim()), 350);
    return () => window.clearTimeout(id);
  }, [query]);

  const runSearch = useCallback(async () => {
    if (!hasFilters) {
      setSystemRecipes([]);
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const systemPromise = recipeApi.list({
        limit: 50,
        q: debouncedQ || undefined,
        ingredients:
          selectedIngredients.length > 0 ? selectedIngredients : undefined,
        tags: selectedTag ? [selectedTag] : undefined,
        maxMinutes,
      });

      let mealPromise: Promise<MealDBRecipe[]> = Promise.resolve([]);
      if (maxMinutes == null) {
        if (selectedIngredients.length > 0) {
          mealPromise = getMealsByIngredients(selectedIngredients);
        } else if (debouncedQ) {
          mealPromise = searchMeals(debouncedQ);
        } else if (selectedTag) {
          const entry = findByLabel(selectedTag);
          if (entry?.sources.includes("mealdb")) {
            mealPromise = getMealsByCategory(entry.label);
          }
        }
      }

      const [system, mealResults] = await Promise.all([
        systemPromise,
        mealPromise,
      ]);

      const filteredMeals = mealResults.filter((m) =>
        mealMatchesQuery(m, debouncedQ),
      );

      setSystemRecipes(system);
      setMeals(maxMinutes != null ? [] : filteredMeals);
    } catch {
      setSystemRecipes([]);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [
    hasFilters,
    debouncedQ,
    selectedIngredients,
    selectedTag,
    maxMinutes,
    findByLabel,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSearch();
  }, [runSearch]);

  const total = systemRecipes.length + meals.length;

  function clearAllFilters() {
    setQuery("");
    setSelectedIngredients([]);
    setSelectedTag(null);
    setMaxMinutes(null);
  }

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <header
          className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                     border-b border-[#D6C9B4]/70 py-3 px-3 sm:px-4 md:px-8
                     pl-14 sm:pl-4 md:pl-8 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display text-[17px] sm:text-[19px] font-semibold text-[#221C16]">
              Жор хайх
            </h1>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[12px] font-semibold text-[#B84230] hover:underline shrink-0"
              >
                Цэвэрлэх
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xl">
              <SearchIcon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8878]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Жорын нэр, тайлбар..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D6C9B4]
                           text-[13.5px] text-[#221C16] placeholder-[#9C8878] outline-none
                           focus:border-[#B84230]/50 focus:ring-2 focus:ring-[#B84230]/10"
              />
            </div>
            <TagFilter selected={selectedTag} onChange={setSelectedTag} />
            <IngredientFilter
              selected={selectedIngredients}
              onChange={setSelectedIngredients}
            />
          </div>

          <SearchTimeFilter maxMinutes={maxMinutes} onChange={setMaxMinutes} />

          {(selectedIngredients.length > 0 || selectedTag) && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTag && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5E6E2] text-[#B84230] border border-[#E8C4A0]">
                  {selectedTag}
                  <button
                    type="button"
                    aria-label={`${selectedTag} хасах`}
                    onClick={() => setSelectedTag(null)}
                    className="hover:text-[#9C3426]"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedIngredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5
                             rounded-full bg-[#FBF0E6] text-[#B85E1A] border border-[#E8C4A0]"
                >
                  {labelFor(ing)}
                  <button
                    type="button"
                    aria-label={`${labelFor(ing)} хасах`}
                    onClick={() =>
                      setSelectedIngredients((prev) =>
                        prev.filter((s) => s !== ing),
                      )
                    }
                    className="hover:text-[#B84230]"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="px-3 sm:px-4 md:px-8 py-6">
          {!hasFilters ? (
            <p className="text-center text-[#9C8878] text-sm py-16">
              Нэр, шошго, орц эсвэл хугацаагаар хайна — Eatwell+ болон TheMealDB
            </p>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-[#D6C9B4]/40 animate-pulse"
                />
              ))}
            </div>
          ) : total === 0 ? (
            <p className="text-center text-[#9C8878] text-sm py-16">
              Хайлтаар жор олдсонгүй. Шүүлтүүрээ өөрчилж үзнэ үү.
            </p>
          ) : (
            <>
              <p className="text-[12px] text-[#9C8878] mb-4">
                {total} үр дүн
                {selectedIngredients.length > 0 && (
                  <span className="ml-1">
                    · орц: {selectedIngredients.map(labelFor).join(", ")}
                  </span>
                )}
                {maxMinutes != null && (
                  <span className="ml-1">· ≤ {maxMinutes} мин (Eatwell+)</span>
                )}
              </p>

              {systemRecipes.length > 0 && (
                <section className="mb-8">
                  <h2 className="font-display text-[15px] font-semibold text-[#221C16] mb-3">
                    Eatwell+ ({systemRecipes.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {systemRecipes.map((recipe) => (
                      <SystemRecipeCard
                        key={recipe._id}
                        recipe={recipe}
                        saved={isSaved(recipe._id)}
                        onToggleSave={() => toggleSave(recipe._id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {maxMinutes == null && (
                <section>
                  <h2 className="font-display text-[15px] font-semibold text-[#221C16] mb-3">
                    TheMealDB ({meals.length})
                  </h2>
                  {meals.length === 0 ? (
                    <p className="text-center text-[#9C8878] text-sm py-10 bg-white/60 rounded-2xl border border-[#D6C9B4]/60">
                      {selectedIngredients.length > 0
                        ? "Сонгосон орцоор TheMealDB-д жор олдсонгүй."
                        : "TheMealDB-д жор олдсонгүй."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {meals.map((meal) => (
                        <MealCard
                          key={meal.idMeal}
                          meal={meal}
                          saved={isSaved(meal.idMeal)}
                          onToggleSave={() => toggleSave(meal.idMeal)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
