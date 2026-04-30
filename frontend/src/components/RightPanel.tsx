import { MealDBRecipe } from "@/lib/mealdb";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function RightPanel({ meals }: { meals: MealDBRecipe[] }) {
  return (
    <div className="hidden lg:block w-[252px] shrink-0 space-y-4">
      <div className="bg-white rounded-2xl border border-[#D6C9B4]/60 p-4 shadow-[0_2px_12px_rgba(34,28,22,0.06)]">
        <div className="flex items-center gap-2 mb-3.5">
          <TrendingUp size={14} className="text-[#B84230]" />
          <span className="text-[10.5px] font-bold text-[#9C8878] uppercase tracking-[0.7px]">
            Трэнд
          </span>
        </div>
        <div className="space-y-3.5">
          {meals.map((meal, i) => (
            <Link
              key={meal.idMeal}
              href={`/recipes/${meal.idMeal}`}
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
                  {meal.strMeal}
                </p>
                <p className="text-[10.5px] text-[#9C8878] mt-0.5">
                  {meal.strCategory}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
