/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategoryList } from "@/lib/mealdb";
import { recipeApi } from "@/lib/recipes";

export type TagSource = "mealdb" | "eatwell";

export interface TagEntry {
  id: string;
  label: string;
  sources: TagSource[];
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function useTagCatalog() {
  const [mealdbTags, setMealdbTags] = useState<string[]>([]);
  const [eatwellTags, setEatwellTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      getCategoryList(),
      recipeApi.tags().catch(() => [] as string[]),
    ])
      .then(([mealRes, eatwellRes]) => {
        if (cancelled) return;
        setMealdbTags(mealRes.status === "fulfilled" ? mealRes.value : []);
        setEatwellTags(eatwellRes.status === "fulfilled" ? eatwellRes.value : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tags = useMemo<TagEntry[]>(() => {
    const map = new Map<string, TagEntry>();

    for (const raw of mealdbTags) {
      const label = raw.trim();
      if (!label) continue;
      const key = normalizeKey(label);
      const existing = map.get(key);
      if (existing) {
        if (!existing.sources.includes("mealdb")) existing.sources.push("mealdb");
      } else {
        map.set(key, { id: key, label, sources: ["mealdb"] });
      }
    }

    for (const raw of eatwellTags) {
      const label = raw.trim();
      if (!label) continue;
      const key = normalizeKey(label);
      const existing = map.get(key);
      if (existing) {
        if (!existing.sources.includes("eatwell")) existing.sources.push("eatwell");
      } else {
        map.set(key, { id: key, label, sources: ["eatwell"] });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [mealdbTags, eatwellTags]);

  const findByLabel = useMemo(
    () => (label: string | null) => {
      if (!label) return null;
      const key = normalizeKey(label);
      return tags.find((t) => t.id === key) ?? null;
    },
    [tags],
  );

  return { tags, loading, findByLabel };
}
