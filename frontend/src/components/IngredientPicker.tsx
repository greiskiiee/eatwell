"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchIngredients, type USDAFood } from "@/lib/usda";

export interface IngredientEntry {
  food: USDAFood;
  grams: number;
}

interface Props {
  value: IngredientEntry[];
  onChange: (v: IngredientEntry[]) => void;
}

export function IngredientPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<USDAFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [pendingFood, setPendingFood] = useState<USDAFood | null>(null);
  const [grams, setGrams] = useState<number | "">(100);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const foods = await searchIngredients(query);
        setResults(foods);
        setOpen(true);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  function selectFood(food: USDAFood) {
    setPendingFood(food);
    setOpen(false);
    setQuery(food.description);
  }

  function addIngredient() {
    if (!pendingFood || !grams) return;
    onChange([...value, { food: pendingFood, grams: Number(grams) }]);
    setPendingFood(null);
    setQuery("");
    setGrams(100);
    inputRef.current?.focus();
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPendingFood(null);
            }}
            placeholder="Орц хайх... (жнь: chicken, rice, egg)"
            className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
                       border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
                       transition-colors placeholder-[#B8A898]"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9C8878]">
              Хайж байна...
            </span>
          )}

          {/* Dropdown */}
          {open && results.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border
                            border-[#D6C9B4] shadow-lg z-20 overflow-hidden max-h-56 overflow-y-auto"
            >
              {results.map((food) => (
                <button
                  key={food.fdcId}
                  type="button"
                  onClick={() => selectFood(food)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#EFE8DA] transition-colors
                             border-b border-[#EFE8DA] last:border-0"
                >
                  <p className="text-[13px] font-semibold text-[#221C16] line-clamp-1">
                    {food.description}
                  </p>
                  <p className="text-[11px] text-[#9C8878] mt-0.5">
                    {food.nutrients.calories.toFixed(0)} ккал ·{" "}
                    {food.nutrients.proteinG.toFixed(1)}г уураг ·{" "}
                    {food.nutrients.carbsG.toFixed(1)}г нүүрс ус ·{" "}
                    {food.nutrients.fatG.toFixed(1)}г өөх — 100г тутамд
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grams input — only show after food is picked */}
        {pendingFood && (
          <>
            <div className="relative w-28">
              <input
                type="number"
                min={1}
                value={grams}
                onChange={(e) =>
                  setGrams(e.target.value === "" ? "" : +e.target.value)
                }
                placeholder="гр"
                className="w-full px-3 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
                           border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
                           transition-colors text-center"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9C8878]">
                гр
              </span>
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B84230] text-white
                         text-[13px] font-semibold hover:bg-[#9C3426] transition-colors shrink-0"
            >
              <Plus size={14} /> Нэмэх
            </button>
          </>
        )}
      </div>

      {/* Added ingredients list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3.5 py-2.5 bg-white rounded-xl
                         border border-[#D6C9B4]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#221C16] line-clamp-1">
                  {entry.food.description}
                </p>
                <p className="text-[11px] text-[#9C8878] mt-0.5">
                  {(
                    (entry.food.nutrients.calories * entry.grams) /
                    100
                  ).toFixed(0)}{" "}
                  ккал ·{" "}
                  {(
                    (entry.food.nutrients.proteinG * entry.grams) /
                    100
                  ).toFixed(1)}
                  г уураг
                </p>
              </div>
              <span className="text-[13px] font-bold text-[#B84230] shrink-0">
                {entry.grams}г
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[#D6C9B4] hover:text-[#B84230] transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
