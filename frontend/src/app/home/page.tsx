/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { HomeHeader } from "@/components/HomeHeader";
import { CategoryBar } from "@/components/CategoryBar";
import { RightPanel } from "@/components/RightPanel";
import { AuthUser, getStoredUser } from "@/lib/auth";
import {
  MealDBRecipe,
  MealDBCategory,
  searchMeals,
  getMealsByCategory,
  getRandomMeals,
  getCategories,
} from "@/lib/mealdb";
import Image from "next/image";
import Link from "next/link";
import { Clock, Bookmark, ChevronRight, Flame } from "lucide-react";

// ── Recipe card using MealDB data ─────────────────────────────────────────
function MealCard({
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
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

// ── Featured hero using MealDB data ──────────────────────────────────────
function FeaturedMeal({
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
      className="relative overflow-hidden rounded-2xl flex flex-col justify-end h-[300px] group"
    >
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(20,14,8,0.85) 0%, rgba(20,14,8,0.3) 55%, transparent 100%)",
        }}
      />
      <span
        className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5
                       bg-[rgba(20,14,8,0.75)] text-[#FFF8EC] text-[10px] font-bold
                       px-3 py-1.5 rounded-full tracking-wider uppercase"
      >
        ★ Онцлох жор
      </span>
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
      <div className="relative z-10 p-6">
        <div className="flex gap-2 mb-2">
          <span className="text-[10px] font-bold text-white/65 uppercase tracking-widest">
            {meal.strCategory}
          </span>
          <span className="text-[10px] font-bold text-white/65 uppercase tracking-widest">
            {meal.strArea}
          </span>
        </div>
        <h2 className="font-display text-[1.55rem] font-semibold text-[#FFFDF8] leading-snug mb-2.5">
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

// ── Skeleton loader ───────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchQ, setSearchQ] = useState("");
  const [meals, setMeals] = useState<MealDBRecipe[]>([]);
  const [featured, setFeatured] = useState<MealDBRecipe | null>(null);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  const [user] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser();
  });
  const isTechnologist = user?.role === "technologist";

  // Load categories once
  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(["All", ...cats.map((c) => c.strCategory)]);
    });
  }, []);

  // Load meals when category changes or on initial load
  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      let results: MealDBRecipe[];
      if (category === "All") {
        results = await getRandomMeals(12);
      } else {
        results = await getMealsByCategory(category);
      }
      setFeatured(results[0] ?? null);
      setMeals(results.slice(1));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (!searchQ) loadMeals();
  }, [category, searchQ, loadMeals]);

  // Search with debounce
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

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto min-w-0">
        <HomeHeader
          searchQ={searchQ}
          onSearch={setSearchQ}
          isTechnologist={isTechnologist}
          userName={user?.name}
        />

        <div className="flex gap-6 px-4 md:px-8 pt-6 pb-10 min-w-0">
          <div className="flex-1 min-w-0 space-y-5">
            {/* Featured */}
            {loading ? (
              <div className="h-[300px] rounded-2xl bg-[#D6C9B4]/40 animate-pulse" />
            ) : featured ? (
              <FeaturedMeal
                meal={featured}
                saved={savedIds.has(featured.idMeal)}
                onToggleSave={() => toggleSave(featured.idMeal)}
              />
            ) : null}

            {/* Category bar */}
            <CategoryBar
              categories={categories}
              active={category}
              onChange={setCategory}
            />

            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold text-[#221C16]">
                {searchQ
                  ? `"${searchQ}" хайлтын үр дүн`
                  : category === "All"
                    ? "Жорууд"
                    : category}
              </h2>
              {!loading && (
                <span className="text-[12px] text-[#9C8878]">
                  {meals.length} жор
                </span>
              )}
            </div>

            {/* Grid */}
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
                    saved={savedIds.has(meal.idMeal)}
                    onToggleSave={() => toggleSave(meal.idMeal)}
                  />
                ))}
              </div>
            )}
          </div>

          <RightPanel meals={meals.slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
