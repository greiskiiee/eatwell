import { Recipe } from "@/lib/types";
import { Bookmark, ChevronRight, Clock, Star, Users } from "lucide-react";
import Link from "next/link";

export function FeaturedCard({
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
      {/* <Stripes /> */}
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
