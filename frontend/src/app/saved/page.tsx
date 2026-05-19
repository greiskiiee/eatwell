/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MealCard } from "@/components/MealCard";
import { SystemRecipeCard } from "@/components/SystemRecipeCard";
import { useUser } from "@/context/UserContext";
import { useSavedRecipes } from "@/context/SavedRecipesContext";
import { getMealById, type MealDBRecipe } from "@/lib/mealdb";
import { isMongoObjectId } from "@/lib/recipeId";
import { recipeApi, type TechnologistRecipe } from "@/lib/recipes";

type SavedEntry =
  | { kind: "meal"; meal: MealDBRecipe }
  | { kind: "system"; recipe: TechnologistRecipe };

export default function SavedRecipesPage() {
  const router = useRouter();
  const user = useUser();
  const {
    savedIds,
    isSaved,
    toggleSave,
    loading: savedLoading,
  } = useSavedRecipes();
  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || savedLoading) return;

    const ids = Array.from(savedIds);
    if (ids.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      ids.map(async (recipeId): Promise<SavedEntry | null> => {
        try {
          if (isMongoObjectId(recipeId)) {
            const recipe = await recipeApi.get(recipeId);
            return { kind: "system", recipe };
          }
          const meal = await getMealById(recipeId);
          if (!meal) return null;
          return { kind: "meal", meal };
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (!cancelled) {
          setEntries(results.filter((e): e is SavedEntry => e !== null));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, savedIds, savedLoading]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <header
          className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                     border-b border-[#D6C9B4]/70 py-3 px-3 sm:px-4 md:px-8
                     pl-14 sm:pl-4 md:pl-8"
        >
          <h1 className="font-display text-[17px] sm:text-[19px] font-semibold text-[#221C16]">
            Хадгалсан жорууд
          </h1>
        </header>

        <div className="px-3 sm:px-4 md:px-8 py-6">
          {loading || savedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-[#D6C9B4]/40 animate-pulse"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-[#9C8878] text-sm">
                Хадгалсан жор байхгүй байна.
              </p>
              <Link
                href="/home"
                className="inline-block text-[13px] font-semibold text-[#B84230] hover:underline"
              >
                Жор хайх
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-[#9C8878] mb-4">
                {entries.length} жор
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {entries.map((entry) =>
                  entry.kind === "system" ? (
                    <SystemRecipeCard
                      key={entry.recipe._id}
                      recipe={entry.recipe}
                      saved={isSaved(entry.recipe._id)}
                      onToggleSave={() => toggleSave(entry.recipe._id)}
                    />
                  ) : (
                    <MealCard
                      key={entry.meal.idMeal}
                      meal={entry.meal}
                      saved={isSaved(entry.meal.idMeal)}
                      onToggleSave={() => toggleSave(entry.meal.idMeal)}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
