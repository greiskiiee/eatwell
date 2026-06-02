"use client";

import { useAuth, useUser } from "@/context/UserContext";
import { NAV_ITEMS } from "@/lib/constants";
import {
  BookOpen,
  Menu,
  Settings,
  X,
  UserPen,
  LogOut,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const Sidebar = () => {
  const user = useUser();
  const displayAllergens = user?.allergens ?? [];
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const settingsRef = useRef<HTMLDivElement>(null);
  const isTechnologist = user?.role === "technologist";
  const myRecipesActive =
    pathname === "/my-recipes" || pathname.startsWith("/edit-recipe");
  const analyticsActive = pathname === "/technologist/analytics";

  useEffect(() => {
    if (!settingsOpen) return;

    function onDocClick(e: MouseEvent) {
      if (!settingsRef.current?.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    const id = window.setTimeout(() => {
      document.addEventListener("click", onDocClick);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", onDocClick);
    };
  }, [settingsOpen]);

  function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSettingsOpen(false);
    logout();
    router.replace("/login");
  }

  const content = (
    <aside className="w-55 shrink-0 bg-white border-r border-[#D6C9B4] flex flex-col h-full overflow-visible relative z-20">
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push("/")}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push("/");
        }}
        className="px-6 pt-6 pb-5 flex items-center justify-between cursor-pointer"
      >
        <span className="font-display text-[28px] font-semibold leading-none">
          <span className="text-[#B84230]">Eatwell</span>
          <span className="text-[#221C16]">+</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          className="md:hidden text-[#9C8878] hover:text-[#5C4A3A] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active =
            href === "/home"
              ? pathname === "/home" || pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
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
          );
        })}

        {isTechnologist && (
          <>
            <Link
              href="/my-recipes"
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-3 w-full px-3 py-2.25 rounded-xl text-[13.5px] font-medium transition-colors",
                myRecipesActive
                  ? "bg-[#F5E6E2] text-[#B84230]"
                  : "text-[#5C4A3A] hover:bg-[#EFE8DA]",
              ].join(" ")}
            >
              <BookOpen
                size={18}
                className={
                  myRecipesActive ? "text-[#B84230]" : "text-[#9C8878]"
                }
              />
              Миний жорууд
            </Link>
            <Link
              href="/technologist/analytics"
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-3 w-full px-3 py-2.25 rounded-xl text-[13.5px] font-medium transition-colors",
                analyticsActive
                  ? "bg-[#F5E6E2] text-[#B84230]"
                  : "text-[#5C4A3A] hover:bg-[#EFE8DA]",
              ].join(" ")}
            >
              <BarChart3
                size={18}
                className={
                  analyticsActive ? "text-[#B84230]" : "text-[#9C8878]"
                }
              />
              Аналитик
            </Link>
          </>
        )}

        {user?.role === "admin" && (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 w-full px-3 py-2.25 rounded-xl text-[13.5px] font-medium text-[#B84230] hover:bg-[#F5E6E2] transition-colors mt-1"
          >
            Админ самбар
          </Link>
        )}

        <div className="mt-4 px-3 py-3.5 bg-[#EFE8DA] rounded-xl border border-[#D6C9B4]">
          <p className="text-[9.5px] font-bold text-[#9C8878] uppercase tracking-[0.65px] mb-2.5">
            Миний харшил
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {displayAllergens.length > 0 ? (
              displayAllergens.map((a) => (
                <span
                  key={a}
                  className="text-[11px] px-2.5 py-0.75 rounded-full bg-[#FBF0E6] text-[#B85E1A] font-medium"
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-[11px] px-2.5 py-0.75 rounded-full bg-[#FBF0E6] text-[#B85E1A] font-medium">
                Харшилгүй
              </span>
            )}
          </div>
          {user && (
            <Link
              href="/profile/edit"
              onClick={() => setOpen(false)}
              className="text-[11.5px] text-[#B84230] font-medium hover:underline"
            >
              Засах
            </Link>
          )}
        </div>
      </nav>

      <div className="relative flex items-center gap-2.5 px-4 py-3.5 border-t border-[#D6C9B4] overflow-visible">
        <div
          className="relative w-8 h-8 rounded-full bg-[#C58772] text-[#FFF8EC] flex items-center justify-center
                        font-semibold text-[13px] shrink-0 overflow-hidden"
        >
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            (user?.name?.[0]?.toUpperCase() ?? "Б")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#221C16] leading-none mb-0.5 truncate">
            {user?.name || "Зочин"}
          </p>
          <p className="text-[11px] text-[#9C8878]">
            {user?.role === "technologist"
              ? "Хүнсний технологич"
              : user?.role === "admin"
                ? "Админ"
                : user
                  ? "Үншигч"
                  : "Зочин"}
          </p>
        </div>
        <div ref={settingsRef} className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                router.push("/login");
                return;
              }
              setSettingsOpen((v) => !v);
            }}
            className="text-[#9C8878] hover:text-[#5C4A3A] transition-colors p-1"
            aria-label="Тохиргоо"
            aria-expanded={settingsOpen}
          >
            <Settings size={16} />
          </button>

          {settingsOpen && user && (
            <div
              className="absolute left-0 bottom-full mb-2 w-48 py-1.5 bg-white rounded-xl
                            border border-[#D6C9B4] shadow-xl z-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="/profile/edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsOpen(false);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px]
                           text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
              >
                <UserPen size={15} className="text-[#9C8878] shrink-0" />
                Профайл засах
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px]
                           text-[#B84230] hover:bg-[#F5E6E2] transition-colors cursor-pointer"
              >
                <LogOut size={15} className="shrink-0 pointer-events-none" />
                Гарах
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex h-screen sticky top-0 overflow-visible shrink-0">
        {content}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-4 z-40 w-9 h-9 rounded-xl bg-white border
                   border-[#D6C9B4] flex items-center justify-center text-[#5C4A3A]
                   shadow-sm hover:bg-[#EFE8DA] transition-colors"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={[
          "md:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none",
        ].join(" ")}
      >
        {content}
      </div>
    </>
  );
};
