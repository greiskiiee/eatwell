"use client";
import { Search, Bell, Plus } from "lucide-react";
import Link from "next/link";
import { IngredientFilter } from "@/components/IngredientFilter";
import { TagFilter } from "@/components/TagFilter";
import { SearchTimeFilter } from "@/components/SearchTimeFilter";
import { useIngredientLabels } from "@/hooks/useIngredientLabels";

interface Props {
  searchQ: string;
  onSearch: (v: string) => void;
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  maxMinutes: number | null;
  onMaxMinutesChange: (minutes: number | null) => void;
  isTechnologist: boolean;
  userName?: string;
}

export function HomeHeader({
  searchQ,
  onSearch,
  selectedIngredients,
  onIngredientsChange,
  selectedTag,
  onTagChange,
  maxMinutes,
  onMaxMinutesChange,
  isTechnologist,
  userName,
}: Props) {
  const { labelFor } = useIngredientLabels(selectedIngredients);

  return (
    <header
      className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                 border-b border-[#D6C9B4]/70 py-2.5 px-3 sm:px-4 md:px-8
                 pl-14 sm:pl-4 md:pl-8 space-y-2"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878] pointer-events-none"
          />
          <input
            value={searchQ}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Жор хайх..."
            className="w-full min-w-0 pl-8 pr-3 py-2 h-9 sm:h-auto sm:py-2 sm:pl-9 bg-white rounded-xl text-[13px] text-[#221C16]
                       border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
                       transition-colors placeholder-[#9C8878] shadow-sm"
          />
        </div>

        <TagFilter selected={selectedTag} onChange={onTagChange} />

        <IngredientFilter
          selected={selectedIngredients}
          onChange={onIngredientsChange}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {userName && (
            <span className="hidden lg:block text-[13px] font-semibold text-[#5C4A3A] max-w-[180px] truncate mr-1">
              Сайн байна уу, {userName} 👋
            </span>
          )}
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-white border border-[#D6C9B4] flex items-center
                       justify-center text-[#9C8878] hover:text-[#5C4A3A] transition-colors shadow-sm shrink-0"
            aria-label="Мэдэгдэл"
          >
            <Bell size={16} />
          </button>
          {isTechnologist && (
            <Link
              href="/new-recipe"
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-2 sm:px-3 sm:py-2 rounded-xl bg-[#B84230] text-white
                         text-[13px] font-semibold hover:bg-[#9C3426] transition-colors shadow-sm shrink-0"
              aria-label="Жор нэмэх"
            >
              <Plus size={16} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline">Жор нэмэх</span>
            </Link>
          )}
        </div>
      </div>

      <SearchTimeFilter maxMinutes={maxMinutes} onChange={onMaxMinutesChange} />

      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {selectedIngredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full
                         bg-[#B84230]/12 text-[#B84230] font-medium max-w-full"
            >
              <span className="truncate">{labelFor(ing)}</span>
              <button
                type="button"
                onClick={() =>
                  onIngredientsChange(
                    selectedIngredients.filter((s) => s !== ing),
                  )
                }
                className="hover:text-[#9C3426] shrink-0"
                aria-label={`${labelFor(ing)} хасах`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
