"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check, Tags } from "lucide-react";
import { useTagCatalog } from "@/hooks/useTagCatalog";

interface Props {
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export function TagFilter({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { tags, loading } = useTagCatalog();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.label.toLowerCase().includes(q));
  }, [tags, query]);

  const selectedLabel = useMemo(() => {
    if (!selected) return null;
    return (
      tags.find((t) => t.id === selected.trim().toLowerCase())?.label ?? selected
    );
  }, [tags, selected]);

  function pick(label: string) {
    if (selected && selected.toLowerCase() === label.toLowerCase()) {
      onChange(null);
    } else {
      onChange(label);
    }
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Шошгоор шүүх"
        aria-expanded={open}
        className="flex items-center justify-center gap-1 h-9 px-2.5 sm:px-3 rounded-xl bg-white border border-[#D6C9B4]
                   text-[12px] sm:text-[13px] font-semibold text-[#5C4A3A] hover:border-[#B84230] transition-colors
                   shadow-sm whitespace-nowrap max-w-[160px]"
      >
        <Tags size={15} className="text-[#5C4A3A] min-[400px]:hidden shrink-0" />
        <span className="hidden min-[400px]:inline truncate">
          {selectedLabel ?? "Шошго"}
        </span>
        {selected && (
          <span
            className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#B84230] text-white text-[10px]
                       font-bold flex items-center justify-center"
          >
            1
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
            aria-label="Шошгоор шүүх"
            className="fixed left-3 right-3 top-14 z-50 max-h-[min(70vh,28rem)]
                       flex flex-col overflow-hidden bg-white rounded-2xl border border-[#D6C9B4] shadow-xl
                       sm:absolute sm:left-0 sm:right-0 sm:top-full sm:mt-2 sm:w-full sm:max-w-[320px]
                       sm:max-h-72 sm:flex-none md:left-auto md:right-0 md:w-[min(calc(100vw-2rem),320px)]"
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
                  placeholder="Шошго хайх..."
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-[13px] text-[#221C16]
                             border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto sm:max-h-72">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left
                            hover:bg-[#EFE8DA] transition-colors ${
                              selected == null ? "bg-[#B84230]/8" : ""
                            }`}
              >
                <span className="flex-1 text-[13px] text-[#221C16] font-semibold">
                  Бүгд
                </span>
                {selected == null && (
                  <Check size={14} className="text-[#B84230] shrink-0" />
                )}
              </button>

              {loading ? (
                <p className="text-center text-[12px] text-[#9C8878] py-8">
                  Шошго ачаалж байна...
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-[12px] text-[#9C8878] py-8">
                  Шошго олдсонгүй
                </p>
              ) : (
                filtered.map((tag) => {
                  const isSelected =
                    selected?.toLowerCase() === tag.id.toLowerCase();
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => pick(tag.label)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left
                                  hover:bg-[#EFE8DA] transition-colors ${
                                    isSelected ? "bg-[#B84230]/8" : ""
                                  }`}
                    >
                      <span className="flex-1 text-[13px] text-[#221C16]">
                        {tag.label}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        {tag.sources.includes("eatwell") && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#F5E6E2] text-[#B84230]">
                            Eatwell+
                          </span>
                        )}
                        {tag.sources.includes("mealdb") && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#EFE8DA] text-[#5C4A3A]">
                            MealDB
                          </span>
                        )}
                        {isSelected && (
                          <Check size={14} className="text-[#B84230]" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
