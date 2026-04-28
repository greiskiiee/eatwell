"use client";

const CATEGORIES = [
  "Бүгд",
  "Үндэсний хоол",
  "Шөл",
  "Талх, бялуу",
  "Цагаан хоол",
  "Амттан",
  "Уух зүйл",
];

interface CategoryTabsProps {
  active: string;
  onChange: (c: string) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex border-b border-chimge-line mb-6 -mx-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={[
            "px-4 py-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
            active === cat
              ? "border-chimge-primary text-chimge-primary"
              : "border-transparent text-chimge-ink-3 hover:text-chimge-ink-2",
          ].join(" ")}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
