"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchIngredients } from "@/lib/usda";
import {
  type IngredientEntry,
  type IngredientUnit,
  INGREDIENT_UNITS,
  formatIngredientAmount,
  ingredientToGrams,
} from "@/lib/ingredients";

export type { IngredientEntry } from "@/lib/ingredients";

interface Props {
  value: IngredientEntry[];
  onChange: (v: IngredientEntry[]) => void;
}

export function IngredientPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<import("@/lib/usda").USDAFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingFood, setPendingFood] = useState<import("@/lib/usda").USDAFood | null>(null);
  const [amount, setAmount] = useState<number | "">(100);
  const [unit, setUnit] = useState<IngredientUnit>("g");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      if (debounce.current) clearTimeout(debounce.current);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const foods = await searchIngredients(query);
        setResults(foods);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  const queryActive = query.trim().length >= 2;
  const showSearching = searching && queryActive;

  function selectFood(food: import("@/lib/usda").USDAFood) {
    const existing = value.find((e) => e.food.fdcId === food.fdcId);
    setPendingFood(food);
    setResults([]);
    setQuery(food.description);
    setAmount(existing?.amount ?? (unit === "kg" ? 1 : unit === "piece" ? 1 : 100));
    setUnit(existing?.unit ?? "g");
  }

  function addIngredient() {
    if (!pendingFood || !amount) return;
    const amountNum = Number(amount);
    const entry: IngredientEntry = {
      food: pendingFood,
      amount: amountNum,
      unit,
    };
    const exists = value.findIndex((e) => e.food.fdcId === pendingFood.fdcId);
    if (exists >= 0) {
      const next = [...value];
      next[exists] = entry;
      onChange(next);
    } else {
      onChange([...value, entry]);
    }
    setPendingFood(null);
    setResults([]);
    setQuery("");
    setAmount(100);
    setUnit("g");
    inputRef.current?.focus();
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  const gramsPreview = pendingFood && amount
    ? ingredientToGrams(Number(amount), unit)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap min-w-0">
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] min-w-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              setPendingFood(null);
              if (next.trim().length < 2) setResults([]);
            }}
            placeholder="Орц хайх... (жнь: chicken, rice)"
            className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
                       border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
                       transition-colors placeholder-[#B8A898]"
          />
          {showSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9C8878]">
              Хайж байна...
            </span>
          )}
        </div>

        {pendingFood && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min={0.1}
              step="any"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === "" ? "" : +e.target.value)
              }
              className="w-24 flex-1 sm:flex-none min-w-[72px] px-3 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
                         border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none text-center"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as IngredientUnit)}
              className="flex-1 sm:flex-none min-w-[100px] px-3 py-2.5 bg-white rounded-xl text-[13px] text-[#221C16]
                         border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none"
            >
              {INGREDIENT_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B84230] text-white
                         text-[13px] font-semibold hover:bg-[#9C3426] transition-colors shrink-0"
            >
              <Plus size={14} /> Нэмэх
            </button>
          </div>
        )}
      </div>

      {queryActive && !pendingFood && results.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-[#9C8878] uppercase tracking-wider px-1">
            Хайлтын үр дүн
          </p>
          <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-xl">
            {results.map((food) => (
              <button
                key={food.fdcId}
                type="button"
                onClick={() => selectFood(food)}
                className="w-full text-left px-3.5 py-2.5 bg-white rounded-xl border border-[#D6C9B4]
                           hover:border-[#B84230] hover:bg-[#FBF0E6]/40 transition-colors"
              >
                <p className="text-[13px] font-semibold text-[#221C16] line-clamp-2">
                  {food.description}
                </p>
                <p className="text-[11px] text-[#9C8878] mt-0.5">
                  {food.nutrients.calories.toFixed(0)} ккал ·{" "}
                  {food.nutrients.proteinG.toFixed(1)}г уураг — 100г тутамд
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {queryActive && !showSearching && results.length === 0 && (
        <p className="text-[12px] text-[#9C8878] px-1">Орц олдсонгүй</p>
      )}

      {pendingFood && amount && (
        <p className="text-[11px] text-[#9C8878] px-1">
          Хоолны үнэлгээнд ~{gramsPreview.toFixed(0)}г тооцно
          {unit === "piece" ? " (1 ширхэг ≈ 50г)" : ""}
        </p>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((entry, i) => {
            const grams = ingredientToGrams(entry.amount, entry.unit);
            return (
              <div
                key={entry.food.fdcId}
                className="flex items-center gap-3 px-3.5 py-2.5 bg-white rounded-xl
                           border border-[#D6C9B4]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#221C16] line-clamp-1">
                    {entry.food.description}
                  </p>
                  <p className="text-[11px] text-[#9C8878] mt-0.5">
                    {(
                      (entry.food.nutrients.calories * grams) /
                      100
                    ).toFixed(0)}{" "}
                    ккал ·{" "}
                    {(
                      (entry.food.nutrients.proteinG * grams) /
                      100
                    ).toFixed(1)}
                    г уураг
                  </p>
                </div>
                <span className="text-[13px] font-bold text-[#B84230] shrink-0">
                  {formatIngredientAmount(entry)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-[#D6C9B4] hover:text-[#B84230] transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
