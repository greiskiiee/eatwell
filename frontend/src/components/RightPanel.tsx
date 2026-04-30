import { Recipe } from "@/lib/types";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function RightPanel({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="hidden lg:block w-63 shrink-0 space-y-4">
      {/* Trending */}
      <div className="bg-white rounded-2xl border border-[#D6C9B4]/60 p-4 shadow-[0_2px_12px_rgba(34,28,22,0.06)]">
        <div className="flex items-center gap-2 mb-3.5">
          <TrendingUp size={14} className="text-[#B84230]" />
          <span className="text-[10.5px] font-bold text-[#9C8878] uppercase tracking-[0.7px]">
            Трэнд
          </span>
        </div>
        <div className="space-y-3.5">
          {recipes.slice(0, 4).map((r, i) => (
            <Link
              key={r._id}
              href={`/recipes/${r._id}`}
              className="flex items-start gap-3 group"
            >
              <span className="font-display text-[20px] font-semibold text-[#D6C9B4] leading-none w-5 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-semibold text-[#221C16] leading-snug line-clamp-2
                              group-hover:text-[#B84230] transition-colors"
                >
                  {r.title}
                </p>
                <p className="text-[10.5px] text-[#9C8878] mt-0.5">
                  {r.categories[0]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
