"use client";

import {
  Home,
  Search,
  Bookmark,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
} from "lucide-react";

const NAV = [
  { icon: Home, label: "Нүүр", active: true },
  { icon: Search, label: "Хайх", active: false },
  { icon: Bookmark, label: "Хадгалсан", active: false },
  { icon: BookOpen, label: "Миний хоолны дэвтэр", active: false },
  { icon: Calendar, label: "Долоо хоногийн төлөвлөгөө", active: false },
  { icon: ShoppingCart, label: "Дэлгүүрийн жагсаалт", active: false },
];

const ALLERGENS = ["Самар", "Далайн хоол", "Шарваага"];

export function Sidebar() {
  return (
    <aside className="w-55 shrink-0 bg-white border-r border-chimge-line flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <span className="font-serif-display text-[28px] font-semibold leading-none">
          <span className="text-chimge-primary">Chimge</span>
          <span className="text-chimge-ink">.</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={[
                "flex items-center gap-3 w-full px-3 py-2.25 rounded-xl text-[13.5px] font-medium text-left transition-colors",
                item.active
                  ? "bg-chimge-primary-soft text-chimge-primary"
                  : "text-chimge-ink-2 hover:bg-chimge-bg",
              ].join(" ")}
            >
              <Icon
                size={18}
                className={
                  item.active ? "text-chimge-primary" : "text-chimge-ink-3"
                }
              />
              {item.label}
            </button>
          );
        })}

        {/* Allergen box */}
        <div className="mt-4 px-3 py-3.5 bg-chimge-bg rounded-xl border border-chimge-line">
          <div className="text-[9.5px] font-bold text-chimge-ink-3 uppercase tracking-[0.65px] mb-2.5">
            Миний харшил
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {ALLERGENS.map((a) => (
              <span
                key={a}
                className="text-[11px] px-2.5 py-0.75 rounded-full bg-chimge-warn-soft text-chimge-warn font-medium"
              >
                {a}
              </span>
            ))}
          </div>
          <button className="text-[11.5px] text-chimge-primary font-medium hover:underline">
            Засах
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-chimge-line">
        <div className="w-8 h-8 rounded-full bg-[#C58772] text-[#FFF8EC] flex items-center justify-center font-semibold text-[13px] shrink-0">
          А
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-chimge-ink leading-none mb-0.5">
            А. Алтаа
          </div>
          <div className="text-[11px] text-chimge-ink-3">Үншигч</div>
        </div>
        <button className="text-chimge-ink-3 hover:text-chimge-ink-2 transition-colors p-1">
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
}
