"use client";

import { useMemo } from "react";
import { MealDBRecipe, extractIngredients } from "@/lib/mealdb";
import { getMatchingAllergens } from "@/lib/allergens";
import { useAuth } from "@/context/UserContext";
import { AllergenWarningBadge } from "@/components/AllergenWarningBadge";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";

export function MealCard({
  meal,
  saved,
  onToggleSave,
}: {
  meal: MealDBRecipe;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const { user } = useAuth();
  const matchedAllergens = useMemo(() => {
    const lines = extractIngredients(meal);
    return getMatchingAllergens(lines, user?.allergens ?? []);
  }, [meal, user?.allergens]);

  const hasAllergen = matchedAllergens.length > 0;

  return (
    <Link
      href={`/recipes/${meal.idMeal}`}
      className={[
        "group rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(34,28,22,0.06)]",
        "hover:shadow-[0_4px_20px_rgba(34,28,22,0.12)] transition-shadow flex flex-col",
        hasAllergen
          ? "bg-[#FEF2F2] border-2 border-[#DC2626]/70 ring-2 ring-[#FECACA]/80"
          : "bg-white border border-[#D6C9B4]/60",
      ].join(" ")}
    >
      <div className="relative h-40 overflow-hidden bg-[#EFE8DA]">
        <Image
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            hasAllergen ? "opacity-90" : ""
          }`}
          width={300}
          height={160}
        />
        {hasAllergen && (
          <div className="absolute inset-0 bg-[#DC2626]/15 pointer-events-none" />
        )}
        {hasAllergen && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <AllergenWarningBadge matched={matchedAllergens} />
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSave();
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90
                     flex items-center justify-center shadow hover:bg-white transition-colors z-10"
        >
          <Bookmark
            size={14}
            className={
              saved ? "fill-[#B84230] text-[#B84230]" : "text-[#5C4A3A]"
            }
          />
        </button>
        <span
          className={`absolute bottom-2 left-2.5 text-[10px] font-bold px-2 py-0.5
                         rounded-full uppercase tracking-wide ${
                           hasAllergen
                             ? "bg-[#991B1B]/90 text-white"
                             : "bg-[rgba(20,14,8,0.75)] text-[#FFF8EC]"
                         }`}
        >
          {meal.strCategory}
        </span>
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        <p
          className={`text-[13.5px] font-semibold leading-snug line-clamp-2 flex-1 ${
            hasAllergen ? "text-[#991B1B]" : "text-[#221C16]"
          }`}
        >
          {meal.strMeal}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[11px] text-[#9C8878]">{meal.strArea}</span>
          {meal.strTags && (
            <span className="text-[11px] text-[#9C8878] line-clamp-1">
              #{meal.strTags.split(",")[0]}
            </span>
          )}
          <ChevronRight
            size={12}
            className={`ml-auto transition-colors ${
              hasAllergen
                ? "text-[#DC2626] group-hover:text-[#991B1B]"
                : "text-[#D6C9B4] group-hover:text-[#B84230]"
            }`}
          />
        </div>
      </div>
    </Link>
  );
}
