"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SystemRecipeCard } from "@/components/SystemRecipeCard";
import { useUser } from "@/context/UserContext";
import { useSavedRecipes } from "@/context/SavedRecipesContext";
import { purchasesApi, type PurchasedEntry } from "@/lib/purchases";
import type { TechnologistRecipe } from "@/lib/recipes";

export default function PurchasedRecipesPage() {
  const router = useRouter();
  const user = useUser();
  const { isSaved, toggleSave } = useSavedRecipes();
  const [entries, setEntries] = useState<PurchasedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    purchasesApi
      .listMine()
      .then((data) => {
        if (!cancelled) setEntries(data.purchases);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const recipes = entries
    .map((e) => e.recipe)
    .filter((r): r is TechnologistRecipe => r != null && Boolean(r._id));

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        <header
          className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                     border-b border-[#D6C9B4]/70 py-3 px-3 sm:px-4 md:px-8
                     pl-14 sm:pl-4 md:pl-8"
        >
          <h1 className="font-display text-[17px] sm:text-[19px] font-semibold text-[#221C16]">
            Худалдаж авсан жорууд
          </h1>
        </header>

        <div className="px-3 sm:px-4 md:px-8 py-6">
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
            <div className="text-center py-20 space-y-3">
              <p className="text-[#9C8878] text-sm">
                Худалдаж авсан premium жор байхгүй байна.
              </p>
              <Link
                href="/search"
                className="inline-block text-[13px] font-semibold text-[#B84230] hover:underline"
              >
                Жор хайх
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[12px] text-[#9C8878] mb-4">
                {recipes.length} жор
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <SystemRecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    saved={isSaved(recipe._id)}
                    onToggleSave={() => toggleSave(recipe._id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
