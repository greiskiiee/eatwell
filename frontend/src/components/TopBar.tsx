"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export function TopBar() {
  return (
    <header className="shrink-0 flex items-center gap-3 px-6 py-2.75 bg-white border-b border-chimge-line">
      <label className="flex items-center gap-2.5 flex-1 max-w-105 px-3.5 py-2.5 rounded-xl border border-chimge-line bg-chimge-bg cursor-text">
        <Search size={16} className="text-chimge-ink-3 shrink-0" />
        <span className="flex-1 text-[13.5px] text-chimge-ink-3 select-none">
          Жор, орц, технологичоор хайх...
        </span>
        <kbd className="text-[10.5px] font-medium bg-white border border-chimge-line text-chimge-ink-3 px-1.5 py-0.5 rounded-md leading-none">
          ⌘K
        </kbd>
      </label>

      <div className="flex-1" />

      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-chimge-line bg-white text-[13px] font-medium text-chimge-ink-2 hover:bg-chimge-bg transition-colors">
        <SlidersHorizontal size={15} /> Шүүх
      </button>
    </header>
  );
}
