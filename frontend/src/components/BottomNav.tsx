"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/",
    label: "Нүүр",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
        {active && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            d="M9 22V12h6v10"
          />
        )}
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Хайх",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8}
        stroke="currentColor"
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/saved",
    label: "Хадгалсан",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill={active ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        />
      </svg>
    ),
  },
  {
    href: "/my-recipes",
    label: "Миний",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.2 : 1.8}
        stroke="currentColor"
      >
        <circle cx="12" cy="8" r="4" fill={active ? "currentColor" : "none"} />
        <path strokeLinecap="round" d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-chimge-white/95 backdrop-blur-md shadow-bottom-nav
                 flex items-center justify-around h-[3.75rem] px-2"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV.map(({ href, label, icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 min-w-[3.5rem] py-1.5 rounded-xl transition-colors
              ${active ? "text-chimge-primary" : "text-chimge-ink-3"}`}
          >
            {icon(active)}
            <span
              className={`text-[10px] font-medium tracking-wide ${active ? "text-chimge-primary" : "text-chimge-ink-3"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
