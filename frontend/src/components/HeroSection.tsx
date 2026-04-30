"use client";

import { useState } from "react";
import { ArrowRight, ScanLine, Star, Users, BookOpen } from "lucide-react";
// import { ScannerModal } from "./ScannerModal";

const STATS = [
  { icon: BookOpen, value: "500+", label: "Баталгаажсан жор" },
  // { icon: Users, value: "3 роль", label: "Хэрэглэгч, Технологич, Админ" },
  { icon: Star, value: "Premium", label: "Онцгой жорын систем" },
];

const FLOATING_RECIPES = [
  {
    emoji: "🥩",
    title: "Хорхог",
    time: "120 мин",
    rating: "4.9",
    tag: "Технологич ✓",
  },
  {
    emoji: "🍜",
    title: "Цуйван",
    time: "35 мин",
    rating: "4.8",
    tag: "Premium",
  },
  {
    emoji: "🥟",
    title: "Бууз",
    time: "90 мин",
    rating: "4.9",
    tag: "Үндэсний",
  },
  {
    emoji: "🍲",
    title: "Гурилтай шөл",
    time: "45 мин",
    rating: "4.7",
    tag: "Хурдан",
  },
];

export function HeroSection() {
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <>
      <section className="pt-25 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chimge-primary-soft text-chimge-primary text-[12px] font-semibold mb-6">
              Төгсөлтийн ажил
            </div>

            <h1 className="font-serif-display text-[52px] font-semibold text-chimge-ink leading-[1.1] mb-5">
              Монголын хоолны{" "}
              <span className="text-chimge-primary italic">жорын</span> {""}
              платформ
            </h1>

            <p className="text-[16px] text-chimge-ink-2 leading-relaxed mb-8 max-w-110">
              EatWell+ нь хэрэглэгч, хоолны технологич, администраторыг
              нэгтгэсэн хоолны жор хуваалцах веб платформ юм. Харшил шүүлт,
              калори тооцоо, баркод скан зэрэг онцлогтой.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[14px] font-semibold hover:bg-chimge-primary-dk transition-colors shadow-md shadow-chimge-primary/20">
                Бүртгүүлэх <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setScanOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-chimge-line bg-white text-[14px] font-semibold text-chimge-ink-2 hover:border-chimge-primary hover:text-chimge-primary transition-colors group"
              >
                <ScanLine size={16} className="text-chimge-primary" />
                Баркод скан хийх
              </button>
            </div>

            <div className="flex gap-8">
              {STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label}>
                    <div className="font-serif-display text-[20px] font-semibold text-chimge-ink">
                      {s.value}
                    </div>
                    <div className="text-[11px] text-chimge-ink-3 flex items-center gap-1 mt-0.5">
                      <Icon size={11} /> {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating cards */}
          <div className="relative h-110 hidden md:block">
            <div className="absolute inset-8 rounded-3xl bg-chimge-primary-soft opacity-40" />
            {FLOATING_RECIPES.map((r, i) => (
              <div
                key={r.title}
                className="absolute bg-white rounded-2xl border border-chimge-line shadow-lg px-4 py-3 flex items-center gap-3 w-52.5"
                style={{
                  top: ["12%", "32%", "54%", "74%"][i],
                  left: i % 2 === 0 ? "5%" : "42%",
                  transform: `rotate(${[-2, 1.5, -1, 2][i]}deg)`,
                  zIndex: i + 1,
                }}
              >
                <span className="text-2xl">{r.emoji}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-chimge-ink">
                    {r.title}
                  </div>
                  <div className="text-[10.5px] text-chimge-ink-3">
                    {r.time} · ⭐ {r.rating}
                  </div>
                  <span className="text-[9.5px] px-2 py-px rounded-full bg-chimge-sage-soft text-chimge-sage font-semibold mt-1 inline-block">
                    {r.tag}
                  </span>
                </div>
              </div>
            ))}
            <div
              className="absolute bottom-8 right-4 bg-chimge-primary text-[#FFF8EC] rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xl cursor-pointer"
              onClick={() => setScanOpen(true)}
            >
              <ScanLine size={18} />
              <div>
                <div className="text-[11px] font-bold">Баркод скан</div>
                <div className="text-[10px] opacity-75">
                  Орцоо уншуулаад жор ол
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* {scanOpen && <ScannerModal onClose={() => setScanOpen(false)} />} */}
    </>
  );
}
