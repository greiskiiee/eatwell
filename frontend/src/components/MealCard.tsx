"use client";

import { MealDBRecipe } from "@/lib/mealdb";
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
  return (
    <Link
      href={`/recipes/${meal.idMeal}`}
      className="group bg-white rounded-2xl border border-[#D6C9B4]/60 overflow-hidden
                 shadow-[0_2px_12px_rgba(34,28,22,0.06)] hover:shadow-[0_4px_20px_rgba(34,28,22,0.12)]
                 transition-shadow flex flex-col"
    >
      <div className="relative h-40 overflow-hidden bg-[#EFE8DA]">
        <Image
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          width={300}
          height={160}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSave();
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90
                     flex items-center justify-center shadow hover:bg-white transition-colors"
        >
          <Bookmark
            size={14}
            className={
              saved ? "fill-[#B84230] text-[#B84230]" : "text-[#5C4A3A]"
            }
          />
        </button>
        <span
          className="absolute bottom-2 left-2.5 text-[10px] font-bold px-2 py-0.5
                         rounded-full bg-[rgba(20,14,8,0.75)] text-[#FFF8EC] uppercase tracking-wide"
        >
          {meal.strCategory}
        </span>
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        <p className="text-[13.5px] font-semibold text-[#221C16] leading-snug line-clamp-2 flex-1">
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
            className="ml-auto text-[#D6C9B4] group-hover:text-[#B84230] transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}
