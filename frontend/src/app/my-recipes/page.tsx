"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SystemRecipeCard } from "@/components/SystemRecipeCard";
import { useUser } from "@/context/UserContext";
import { useSavedRecipes } from "@/context/SavedRecipesContext";
import { useMyRecipes } from "@/hooks/useMyRecipes";

export default function MyRecipesPage() {
  const router = useRouter();
  const user = useUser();
  const { recipes, loading, error, refresh } = useMyRecipes();
  const { isSaved, toggleSave } = useSavedRecipes();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "technologist") {
      router.replace("/home");
    }
  }, [user, router]);

  if (!user || user.role !== "technologist") {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <header
          className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                     border-b border-[#D6C9B4]/70 py-3 px-3 sm:px-4 md:px-8
                     pl-14 sm:pl-4 md:pl-8 flex flex-wrap items-center gap-3"
        >
          <h1 className="font-display text-[17px] sm:text-[19px] font-semibold text-[#221C16]">
            Миний жорууд
          </h1>
          <Link
            href="/new-recipe"
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-[#B84230] text-white
                       text-[13px] font-semibold hover:bg-[#9C3426] transition-colors shadow-sm shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Жор нэмэх</span>
          </Link>
        </header>

        <div className="px-3 sm:px-4 md:px-8 py-6 space-y-4">
          {error && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-[#FBF0E6]
                           border border-[#B84230]/20 text-[#B84230] text-[13px]">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => refresh()}
                className="text-[13px] font-semibold underline"
              >
                Дахин оролдох
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-[#D6C9B4]/40 animate-pulse"
                />
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-[#9C8878] text-sm">Та одоогоор жор нэмээгүй байна.</p>
              <Link
                href="/new-recipe"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B84230] text-white
                           text-[13px] font-semibold hover:bg-[#9C3426] transition-colors"
              >
                <Plus size={14} />
                Эхний жораа нэмэх
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-[#9C8878]">{recipes.length} жор</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <div key={recipe._id} className="relative group/card">
                    {recipe.isDraft && (
                      <span
                        className="absolute top-3 left-3 z-20 text-[9px] font-bold px-2 py-0.5 rounded-full
                                   bg-[#5C4A3A] text-white uppercase tracking-wide"
                      >
                        Драфт
                      </span>
                    )}
                    <Link
                      href={`/edit-recipe/${recipe._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-12 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#D6C9B4]
                                 flex items-center justify-center text-[#5C4A3A] hover:text-[#B84230]
                                 hover:border-[#B84230] shadow-sm opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100
                                 transition-opacity"
                      aria-label="Жор засах"
                    >
                      <Pencil size={14} />
                    </Link>
                    <SystemRecipeCard
                      recipe={recipe}
                      saved={isSaved(recipe._id)}
                      onToggleSave={() => toggleSave(recipe._id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
