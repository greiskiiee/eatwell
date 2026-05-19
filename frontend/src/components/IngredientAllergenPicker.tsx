"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import Image from "next/image";
import {
  dedupeIngredientNames,
  groupCatalogItems,
  type IngredientGroup,
} from "@/lib/ingredientGroups";
import { useIngredientCatalog } from "@/hooks/useIngredientCatalog";
import { useIngredientLabels } from "@/hooks/useIngredientLabels";

interface Props {
  selected: string[];
  onChange: (ingredients: string[]) => void;
  maxHeight?: string;
}

export function IngredientAllergenPicker({
  selected,
  onChange,
  maxHeight = "max-h-80",
}: Props) {
  const [query, setQuery] = useState("");
  const { items: allIngredients, loading } = useIngredientCatalog();
  const { labelFor } = useIngredientLabels(selected);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["dairy", "grains", "legumes", "seafood"]),
  );

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

  const searchActive = query.trim().length > 0;

  function isGroupExpanded(groupId: string) {
    return searchActive || expanded.has(groupId);
  }

  function toggle(mealDbName: string) {
    const key = mealDbName.trim();
    if (selected.some((s) => s.toLowerCase() === key.toLowerCase())) {
      onChange(selected.filter((s) => s.toLowerCase() !== key.toLowerCase()));
    } else {
      onChange(dedupeIngredientNames([...selected, key]));
    }
  }

  function remove(name: string) {
    onChange(selected.filter((s) => s !== name));
  }

  function toggleGroup(group: IngredientGroup) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(group.id)) next.delete(group.id);
      else next.add(group.id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full
                         bg-[#FBF0E6] text-[#B85E1A] font-medium max-w-full"
            >
              <span className="truncate">{labelFor(ing)}</span>
              <button
                type="button"
                onClick={() => remove(ing)}
                className="hover:text-[#B84230]"
                aria-label={`${labelFor(ing)} хасах`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8878]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Харшлын орц хайх..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-[13px] text-[#221C16]
                     border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none"
        />
      </div>

      <div
        className={`${maxHeight} overflow-y-auto bg-white rounded-xl border border-[#D6C9B4]`}
      >
        {loading ? (
          <p className="text-center text-[12px] text-[#9C8878] py-10">
            Орц ачаалж байна...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[12px] text-[#9C8878] py-10">
            Орц олдсонгүй
          </p>
        ) : (
          filtered.map(({ group, items }) => (
            <div key={group.id} className="border-b border-[#EFE8DA] last:border-0">
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
                      isGroupExpanded(group.id) ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
              {isGroupExpanded(group.id) && (
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
                          <Check size={14} className="text-[#B84230] shrink-0" />
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
  );
}
