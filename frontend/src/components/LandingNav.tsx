"use client";

import { useState } from "react";
import { ScanLine, Menu, X } from "lucide-react";
import { ScannerModal } from "./ScannerModal";

export function LandingNav() {
  const [scanOpen, setScanOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-chimge-line">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-15">
          <div className="flex items-center gap-3">
            <span className="font-serif-display text-[24px] font-semibold leading-none">
              <span className="text-chimge-primary">EatWell</span>
              <span className="text-chimge-ink">+</span>
            </span>
            <span className="text-[10px] font-bold text-chimge-ink-3 border border-chimge-line px-2 py-0.5 rounded-full hidden sm:inline">
              ДИПЛОМЫН АЖИЛ
            </span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-chimge-ink-2">
            <a
              href="#features"
              className="hover:text-chimge-primary transition-colors"
            >
              Онцлог
            </a>
            <a
              href="#recipes"
              className="hover:text-chimge-primary transition-colors"
            >
              Жорууд
            </a>
            <a
              href="#roles"
              className="hover:text-chimge-primary transition-colors"
            >
              Хэрэглэгчид
            </a>
            <a
              href="#scan"
              className="hover:text-chimge-primary transition-colors"
            >
              Скан
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setScanOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-chimge-line text-[13px] font-medium text-chimge-ink-2 hover:bg-chimge-bg transition-colors"
            >
              <ScanLine size={15} className="text-chimge-primary" />
              Баркод скан
            </button>
            <button className="px-4 py-2 rounded-xl text-[13px] font-medium text-chimge-ink-2 hover:bg-chimge-bg transition-colors">
              Нэвтрэх
            </button>
            <button className="px-4 py-2 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[13px] font-semibold hover:bg-chimge-primary-dk transition-colors">
              Бүртгүүлэх
            </button>
          </div>

          <button
            className="md:hidden p-2 text-chimge-ink-2"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-chimge-line px-6 py-4 flex flex-col gap-3">
            <a
              href="#features"
              className="text-[14px] font-medium text-chimge-ink-2 py-1"
            >
              Онцлог
            </a>
            <a
              href="#recipes"
              className="text-[14px] font-medium text-chimge-ink-2 py-1"
            >
              Жорууд
            </a>
            <a
              href="#roles"
              className="text-[14px] font-medium text-chimge-ink-2 py-1"
            >
              Хэрэглэгчид
            </a>
            <a
              href="#scan"
              className="text-[14px] font-medium text-chimge-ink-2 py-1"
            >
              Скан
            </a>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setScanOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-chimge-line text-[13px] font-medium text-chimge-ink-2"
              >
                <ScanLine size={15} className="text-chimge-primary" /> Баркод
                скан
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[13px] font-semibold">
                Бүртгүүлэх
              </button>
            </div>
          </div>
        )}
      </nav>
      {scanOpen && <ScannerModal onClose={() => setScanOpen(false)} />}
    </>
  );
}
