import { Clock, Flame, Star, BadgeCheck } from "lucide-react";

const RECIPES = [
  {
    emoji: "🥩",
    gradient: "from-amber-700 to-amber-500",
    title: "Хорхог — гэр бүлийн уламжлалт",
    tag: "Үндэсний хоол",
    time: "120",
    cal: "540",
    rating: "4.9",
    author: "Б. Сараа",
    verified: true,
    premium: false,
  },
  {
    emoji: "🍜",
    gradient: "from-orange-400 to-yellow-300",
    title: "Цуйван, ногоотой хувилбар",
    tag: "Хурдан хоол",
    time: "35",
    cal: "380",
    rating: "4.8",
    author: "Д. Энхтуяа",
    verified: true,
    premium: true,
  },
  {
    emoji: "🥟",
    gradient: "from-rose-300 to-pink-200",
    title: "Бууз — уламжлалт арга",
    tag: "Үндэсний хоол",
    time: "90",
    cal: "420",
    rating: "4.9",
    author: "Г. Болд",
    verified: false,
    premium: false,
  },
  {
    emoji: "🍲",
    gradient: "from-teal-500 to-emerald-300",
    title: "Гурилтай шөл — хялбар",
    tag: "Шөл",
    time: "45",
    cal: "210",
    rating: "4.7",
    author: "Н. Мөнх",
    verified: true,
    premium: false,
  },
];

export function RecipeShowcase() {
  return (
    <section id="recipes" className="py-20 px-6 bg-chimge-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chimge-primary-soft text-chimge-primary text-[12px] font-semibold mb-4">
              Баталгаажсан технологичдын жорууд
            </div>
            <h2 className="font-serif-display text-[36px] font-semibold text-chimge-ink leading-tight">
              Өнөөдөр юу хийх вэ?
            </h2>
          </div>
          <button className="text-[13px] font-medium text-chimge-primary hover:underline hidden md:block">
            Бүгдийг харах →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RECIPES.map((r) => (
            <div
              key={r.title}
              className="bg-white rounded-2xl border border-chimge-line overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div
                className={`h-[140px] bg-gradient-to-br ${r.gradient} flex items-center justify-center text-5xl relative`}
              >
                {r.emoji}
                {r.premium && (
                  <span className="absolute top-2 right-2 text-[9.5px] px-2 py-[2px] rounded-full bg-chimge-gold text-white font-bold">
                    Premium
                  </span>
                )}
              </div>
              <div className="p-4">
                <span className="text-[10.5px] px-2.5 py-[3px] rounded-full bg-chimge-primary-soft text-chimge-primary font-semibold">
                  {r.tag}
                </span>
                <h3 className="font-serif-display text-[15px] font-semibold text-chimge-ink mt-2 mb-2 leading-snug line-clamp-2">
                  {r.title}
                </h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded-full bg-chimge-sage-soft flex items-center justify-center text-[9px] font-bold text-chimge-sage">
                    {r.author[0]}
                  </div>
                  <span className="text-[11px] text-chimge-ink-2 font-medium">
                    {r.author}
                  </span>
                  {r.verified && (
                    <BadgeCheck size={13} className="text-chimge-sage" />
                  )}
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-chimge-ink-3">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {r.time} мин
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={11} /> {r.cal} ккал
                  </span>
                  <span className="flex items-center gap-1 text-chimge-gold font-semibold">
                    <Star size={11} fill="#C58A2A" /> {r.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
