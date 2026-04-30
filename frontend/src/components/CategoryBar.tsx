"use client";
import { Filter } from "lucide-react";

interface Props {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}

export function CategoryBar({ categories, active, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-2 overflow-x-auto flex-1 scrollbar-none pb-0.5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={[
              "shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors",
              active === c
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
  );
}
