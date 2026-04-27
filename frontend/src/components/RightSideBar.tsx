"use client";

import { Plus } from "lucide-react";

const INGREDIENTS = [
  "Үхрийн мах",
  "Төмс",
  "Лууван",
  "Сонгино",
  "Сармис",
  "Тосон гурил",
  "Сүү",
];

const FRIEND_SAVES = [
  {
    initial: "Г",
    bg: "#8C7B6A",
    name: "Г. Энхзэ",
    recipe: "Хун өндөгний мусс",
    time: "3ц",
  },
  {
    initial: "М",
    bg: "#5A7A8E",
    name: "М. Туяа",
    recipe: "Загасны шөл",
    time: "8ц",
  },
];

export function RightSidebar() {
  return (
    <aside className="w-[276px] flex-shrink-0 border-l border-chimge-line overflow-y-auto px-5 py-5 flex flex-col gap-4 bg-chimge-bg">
      {/* My Ingredients */}
      <div className="bg-white rounded-2xl border border-chimge-line p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-semibold text-chimge-ink">
            Миний орц
          </span>
          <button className="w-7 h-7 rounded-full bg-chimge-bg border border-chimge-line flex items-center justify-center text-chimge-ink-3 hover:bg-chimge-line transition-colors">
            <Plus size={13} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {INGREDIENTS.map((ing) => (
            <span
              key={ing}
              className="text-[11.5px] px-2.5 py-[3px] rounded-full bg-chimge-sage-soft text-chimge-sage font-medium"
            >
              {ing}
            </span>
          ))}
        </div>
        <button className="w-full text-left text-[12.5px] text-chimge-ink-2 px-3 py-2.5 rounded-xl border border-chimge-line bg-chimge-bg hover:bg-chimge-primary-soft hover:text-chimge-primary transition-colors">
          Эдгээрээс хийж болох жоруруд →
        </button>
      </div>

      {/* Today card */}
      <div className="rounded-2xl bg-chimge-primary-soft border border-[#f0c9b5] p-4">
        <div className="text-[10px] font-bold text-chimge-primary uppercase tracking-[0.7px] mb-1">
          Өнөөдөр · Лхагва
        </div>
        <div className="font-serif-display text-[18px] font-semibold text-chimge-primary leading-snug mb-1">
          Цуйван, ногоотой
        </div>
        <div className="text-[12px] text-chimge-ink-2">
          35 мин · Үлдэгдэл 2 орц дутуу
        </div>
      </div>

      {/* Friends saved */}
      <div className="bg-white rounded-2xl border border-chimge-line p-4">
        <div className="text-[14px] font-semibold text-chimge-ink mb-3">
          Найзуудад хадгалсан
        </div>
        <div className="flex flex-col gap-3">
          {FRIEND_SAVES.map((f) => (
            <div key={f.name} className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: f.bg }}
              >
                {f.initial}
              </div>
              <div className="flex-1 min-w-0 text-[12px] text-chimge-ink-2 leading-snug">
                <span className="font-medium text-chimge-ink">{f.name}</span>{" "}
                хадгаллаа ·{" "}
                <span className="italic text-chimge-ink-3">{f.recipe}</span>
              </div>
              <span className="text-[11px] text-chimge-ink-3 flex-shrink-0 mt-0.5">
                {f.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
