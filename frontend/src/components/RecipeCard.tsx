"use client";

import { useState } from "react";
import { Bookmark, Clock } from "lucide-react";

export function RecipeCard() {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-chimge-line shadow-sm">
      {/* Hero image */}
      <div
        className="relative h-[255px]"
        style={{
          background:
            "repeating-linear-gradient(-45deg,#b08448 0,#b08448 16px,#c09558 16px,#c09558 32px)",
        }}
      >
        <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-[rgba(20,14,8,0.85)] text-[#FFF8EC] text-[10.5px] font-bold px-3 py-1.5 rounded-full tracking-[0.4px]">
          ★ ОНЦЛОХ
        </span>

        <button
          onClick={() => setBookmarked((b) => !b)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow"
        >
          <Bookmark
            size={16}
            className={bookmarked ? "text-chimge-primary" : "text-chimge-ink-2"}
            fill={bookmarked ? "#C5532A" : "none"}
          />
        </button>

        <div
          className="absolute bottom-0 inset-x-0 px-4 py-3"
          style={{
            background:
              "linear-gradient(to top, rgba(20,14,8,0.55), transparent)",
          }}
        >
          <span className="text-[10.5px] font-bold text-white uppercase tracking-[0.9px]">
            ХОРХОГ — ГЭР БҮЛИЙН УЛАМЖЛАЛТ
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="flex gap-2 mb-3">
          <span className="text-[11.5px] px-2.5 py-[3px] rounded-full bg-chimge-primary-soft text-chimge-primary font-medium">
            Үндэсний хоол
          </span>
          <span className="text-[11.5px] px-2.5 py-[3px] rounded-full bg-chimge-bg text-chimge-ink-2 font-medium border border-chimge-line">
            Уламжлалт
          </span>
        </div>

        <h2 className="font-serif-display text-[22px] font-semibold text-chimge-ink mb-2 leading-snug">
          Хорхог — гэр бүлийн уламжлалт
        </h2>

        <p className="text-[13.5px] text-chimge-ink-2 leading-relaxed mb-4">
          Хадны нунтаг, эрх, бүх найрлагатай уламжлалт халуун чулуун дотор
          болгосон үхрийн махан хорхог.
        </p>

        <div className="flex items-center gap-[10px] text-[13px] text-chimge-ink-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-chimge-sage-soft flex items-center justify-center text-[10px] font-bold text-chimge-sage">
              Б
            </div>
            <span className="font-medium text-chimge-ink-2">Б. Сараа</span>
            <span className="text-[9.5px] px-[5px] py-[1px] rounded-full bg-chimge-sage-soft text-chimge-sage font-bold">
              ✓
            </span>
          </div>
          <span className="text-chimge-line">·</span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> 120 мин
          </span>
          <span className="text-chimge-line">·</span>
          <span>🔥 540 ккал</span>
          <span className="text-chimge-line">·</span>
          <span className="text-chimge-gold font-semibold">★ 4.9</span>
        </div>
      </div>
    </div>
  );
}
