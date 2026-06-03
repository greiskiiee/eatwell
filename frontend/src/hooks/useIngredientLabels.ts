/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { dedupeIngredientNames } from "@/lib/ingredientGroups";
import { fetchIngredientLabels } from "@/lib/ingredientCatalog";
import { anyTokenLabel, isAnyToken } from "@/lib/ingredientAny";

export function useIngredientLabels(mealDbNames: string[]) {
  const namesKey = mealDbNames.join("\0");
  const requestKey = useMemo(
    () => dedupeIngredientNames(mealDbNames).join("\0"),
    // namesKey tracks contents; mealDbNames[] reference alone is unstable
    [namesKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!requestKey) {
      setLabels((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const names = requestKey.split("\0");
    let cancelled = false;
    fetchIngredientLabels(names)
      .then((map) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const name of names) {
          next[name.toLowerCase()] = map[name]?.nameMn ?? name;
        }
        setLabels(next);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback: Record<string, string> = {};
          for (const name of names) fallback[name.toLowerCase()] = name;
          setLabels(fallback);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  function labelFor(mealDbName: string) {
    if (isAnyToken(mealDbName)) return anyTokenLabel(mealDbName);
    return labels[mealDbName.trim().toLowerCase()] ?? mealDbName;
  }

  return { labelFor, labels };
}
