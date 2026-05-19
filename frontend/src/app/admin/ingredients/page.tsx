/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import { adminApi } from "@/lib/admin";
import type { CatalogIngredient } from "@/lib/ingredientCatalog";

function isUntranslated(item: CatalogIngredient) {
  return item.nameMn.trim().toLowerCase() === item.mealDbName.trim().toLowerCase();
}

export default function AdminIngredientsPage() {
  const [items, setItems] = useState<CatalogIngredient[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [untranslatedOnly, setUntranslatedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await adminApi.listIngredients(debouncedQ || undefined);
      setItems(data.items);
      setTotal(data.total);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const item of data.items) {
          if (!(item.mealDbKey in next)) {
            next[item.mealDbKey] = item.nameMn;
          }
        }
        return next;
      });
    } catch {
      setItems([]);
      setMessage("Орц ачаалж чадсангүй");
    } finally {
      setLoading(false);
    }
  }, [debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (untranslatedOnly ? items.filter(isUntranslated) : items),
    [items, untranslatedOnly],
  );

  const untranslatedCount = useMemo(
    () => items.filter(isUntranslated).length,
    [items],
  );

  async function syncCatalog() {
    setSyncing(true);
    setMessage(null);
    try {
      const result = await adminApi.syncIngredients();
      setMessage(
        `Синк дууслаа: ${result.created} шинэ, ${result.updated} шинэчлэгдсэн (${result.total} нийт TheMealDB)`,
      );
      await load();
    } catch {
      setMessage("Синк амжилтгүй");
    } finally {
      setSyncing(false);
    }
  }

  async function save(item: CatalogIngredient) {
    const nameMn = (drafts[item.mealDbKey] ?? item.nameMn).trim();
    if (!nameMn) return;

    setSavingKey(item.mealDbKey);
    setMessage(null);
    try {
      const updated = await adminApi.updateIngredientNameMn(
        item.mealDbKey,
        nameMn,
      );
      setItems((prev) =>
        prev.map((row) => (row.mealDbKey === updated.mealDbKey ? updated : row)),
      );
      setDrafts((prev) => ({ ...prev, [item.mealDbKey]: updated.nameMn }));
      setMessage(`"${item.mealDbName}" хадгалагдлаа`);
    } catch {
      setMessage(`"${item.mealDbName}" хадгалж чадсангүй`);
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#221C16] mb-1">
            Орцын монгол нэр
          </h2>
          <p className="text-sm text-[#9C8878]">
            TheMealDB-ийн англи нэрийг хадгалж, хэрэглэгчид монгол нэр харуулна.
            Нийт {total} орц.
          </p>
        </div>
        <button
          type="button"
          onClick={syncCatalog}
          disabled={syncing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A4A] text-white
                     text-sm font-semibold hover:bg-[#244A3D] disabled:opacity-60 transition-colors shrink-0"
        >
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
          TheMealDB синк
        </button>
      </div>

      {message && (
        <p className="mb-4 text-sm text-[#5C4A3A] bg-white border border-[#D6C9B4]/70 rounded-xl px-4 py-2.5">
          {message}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Англи эсвэл монгол нэрээр хайх..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D6C9B4] text-sm
                       focus:border-[#B84230] focus:outline-none bg-white"
          />
        </div>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D6C9B4] bg-white text-sm text-[#5C4A3A] shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={untranslatedOnly}
            onChange={(e) => setUntranslatedOnly(e.target.checked)}
            className="accent-[#B84230]"
          />
          Орчуулаагүй ({untranslatedCount})
        </label>
      </div>

      {loading ? (
        <p className="text-[#9C8878]">Ачаалж байна...</p>
      ) : visible.length === 0 ? (
        <p className="text-[#9C8878]">Орц олдсонгүй</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => {
            const draft = drafts[item.mealDbKey] ?? item.nameMn;
            const dirty = draft.trim() !== item.nameMn.trim();
            const needsTranslation = isUntranslated(item);

            return (
              <li
                key={item.mealDbKey}
                className="bg-white rounded-xl border border-[#D6C9B4]/70 p-3 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0 sm:w-[200px] shrink-0">
                    {item.thumb ? (
                      <Image
                        src={item.thumb}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[#EFE8DA] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#221C16] truncate">
                        {item.mealDbName}
                      </p>
                      {needsTranslation && (
                        <span className="text-[10px] font-bold text-[#B85E1A] uppercase">
                          Орчуулаагүй
                        </span>
                      )}
                    </div>
                  </div>

                  <input
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.mealDbKey]: e.target.value,
                      }))
                    }
                    placeholder="Монгол нэр..."
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#D6C9B4] text-sm
                               focus:border-[#B84230] focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => save(item)}
                    disabled={
                      savingKey === item.mealDbKey || !draft.trim() || !dirty
                    }
                    className="px-4 py-2 rounded-xl bg-[#B84230] text-white text-sm font-semibold
                               hover:bg-[#9C3426] disabled:opacity-50 transition-colors shrink-0"
                  >
                    {savingKey === item.mealDbKey ? "..." : "Хадгалах"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
