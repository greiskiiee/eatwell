"use client";
import { Search, Bell, Plus } from "lucide-react";
import Link from "next/link";

interface Props {
  searchQ: string;
  onSearch: (v: string) => void;
  isTechnologist: boolean;
  userName?: string;
}

export function HomeHeader({
  searchQ,
  onSearch,
  isTechnologist,
  userName,
}: Props) {
  return (
    <header
      className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                       border-b border-[#D6C9B4]/70 py-3 px-4 md:px-8 pl-14 md:pl-8 flex items-center gap-3"
    >
      <div className="relative flex-1 max-w-95">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8878]"
        />
        <input
          value={searchQ}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Жор, орц хайх..."
          className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-[13px] text-[#221C16]
                     border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
                     transition-colors placeholder-[#9C8878] shadow-sm"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {userName && (
          <span className="hidden sm:block text-[13px] font-semibold text-[#5C4A3A]">
            Сайн байна уу, {userName} 👋
          </span>
        )}
        <button
          className="w-9 h-9 rounded-full bg-white border border-[#D6C9B4] flex items-center
                           justify-center text-[#9C8878] hover:text-[#5C4A3A] transition-colors shadow-sm"
        >
          <Bell size={16} />
        </button>
        {isTechnologist && (
          <Link
            href="/add-recipe"
            className="flex items-center gap-2 px-3 md:px-4 py-1.75 rounded-xl bg-[#B84230] text-white
                       text-[13px] font-semibold hover:bg-[#9C3426] transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Жор нэмэх</span>
          </Link>
        )}
      </div>
    </header>
  );
}
