"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/UserContext";
import { purchasesApi, type PaymentMethod } from "@/lib/purchases";

type PurchasedRecipesContextValue = {
  purchasedIds: Set<string>;
  loading: boolean;
  hasPurchased: (recipeId: string) => boolean;
  completePurchase: (recipeId: string, method: PaymentMethod) => Promise<void>;
  refresh: () => Promise<void>;
};

const PurchasedRecipesContext =
  createContext<PurchasedRecipesContextValue | null>(null);

export function PurchasedRecipesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setPurchasedIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const data = await purchasesApi.listMine();
      setPurchasedIds(
        new Set(data.purchases.map((p) => p.recipeId).filter(Boolean)),
      );
    } catch {
      setPurchasedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasPurchased = useCallback(
    (recipeId: string) => purchasedIds.has(recipeId),
    [purchasedIds],
  );

  const completePurchase = useCallback(
    async (recipeId: string, method: PaymentMethod) => {
      await purchasesApi.complete(recipeId, method);
      setPurchasedIds((prev) => new Set([...prev, recipeId]));
    },
    [],
  );

  const value = useMemo(
    () => ({
      purchasedIds,
      loading,
      hasPurchased,
      completePurchase,
      refresh,
    }),
    [purchasedIds, loading, hasPurchased, completePurchase, refresh],
  );

  return (
    <PurchasedRecipesContext.Provider value={value}>
      {children}
    </PurchasedRecipesContext.Provider>
  );
}

export function usePurchasedRecipes() {
  const ctx = useContext(PurchasedRecipesContext);
  if (!ctx) {
    throw new Error(
      "usePurchasedRecipes must be used within PurchasedRecipesProvider",
    );
  }
  return ctx;
}
