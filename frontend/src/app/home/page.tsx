"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { HomeHeader } from "@/components/HomeHeader";
import { CategoryBar } from "@/components/CategoryBar";
import { RecipeGrid } from "@/components/RecipeGrid";
import { CATEGORIES, MOCK_RECIPES } from "@/lib/constants";
import { AuthUser, getStoredUser } from "@/lib/auth";
import { FeaturedCard } from "@/components/FeaturedCard";
import { RightPanel } from "@/components/RightPanel";

export default function HomePage() {
  const [category, setCategory] = useState("Бүгд");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchQ, setSearchQ] = useState("");

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser();
  });

  const isTechnologist = user?.role === "technologist";

  const featured = MOCK_RECIPES.find((r) => r.isFeatured)!;
  const rest = MOCK_RECIPES.filter((r) => !r.isFeatured);
  const filtered =
    category === "Бүгд"
      ? rest
      : rest.filter((r) => r.categories.includes(category));
  const display = searchQ
    ? filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          r.categories.some((c) => c.includes(searchQ)),
      )
    : filtered;

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // useEffect(() => {
  //   setUser(getStoredUser());
  // }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#EFE8DA]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto min-w-0">
        <HomeHeader
          searchQ={searchQ}
          onSearch={setSearchQ}
          isTechnologist={isTechnologist}
          userName={user?.name}
        />

        <div className="flex gap-6 px-4 md:px-8 pt-6 pb-10 min-w-0">
          <div className="flex-1 min-w-0 space-y-5">
            <FeaturedCard
              recipe={featured}
              saved={savedIds.has(featured._id)}
              onToggleSave={() => toggleSave(featured._id)}
            />
            <CategoryBar
              categories={CATEGORIES}
              active={category}
              onChange={setCategory}
            />
            <RecipeGrid
              recipes={display}
              savedIds={savedIds}
              onToggleSave={toggleSave}
              category={category}
            />
          </div>

          <RightPanel recipes={MOCK_RECIPES} />
        </div>
      </div>
    </div>
  );
}
