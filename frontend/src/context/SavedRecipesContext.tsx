"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { useUser } from "@/context/UserContext";
import { savedRecipesApi } from "@/lib/savedRecipes";

type SavedRecipesContextValue = {
  savedIds: Set<string>;
  isSaved: (recipeId: string) => boolean;
  toggleSave: (recipeId: string) => void;
  loading: boolean;
};

const SavedRecipesContext = createContext<SavedRecipesContextValue | null>(null);

export function SavedRecipesProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    let cancelled = false;
    setLoading(true);
    savedRecipesApi
      .list()
      .then(({ recipeIds }) => {
        if (!cancelled) setSavedIds(new Set(recipeIds));
      })
      .catch(() => {
        if (!cancelled) setSavedIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleSave = useCallback(
    (recipeId: string) => {
      const id = recipeId.trim();
      if (!id) return;

      if (!user) {
        setLoginModalOpen(true);
        return;
      }

      let wasSaved = false;
      setSavedIds((prev) => {
        wasSaved = prev.has(id);
        const next = new Set(prev);
        if (wasSaved) next.delete(id);
        else next.add(id);
        return next;
      });

      const request = wasSaved
        ? savedRecipesApi.remove(id)
        : savedRecipesApi.add(id);

      request.catch(() => {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
      });
    },
    [user],
  );

  const value = useMemo(
    () => ({
      savedIds,
      isSaved: (recipeId: string) => savedIds.has(recipeId),
      toggleSave,
      loading,
    }),
    [savedIds, toggleSave, loading],
  );

  return (
    <SavedRecipesContext.Provider value={value}>
      {children}
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </SavedRecipesContext.Provider>
  );
}

export function useSavedRecipes() {
  const ctx = useContext(SavedRecipesContext);
  if (!ctx) {
    throw new Error("useSavedRecipes must be used within SavedRecipesProvider");
  }
  return ctx;
}
