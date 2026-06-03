"use client";

import { useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { HomeHeader } from "@/components/HomeHeader";
import { RightPanel } from "@/components/RightPanel";
import { useMeals } from "@/hooks/useMeals";
import { extractIngredients, type MealDBRecipe } from "@/lib/mealdb";
import { getMatchingAllergens } from "@/lib/allergens";
import { AllergenWarningBadge } from "@/components/AllergenWarningBadge";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/UserContext";
import { useSavedRecipes } from "@/context/SavedRecipesContext";
import { getStoredToken } from "@/lib/auth";
import { usersApi } from "@/lib/users";
import { MealCard } from "@/components/MealCard";
import { SystemRecipeCard } from "@/components/SystemRecipeCard";
import { useIngredientLabels } from "@/hooks/useIngredientLabels";
import { useFilteredSystemRecipes } from "@/hooks/useFilteredSystemRecipes";

function FeaturedMeal({
  meal,
  saved,
  onToggleSave,
  userAllergens,
}: {
  meal: MealDBRecipe;
  saved: boolean;
  onToggleSave: () => void;
  userAllergens: string[];
}) {
  const matchedAllergens = useMemo(
    () => getMatchingAllergens(extractIngredients(meal), userAllergens),
    [meal, userAllergens],
  );
  const hasAllergen = matchedAllergens.length > 0;

  return (
    <Link
      href={`/recipes/${meal.idMeal}`}
      className={[
        "relative overflow-hidden rounded-2xl flex flex-col justify-end h-52 sm:h-64 md:h-75 group",
        hasAllergen ? "ring-2 ring-[#DC2626] ring-offset-2 ring-offset-[#EFE8DA]" : "",
      ].join(" ")}
    >
      <Image
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        width={300}
        height={300}
      />
      <div
        className="absolute inset-0"
        style={{
          background: hasAllergen
            ? "linear-gradient(to top, rgba(127,29,29,0.88) 0%, rgba(127,29,29,0.35) 55%, transparent 100%)"
            : "linear-gradient(to top, rgba(20,14,8,0.85) 0%, rgba(20,14,8,0.3) 55%, transparent 100%)",
        }}
      />
      <span
        className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5
                       bg-[rgba(20,14,8,0.75)] text-[#FFF8EC] text-[10px] font-bold
                       px-3 py-1.5 rounded-full tracking-wider uppercase"
      >
        ★ Онцлох жор
      </span>
      {hasAllergen && (
        <div className="absolute top-4 left-36 sm:left-40 z-10">
          <AllergenWarningBadge matched={matchedAllergens} />
        </div>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleSave();
        }}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90
                   flex items-center justify-center shadow hover:bg-white transition-colors"
      >
        <Bookmark
          size={16}
          className={saved ? "fill-[#B84230] text-[#B84230]" : "text-[#5C4A3A]"}
        />
      </button>
      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-[10px] font-bold text-white/65 uppercase tracking-widest">
            {meal.strCategory}
          </span>
          <span className="text-[10px] font-bold text-white/65 uppercase tracking-widest">
            {meal.strArea}
          </span>
        </div>
        <h2 className="font-display text-xl sm:text-[1.55rem] font-semibold text-[#FFFDF8] leading-snug mb-2.5">
          {meal.strMeal}
        </h2>
        <p className="text-[#FFF8EC]/70 text-[13px] leading-relaxed mb-4 line-clamp-1">
          {meal.strInstructions}
        </p>
        <span
          className="ml-auto text-[12.5px] font-semibold text-[#FFFDF8] flex items-center gap-1
                         opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Дэлгэрэнгүй <ChevronRight size={13} />
        </span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#D6C9B4]/60 overflow-hidden animate-pulse">
      <div className="h-40 bg-[#EFE8DA]" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-[#EFE8DA] rounded-full w-3/4" />
        <div className="h-3 bg-[#EFE8DA] rounded-full w-1/2" />
      </div>
    </div>
  );
}

export function HomeFeed() {
  const { user, setAuth } = useAuth();

  useEffect(() => {
    if (!user) return;
    const token = getStoredToken();
    if (!token) return;
    let cancelled = false;
    usersApi
      .me()
      .then((fresh) => {
        if (!cancelled) setAuth(token, fresh);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, setAuth]);
  const {
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
  } = useMeals();
  const { labelFor } = useIngredientLabels(selectedIngredients);
  const { isSaved, toggleSave } = useSavedRecipes();

  const isTechnologist = user?.role === "technologist";
  const {
    recipes: systemRecipes,
    loading: systemLoading,
    hasActiveFilters,
  } = useFilteredSystemRecipes({
    searchQ,
    selectedIngredients,
    selectedTag,
    maxMinutes,
    debounceMs: searchQ.trim() ? 400 : 0,
  });

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <HomeHeader
          searchQ={searchQ}
          onSearch={(q) => {
            setSearchQ(q);
            if (q.trim()) setSelectedIngredients([]);
          }}
          selectedIngredients={selectedIngredients}
          onIngredientsChange={(ings) => {
            setSelectedIngredients(ings);
            if (ings.length > 0) setSearchQ("");
          }}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          maxMinutes={maxMinutes}
          onMaxMinutesChange={setMaxMinutes}
          isTechnologist={isTechnologist}
          userName={user?.name}
        />

        <div className="flex gap-6 px-3 sm:px-4 md:px-8 pt-4 sm:pt-6 pb-10 min-w-0">
          <div className="flex-1 min-w-0 space-y-5">
            {(systemLoading || systemRecipes.length > 0 || hasActiveFilters) && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[17px] font-semibold text-[#221C16]">
                    Eatwell+ жор
                  </h2>
                  {!systemLoading && (
                    <span className="text-[12px] text-[#9C8878]">
                      {systemRecipes.length} жор
                    </span>
                  )}
                </div>
                {systemLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonCard key={`sys-${i}`} />
                    ))}
                  </div>
                ) : systemRecipes.length === 0 ? (
                  <p className="text-center text-[#9C8878] text-sm py-10 bg-white/60 rounded-2xl border border-[#D6C9B4]/60">
                    Eatwell+ дээр тохирох жор олдсонгүй
                  </p>
                ) : (
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
                )}
              </section>
            )}

            {maxMinutes == null && (
              <>
                {loading ? (
                  <div className="h-75 rounded-2xl bg-[#D6C9B4]/40 animate-pulse" />
                ) : featured ? (
                  <FeaturedMeal
                    meal={featured}
                    saved={isSaved(featured.idMeal)}
                    onToggleSave={() => toggleSave(featured.idMeal)}
                    userAllergens={user?.allergens ?? []}
                  />
                ) : null}

                <div className="flex items-center justify-between gap-3 min-w-0">
                  <h2 className="font-display text-[15px] sm:text-[17px] font-semibold text-[#221C16] truncate min-w-0">
                    {searchQ
                      ? `"${searchQ}" — TheMealDB`
                      : selectedIngredients.length > 0
                        ? `${selectedIngredients.map(labelFor).join(", ")} — TheMealDB`
                        : selectedTag
                          ? `${selectedTag} — TheMealDB`
                          : "TheMealDB жорууд"}
                  </h2>
                  {!loading && (
                    <span className="text-[12px] text-[#9C8878] shrink-0">
                      {meals.length + (featured ? 1 : 0)} жор
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : meals.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-[#9C8878] text-sm">Жор олдсонгүй</p>
                  </div>
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
              </>
            )}
          </div>

          <RightPanel meals={meals.slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
