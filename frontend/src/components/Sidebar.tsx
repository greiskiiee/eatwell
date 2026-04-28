"use client";

import { ALLERGENS, NAV_ITEMS } from "@/lib/constants";
import {
  Home,
  Search,
  Bookmark,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
} from "lucide-react";
import Link from "next/link";

export const Sidebar = () => {
  return (
    <aside className="w-55 shrink-0 bg-white border-r border-[#D6C9B4] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <span className="font-display text-[28px] font-semibold leading-none">
          <span className="text-[#B84230]">Chimge</span>
          <span className="text-[#221C16]">.</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={[
              "flex items-center gap-3 w-full px-3 py-[9px] rounded-xl text-[13.5px] font-medium transition-colors",
              active
                ? "bg-[#F5E6E2] text-[#B84230]"
                : "text-[#5C4A3A] hover:bg-[#EFE8DA]",
            ].join(" ")}
          >
            <Icon
              size={18}
              className={active ? "text-[#B84230]" : "text-[#9C8878]"}
            />
            {label}
          </Link>
        ))}

        {/* Allergen box */}
        <div className="mt-4 px-3 py-3.5 bg-[#EFE8DA] rounded-xl border border-[#D6C9B4]">
          <p className="text-[9.5px] font-bold text-[#9C8878] uppercase tracking-[0.65px] mb-2.5">
            Миний харшил
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {ALLERGENS.map((a) => (
              <span
                key={a.id}
                className="text-[11px] px-2.5 py-[3px] rounded-full bg-[#FBF0E6] text-[#B85E1A] font-medium"
              >
                {a.label}
              </span>
            ))}
          </div>
          <button className="text-[11.5px] text-[#B84230] font-medium hover:underline">
            Засах
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-[#D6C9B4]">
        <div
          className="w-8 h-8 rounded-full bg-[#C58772] text-[#FFF8EC] flex items-center justify-center
                        font-semibold text-[13px] shrink-0"
        >
          Б
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#221C16] leading-none mb-0.5 truncate">
            Б. Чимэгэрдэнэ
          </p>
          <p className="text-[11px] text-[#9C8878]">Үншигч</p>
        </div>
        <button className="text-[#9C8878] hover:text-[#5C4A3A] transition-colors p-1 shrink-0">
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
};
