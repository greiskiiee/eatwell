import Link from "next/link";
import { ChevronRight } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/lib/types";

interface Props {
  recipes: Recipe[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  category: string;
}

export function RecipeGrid({
  recipes,
  savedIds,
  onToggleSave,
  category,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold text-[#221C16]">
          {category === "Бүгд" ? "Шинэ жорууд" : category}
        </h2>
        <Link
          href="/search"
          className="text-[12px] font-semibold text-[#B84230] hover:underline flex items-center gap-0.5"
        >
          Бүгдийг харах <ChevronRight size={13} />
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#9C8878] text-sm">Жор олдсонгүй</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {recipes.map((r) => (
            <RecipeCard
              key={r._id}
              recipe={r}
              saved={savedIds.has(r._id)}
              onToggleSave={() => onToggleSave(r._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
