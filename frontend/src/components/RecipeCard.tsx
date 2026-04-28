"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { Bookmark, Clock, Lock, Star, Users } from "lucide-react";

interface Props {
  recipe: Recipe;
  onToggleSave?: (id: string, saved: boolean) => void;
  isSaved?: boolean;
  showAllergenWarn?: boolean;
  userAllergens?: string[];
  variant?: "card" | "compact";
}

function Stripes() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "repeating-linear-gradient(-45deg,#9c3824 0,#9c3824 18px,#b84230 18px,#b84230 36px)",
      }}
    />
  );
}

export default function RecipeCard({
  recipe,
  saved,
  onToggleSave,
}: {
  recipe: Recipe;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const total = recipe.cookTime + recipe.prepTime;

  return (
    <Link
      href={`/recipes/${recipe._id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-[#D6C9B4]/60
                 shadow-[0_2px_12px_rgba(34,28,22,0.07)] hover:shadow-[0_6px_28px_rgba(34,28,22,0.13)]
                 transition-all hover:-translate-y-0.5 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative h-[148px] shrink-0">
        <Stripes />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,14,8,0.48) 0%, transparent 50%)",
          }}
        />

        {recipe.isPremium && (
          <span
            className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 text-[9px] font-bold
                           bg-[#C8922A] text-white px-2 py-[3px] rounded-full uppercase tracking-wider"
          >
            <Lock size={8} /> Төлбөртэй
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSave();
          }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90
                     flex items-center justify-center shadow hover:bg-white transition-colors"
        >
          <Bookmark
            size={13}
            className={
              saved ? "fill-[#B84230] text-[#B84230]" : "text-[#5C4A3A]"
            }
          />
        </button>

        <div className="absolute bottom-0 inset-x-0 px-3 py-2 z-10">
          <span className="text-[8.5px] font-bold text-white/75 uppercase tracking-[0.8px]">
            {recipe.categories[0]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-[10px] px-2 py-[2px] rounded-full bg-[#F5E6E2] text-[#B84230] font-medium">
            {recipe.categories[0]}
          </span>
          {recipe.tags[0] && (
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-[#EFE8DA] text-[#5C4A3A] font-medium border border-[#D6C9B4]">
              {recipe.tags[0]}
            </span>
          )}
        </div>

        <h3 className="font-display text-[14.5px] font-semibold text-[#221C16] leading-snug line-clamp-2 flex-1 mb-1.5">
          {recipe.title}
        </h3>
        <p className="text-[11px] text-[#9C8878] mb-3">{recipe.author.name}</p>

        <div className="flex items-center justify-between pt-3 border-t border-[#EFE8DA]">
          <div className="flex items-center gap-2.5 text-[11px] text-[#9C8878]">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {total}м
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {recipe.servings}х
            </span>
          </div>
          {recipe.rating && (
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-[#C8922A] text-[#C8922A]" />
              <span className="text-[11.5px] font-semibold text-[#C8922A]">
                {recipe.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
