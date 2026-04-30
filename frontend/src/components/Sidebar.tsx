"use client";

import { AuthUser, getStoredUser } from "@/lib/auth";
import { ALLERGENS, NAV_ITEMS } from "@/lib/constants";
import { Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const Sidebar = () => {
  const [user] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser();
  });
  const [open, setOpen] = useState(false);

  const content = (
    <aside className="w-55 shrink-0 bg-white border-r border-[#D6C9B4] flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5 flex items-center justify-between">
        <span className="font-display text-[28px] font-semibold leading-none">
          <span className="text-[#B84230]">Eatwell</span>
          <span className="text-[#221C16]">+</span>
        </span>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-[#9C8878] hover:text-[#5C4A3A] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            onClick={() => setOpen(false)}
            className={[
              "flex items-center gap-3 w-full px-3 py-2.25 rounded-xl text-[13.5px] font-medium transition-colors",
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
                className="text-[11px] px-2.5 py-0.75 rounded-full bg-[#FBF0E6] text-[#B85E1A] font-medium"
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
          {user?.name?.[0]?.toUpperCase() ?? "Б"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#221C16] leading-none mb-0.5 truncate">
            {user?.name || "Зочин"}
          </p>
          <p className="text-[11px] text-[#9C8878]">Үншигч</p>
        </div>
        <button className="text-[#9C8878] hover:text-[#5C4A3A] transition-colors p-1 shrink-0">
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden md:flex h-screen sticky top-0">{content}</div>

      {/* Mobile — hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-4 z-40 w-9 h-9 rounded-xl bg-white border
                   border-[#D6C9B4] flex items-center justify-center text-[#5C4A3A]
                   shadow-sm hover:bg-[#EFE8DA] transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Mobile — backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile — drawer */}
      <div
        className={[
          "md:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {content}
      </div>
    </>
  );
};
