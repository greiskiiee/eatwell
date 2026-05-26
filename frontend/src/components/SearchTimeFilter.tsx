"use client";

import { Clock } from "lucide-react";

export const SEARCH_TIME_OPTIONS = [
  { label: "15 мин", value: 15 },
  { label: "30 мин", value: 30 },
  { label: "45 мин", value: 45 },
  { label: "60 мин", value: 60 },
  { label: "90 мин", value: 90 },
] as const;

interface Props {
  maxMinutes: number | null;
  onChange: (minutes: number | null) => void;
}

export function SearchTimeFilter({ maxMinutes, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-[11px] font-bold text-[#9C8878] uppercase tracking-wide shrink-0">
        <Clock size={12} />
        Хугацаа
      </span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={[
          "px-2.5 py-1 rounded-full text-[12px] font-semibold border transition-colors",
          maxMinutes === null
            ? "bg-[#B84230] text-white border-[#B84230]"
            : "bg-white text-[#5C4A3A] border-[#D6C9B4] hover:border-[#B84230]",
        ].join(" ")}
      >
        Бүгд
      </button>
      {SEARCH_TIME_OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(maxMinutes === value ? null : value)}
          className={[
            "px-2.5 py-1 rounded-full text-[12px] font-semibold border transition-colors",
            maxMinutes === value
              ? "bg-[#2D5A4A] text-white border-[#2D5A4A]"
              : "bg-white text-[#5C4A3A] border-[#D6C9B4] hover:border-[#2D5A4A]",
          ].join(" ")}
        >
          ≤ {label}
        </button>
      ))}
    </div>
  );
}
