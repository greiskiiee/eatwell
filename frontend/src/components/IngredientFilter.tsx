/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, ListFilter } from "lucide-react";
import Image from "next/image";
import {
  groupCatalogItems,
  type IngredientGroup,
} from "@/lib/ingredientGroups";
import { useIngredientCatalog } from "@/hooks/useIngredientCatalog";
import { searchIngredients, type USDAFood } from "@/lib/usda";
import { usdaToMealDbMatch } from "@/lib/ingredientBridge";

interface Props {
  selected: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientFilter({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { items: allIngredients, loading } = useIngredientCatalog();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["meat", "vegetables"]),
  );
  const [usdaResults, setUsdaResults] = useState<USDAFood[]>([]);
  const [usdaSearching, setUsdaSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const usdaDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setUsdaResults([]);
      setUsdaSearching(false);
      if (usdaDebounce.current) clearTimeout(usdaDebounce.current);
      return;
    }

    if (usdaDebounce.current) clearTimeout(usdaDebounce.current);
    usdaDebounce.current = setTimeout(async () => {
      setUsdaSearching(true);
      try {
        const foods = await searchIngredients(trimmed);
        setUsdaResults(foods);
      } catch {
        setUsdaResults([]);
      } finally {
        setUsdaSearching(false);
      }
    }, 400);

    return () => {
      if (usdaDebounce.current) clearTimeout(usdaDebounce.current);
    };
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? allIngredients.filter(
          (i) =>
            i.nameMn.toLowerCase().includes(q) ||
            i.mealDbName.toLowerCase().includes(q),
        )
      : allIngredients;
    return groupCatalogItems(list);
  }, [allIngredients, query]);

  const usdaMatches = useMemo(
    () =>
      usdaResults.map((food) => ({
        food,
        match: usdaToMealDbMatch(food, allIngredients),
      })),
    [usdaResults, allIngredients],
  );

  useEffect(() => {
    if (query.trim()) {
      setExpanded(new Set(filtered.map((g) => g.group.id)));
    }
  }, [query, filtered]);

  function toggle(mealDbName: string) {
    const key = mealDbName.trim();
    if (selected.some((s) => s.toLowerCase() === key.toLowerCase())) {
      onChange(selected.filter((s) => s.toLowerCase() !== key.toLowerCase()));
    } else {
      onChange([...selected, key]);
      setOpen(false);
      setQuery("");
      setUsdaResults([]);
    }
  }

  function selectUsdaFood(food: USDAFood) {
    const match = usdaToMealDbMatch(food, allIngredients);
    if (!match) return;
    toggle(match.mealDbName);
    setOpen(false);
    setQuery("");
    setUsdaResults([]);
  }

  function toggleGroup(group: IngredientGroup) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(group.id)) next.delete(group.id);
      else next.add(group.id);
      return next;
    });
  }

  const queryActive = query.trim().length >= 2;
  const catalogCount = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Орцоор хайх"
        aria-expanded={open}
        className="flex items-center justify-center gap-1 h-9 px-2.5 sm:px-3 rounded-xl bg-white border border-[#D6C9B4]
                   text-[12px] sm:text-[13px] font-semibold text-[#5C4A3A] hover:border-[#B84230] transition-colors
                   shadow-sm whitespace-nowrap"
      >
        <ListFilter size={15} className="text-[#5C4A3A] min-[400px]:hidden shrink-0" />
        <span className="hidden min-[400px]:inline">Орц</span>
        {selected.length > 0 && (
          <span
            className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#B84230] text-white text-[10px]
                       font-bold flex items-center justify-center"
          >
            {selected.length}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-[#9C8878] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/25 sm:hidden"
            aria-label="Хаах"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Орцоор хайх"
            className="fixed left-3 right-3 top-14 z-50 max-h-[min(70vh,28rem)]
                       flex flex-col overflow-hidden bg-white rounded-2xl border border-[#D6C9B4] shadow-xl
                       sm:absolute sm:left-0 sm:right-0 sm:top-full sm:mt-2 sm:w-full sm:max-w-[360px]
                       sm:max-h-72 sm:flex-none md:left-auto md:right-0 md:w-[min(calc(100vw-2rem),360px)]"
          >
          <div className="p-3 border-b border-[#EFE8DA]">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="USDA эсвэл орц хайх..."
                autoFocus
                className="w-full pl-8 pr-3 py-2 rounded-xl text-[13px] text-[#221C16]
                           border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-[#9C8878] mt-1.5 px-0.5">
              USDA-аас сонгоход TheMealDB жор автоматаар шүүнэ
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto sm:max-h-72">
            {queryActive && (
              <div className="border-b border-[#EFE8DA]">
                <div className="px-3.5 py-2 bg-[#FBF0E6]/60">
                  <p className="text-[10px] font-bold text-[#B84230] uppercase tracking-wider">
                    USDA хайлт
                  </p>
                </div>
                {usdaSearching ? (
                  <p className="text-center text-[12px] text-[#9C8878] py-4">
                    USDA-аас хайж байна...
                  </p>
                ) : usdaMatches.length === 0 ? (
                  <p className="text-center text-[12px] text-[#9C8878] py-4">
                    USDA-д олдсонгүй
                  </p>
                ) : (
                  <div className="py-1">
                    {usdaMatches.map(({ food, match }) => {
                      if (!match) return null;
                      const isSelected = selected.some(
                        (s) =>
                          s.toLowerCase() === match.mealDbName.toLowerCase(),
                      );
                      return (
                        <button
                          key={food.fdcId}
                          type="button"
                          onClick={() => selectUsdaFood(food)}
                          className={`w-full flex flex-col gap-0.5 px-3.5 py-2.5 text-left
                                      hover:bg-[#EFE8DA] transition-colors ${
                                        isSelected ? "bg-[#B84230]/8" : ""
                                      }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="flex-1 text-[13px] font-semibold text-[#221C16] line-clamp-2">
                              {food.description}
                            </span>
                            {isSelected && (
                              <Check
                                size={14}
                                className="text-[#B84230] shrink-0 mt-0.5"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-[#9C8878]">
                            {food.nutrients.calories.toFixed(0)} ккал ·{" "}
                            {food.nutrients.proteinG.toFixed(1)}г уураг / 100г
                          </p>
                          <p className="text-[11px] text-[#B85E1A] font-medium">
                            → {match.nameMn} ({match.mealDbName})
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="px-3.5 py-2 bg-[#FAF7F0] border-b border-[#EFE8DA]">
                <p className="text-[10px] font-bold text-[#5C4A3A] uppercase tracking-wider">
                  TheMealDB орц{queryActive ? ` (${catalogCount})` : ""}
                </p>
              </div>
              {loading ? (
                <p className="text-center text-[12px] text-[#9C8878] py-8">
                  Орц ачаалж байна...
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-[12px] text-[#9C8878] py-8">
                  Орц олдсонгүй
                </p>
              ) : (
                filtered.map(({ group, items }) => (
                  <div
                    key={group.id}
                    className="border-b border-[#EFE8DA] last:border-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5
                                 bg-[#FAF7F0] hover:bg-[#EFE8DA] transition-colors"
                    >
                      <span className="text-[11px] font-bold text-[#5C4A3A] uppercase tracking-wider">
                        {group.label}
                      </span>
                      <span className="text-[10px] text-[#9C8878] flex items-center gap-1">
                        {items.length}
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${
                            expanded.has(group.id) ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>
                    {(expanded.has(group.id) || query.trim()) && (
                      <div className="py-1">
                        {items.map((ing) => {
                          const isSelected = selected.some(
                            (s) =>
                              s.toLowerCase() === ing.mealDbName.toLowerCase(),
                          );
                          return (
                            <button
                              key={ing.mealDbKey}
                              type="button"
                              onClick={() => toggle(ing.mealDbName)}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left
                                          hover:bg-[#EFE8DA] transition-colors ${
                                            isSelected ? "bg-[#B84230]/8" : ""
                                          }`}
                            >
                              {ing.thumb ? (
                                <Image
                                  src={ing.thumb}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <span className="w-6 h-6 rounded-full bg-[#EFE8DA] shrink-0" />
                              )}
                              <span className="flex-1 text-[13px] text-[#221C16]">
                                {ing.nameMn}
                              </span>
                              {isSelected && (
                                <Check
                                  size={14}
                                  className="text-[#B84230] shrink-0"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
