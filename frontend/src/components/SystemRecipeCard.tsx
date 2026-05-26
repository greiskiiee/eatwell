"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import {
  type TechnologistRecipe,
  recipeCoverImage,
} from "@/lib/recipes";
import { getMatchingAllergens } from "@/lib/allergens";
import { useAuth } from "@/context/UserContext";
import { AllergenWarningBadge } from "@/components/AllergenWarningBadge";

export function SystemRecipeCard({
  recipe,
  saved,
  onToggleSave,
}: {
  recipe: TechnologistRecipe;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const { user } = useAuth();
  const cover = recipeCoverImage(recipe);
  const tag = recipe.tags?.[0];

  const matchedAllergens = useMemo(
    () => getMatchingAllergens(recipe.ingredients ?? [], user?.allergens ?? []),
    [recipe.ingredients, user?.allergens],
  );
  const hasAllergen = matchedAllergens.length > 0;

  return (
    <Link
      href={`/recipes/${recipe._id}`}
      className={[
        "group rounded-2xl overflow-hidden transition-shadow flex flex-col",
        hasAllergen
          ? "bg-[#FEF2F2] border-2 border-[#DC2626]/70 ring-2 ring-[#FECACA]/80 shadow-[0_2px_12px_rgba(220,38,38,0.12)]"
          : "bg-white border-2 border-[#B84230]/25 shadow-[0_2px_12px_rgba(184,66,48,0.08)] hover:shadow-[0_4px_20px_rgba(184,66,48,0.15)]",
      ].join(" ")}
    >
      <div className="relative h-40 overflow-hidden bg-[#EFE8DA]">
        {cover ? (
          <Image
            src={cover}
            alt={recipe.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              hasAllergen ? "opacity-90" : ""
            }`}
            width={300}
            height={160}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9C8878] text-sm">
            Зураггүй
          </div>
        )}
        {hasAllergen && (
          <div className="absolute inset-0 bg-[#DC2626]/15 pointer-events-none" />
        )}
        <span
          className={`absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide z-10 ${
            hasAllergen ? "bg-[#DC2626] text-white" : "bg-[#B84230] text-white"
          }`}
        >
          {hasAllergen ? "Харшил" : "Eatwell+"}
        </span>
        {recipe.isPremium && (recipe.price ?? 0) > 0 && (
          <span
            className="absolute top-2.5 right-12 text-[9px] font-bold px-2 py-0.5 rounded-full
                       bg-[#2D5A4A] text-white z-10"
          >
            Premium {(recipe.price ?? 0).toLocaleString()}₮
          </span>
        )}
        {hasAllergen && (
          <div className="absolute top-2.5 right-12 z-10">
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
        {tag && !hasAllergen && (
          <span
            className="absolute bottom-2 left-2.5 text-[10px] font-bold px-2 py-0.5
                           rounded-full bg-[rgba(20,14,8,0.75)] text-[#FFF8EC] uppercase tracking-wide"
          >
            {tag}
          </span>
        )}
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        <p
          className={`text-[13.5px] font-semibold leading-snug line-clamp-2 flex-1 ${
            hasAllergen ? "text-[#991B1B]" : "text-[#221C16]"
          }`}
        >
          {recipe.title}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          {recipe.prepTimeMinutes != null && (
            <span className="text-[11px] text-[#9C8878]">
              {recipe.prepTimeMinutes} мин
            </span>
          )}
          {recipe.nutrition?.calories != null && (
            <span className="text-[11px] text-[#9C8878]">
              {Math.round(recipe.nutrition.calories)} ккал
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
