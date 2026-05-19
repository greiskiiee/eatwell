"use client";

import { useEffect, useMemo, useState } from "react";
import { dedupeIngredientNames } from "@/lib/ingredientGroups";
import { fetchIngredientLabels } from "@/lib/ingredientCatalog";

export function useIngredientLabels(mealDbNames: string[]) {
  const unique = useMemo(
    () => dedupeIngredientNames(mealDbNames),
    [mealDbNames],
  );
  const requestKey = unique.join("\0");

  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (unique.length === 0) {
      setLabels({});
      return;
    }

    let cancelled = false;
    fetchIngredientLabels(unique)
      .then((map) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const name of unique) {
          next[name.toLowerCase()] = map[name]?.nameMn ?? name;
        }
        setLabels(next);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback: Record<string, string> = {};
          for (const name of unique) fallback[name.toLowerCase()] = name;
          setLabels(fallback);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, unique]);

  function labelFor(mealDbName: string) {
    return labels[mealDbName.trim().toLowerCase()] ?? mealDbName;
  }

  return { labelFor, labels };
}
