"use client";

const FILTERS = ["Танд тохирох", "Хурдан хоол", "Шинэ", "Танд аюулгүй"];

interface QuickFiltersProps {
  active: string;
  onChange: (f: string) => void;
}

export function QuickFilters({ active, onChange }: QuickFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={[
            "text-[13px] px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors",
            active === f
              ? "bg-chimge-primary text-[#FFF8EC]"
              : "bg-white border border-chimge-line text-chimge-ink-2 hover:bg-chimge-bg",
          ].join(" ")}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
