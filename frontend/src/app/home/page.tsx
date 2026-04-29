"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Bookmark,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  Bell,
  ChevronRight,
  Clock,
  Users,
  Star,
  Lock,
  Plus,
  Filter,
  TrendingUp,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { CATEGORIES, MOCK_RECIPES } from "@/lib/constants";
import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/lib/types";
import { getStoredUser } from "@/lib/auth";

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

// ─── Featured hero card ───────────────────────────────────────────────────────

function FeaturedCard({
  recipe,
  saved,
  onToggleSave,
}: {
  recipe: Recipe;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <Link
      href={`/recipes/${recipe._id}`}
      className="relative overflow-hidden rounded-2xl flex flex-col justify-end h-[300px] block group"
    >
      <Stripes />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(20,14,8,0.82) 0%, rgba(20,14,8,0.28) 55%, transparent 100%)",
        }}
      />

      {/* Badges */}
      <span
        className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5
                       bg-[rgba(20,14,8,0.82)] text-[#FFF8EC] text-[10px] font-bold
                       px-3 py-1.5 rounded-full tracking-wider uppercase"
      >
        ★ Онцлох жор
      </span>

      {/* Save */}
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

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex gap-2 mb-2">
          {recipe.categories.map((c) => (
            <span
              key={c}
              className="text-[10px] font-bold text-white/65 uppercase tracking-widest"
            >
              {c}
            </span>
          ))}
        </div>
        <h2 className="font-display text-[1.55rem] font-semibold text-[#FFFDF8] leading-snug mb-2.5">
          {recipe.title}
        </h2>
        <p className="text-[#FFF8EC]/70 text-[13px] leading-relaxed mb-4 line-clamp-1">
          {recipe.description}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[#FFF8EC]/70 text-[12px]">
            <Clock size={13} />
            {recipe.cookTime + recipe.prepTime}м
          </span>
          <span className="flex items-center gap-1.5 text-[#FFF8EC]/70 text-[12px]">
            <Users size={13} />
            {recipe.servings}х
          </span>
          {recipe.rating && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#FFF8EC]/70">
              <Star size={12} className="fill-[#C8922A] text-[#C8922A]" />
              {recipe.rating.toFixed(1)}
              <span className="text-[#FFF8EC]/50">({recipe.reviewCount})</span>
            </span>
          )}
          <span className="ml-auto text-[12.5px] font-semibold text-[#FFFDF8] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Дэлгэрэнгүй <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function RightPanel({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="w-[252px] shrink-0 space-y-4">
      {/* Trending */}
      <div className="bg-white rounded-2xl border border-[#D6C9B4]/60 p-4 shadow-[0_2px_12px_rgba(34,28,22,0.06)]">
        <div className="flex items-center gap-2 mb-3.5">
          <TrendingUp size={14} className="text-[#B84230]" />
          <span className="text-[10.5px] font-bold text-[#9C8878] uppercase tracking-[0.7px]">
            Трэнд
          </span>
        </div>
        <div className="space-y-3.5">
          {recipes.slice(0, 4).map((r, i) => (
            <Link
              key={r._id}
              href={`/recipes/${r._id}`}
              className="flex items-start gap-3 group"
            >
              <span className="font-display text-[20px] font-semibold text-[#D6C9B4] leading-none w-5 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-semibold text-[#221C16] leading-snug line-clamp-2
                              group-hover:text-[#B84230] transition-colors"
                >
                  {r.title}
                </p>
                <p className="text-[10.5px] text-[#9C8878] mt-0.5">
                  {r.categories[0]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [category, setCategory] = useState("Бүгд");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchQ, setSearchQ] = useState("");
  const [isTechnologist] = useState(
    () => getStoredUser()?.role === "technologist",
  );

  const featured = MOCK_RECIPES.find((r) => r.isFeatured)!;
  const rest = MOCK_RECIPES.filter((r) => !r.isFeatured);
  const filtered =
    category === "Бүгд"
      ? rest
      : rest.filter((r) => r.categories.includes(category));

  const display = searchQ
    ? filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          r.categories.some((c) => c.includes(searchQ)),
      )
    : filtered;

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#EFE8DA]">
      <Sidebar />

      {/* Scrollable main */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {/* ── Header ── */}
        <header
          className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                           border-b border-[#D6C9B4]/70 px-8 py-3 flex items-center gap-4"
        >
          <div className="relative flex-1 max-w-[380px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8878]"
            />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Жор, орц хайх..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-[13px] text-[#221C16]
                         border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
                         transition-colors placeholder-[#9C8878] shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              className="w-9 h-9 rounded-full bg-white border border-[#D6C9B4] flex items-center
                               justify-center text-[#9C8878] hover:text-[#5C4A3A] transition-colors shadow-sm"
            >
              <Bell size={16} />
            </button>
            {isTechnologist && (
              <Link
                href="/add-recipe"
                className="flex items-center gap-2 px-4 py-[7px] rounded-xl bg-[#B84230] text-white
                         text-[13px] font-semibold hover:bg-[#9C3426] transition-colors shadow-sm"
              >
                <Plus size={14} />
                Жор нэмэх
              </Link>
            )}
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex gap-6 px-8 pt-6 pb-10 min-w-0">
          {/* Feed */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Featured */}
            <FeaturedCard
              recipe={featured}
              saved={savedIds.has(featured._id)}
              onToggleSave={() => toggleSave(featured._id)}
            />

            {/* Category + filter row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2 overflow-x-auto flex-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={[
                      "shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors",
                      category === c
                        ? "bg-[#B84230] text-white border-[#B84230]"
                        : "bg-white text-[#5C4A3A] border-[#D6C9B4] hover:border-[#9C8878]",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px]
                                 font-semibold border border-[#D6C9B4] bg-white text-[#5C4A3A]
                                 hover:border-[#9C8878] transition-colors shrink-0"
              >
                <Filter size={12} /> Шүүлт
              </button>
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold text-[#221C16]">
                {category === "Бүгд" ? "Шинэ жорууд" : category}
              </h2>
              <Link
                href="/search"
                className="text-[12px] font-semibold text-[#B84230] hover:underline flex items-center gap-0.5"
              >
                Бүгдийг харах <ChevronRight size={13} />
              </Link>
            </div>

            {/* Grid */}
            {display.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#9C8878] text-sm">Жор олдсонгүй</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {display.map((r) => (
                  <RecipeCard
                    key={r._id}
                    recipe={r}
                    saved={savedIds.has(r._id)}
                    onToggleSave={() => toggleSave(r._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right panel */}
          <RightPanel recipes={MOCK_RECIPES} />
        </div>
      </div>
    </div>
  );
}
