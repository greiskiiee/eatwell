"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Home,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/UserContext";

const NAV = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Хүсэлтүүд", icon: ClipboardList },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
  { href: "/admin/ingredients", label: "Орц орчуулга", icon: Languages },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout: authLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "technologist") {
      router.replace("/home");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/home");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#EFE8DA] flex items-center justify-center">
        <p className="text-[#9C8878] text-sm">Ачаалж байна...</p>
      </div>
    );
  }

  function logout() {
    authLogout();
    router.replace("/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-[#D6C9B4]/50">
        <p className="text-[10px] font-bold text-[#9C8878] uppercase tracking-wider">
          Eatwell+
        </p>
        <h1 className="font-display text-lg font-semibold text-[#221C16] mt-0.5">
          Админ самбар
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, ...rest }) => {
          const active = isActive(href, "exact" in rest && rest.exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors",
                active
                  ? "bg-[#B84230] text-white shadow-sm"
                  : "text-[#5C4A3A] hover:bg-[#EFE8DA]",
              ].join(" ")}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#D6C9B4]/50 space-y-1">
        <Link
          href="/home"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold
                     text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
        >
          <Home size={17} />
          Апп руу буцах
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold
                     text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
        >
          <LogOut size={17} />
          Гарах
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EFE8DA] flex">
      <aside className="hidden lg:flex w-60 xl:w-64 shrink-0 bg-white border-r border-[#D6C9B4]/70 flex-col fixed inset-y-0 left-0 z-40">
        {sidebar}
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Хаах"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#D6C9B4]/70 flex flex-col lg:hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 p-1.5 rounded-lg text-[#9C8878] hover:bg-[#EFE8DA]"
          aria-label="Цэс хаах"
        >
          <X size={18} />
        </button>
        {sidebar}
      </aside>

      <div className="flex-1 lg:pl-60 xl:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#D6C9B4]/70 px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#D6C9B4] text-[#5C4A3A]"
                aria-label="Цэс нээх"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#9C8878] uppercase tracking-wider">
                  Админ
                </p>
                <p className="text-sm font-semibold text-[#221C16] truncate">
                  {user.name || user.email}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B84230]/10 text-[#B84230] text-[11px] font-bold uppercase">
              <BookOpen size={12} />
              Администратор
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
