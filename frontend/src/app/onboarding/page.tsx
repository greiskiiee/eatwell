"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/UserContext";
import { getStoredToken } from "@/lib/auth";
import { usersApi } from "@/lib/users";
import { dedupeIngredientNames } from "@/lib/ingredientGroups";
import { IngredientAllergenPicker } from "@/components/IngredientAllergenPicker";

export default function OnboardingPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    try {
      const allergens = dedupeIngredientNames(selected);
      const updated = await usersApi.updateAllergens(allergens);
      const token = getStoredToken();
      if (token) setAuth(token, updated);
      router.replace("/home");
    } catch (err) {
      console.error("Failed to save allergens:", err);
      router.replace("/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center px-6 py-12 bg-[#EFE8DA]">
      <div className="w-full max-w-lg flex flex-col min-h-[80vh]">
        <div className="mb-6">
          <span className="font-display text-2xl font-semibold text-[#B84230]">
            Eatwell+
          </span>
          <div className="mt-6">
            <h1 className="font-display text-2xl font-semibold text-[#221C16] mb-2">
              Харшлын мэдээлэл
            </h1>
            <p className="text-sm text-[#5C4A3A] leading-relaxed">
              TheMealDB-ийн орцын жагсаалтаас харшилтайгаа сонгоно уу. Жор
              санал болгохдоо эдгээр орцыг анхааруулна.
            </p>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-[#9C8878] uppercase tracking-widest mb-3">
            Харшлын орцоо сонгоно уу
          </p>
          <IngredientAllergenPicker
            selected={selected}
            onChange={setSelected}
            maxHeight="max-h-[min(50vh,420px)]"
          />

          {selected.length > 0 && (
            <div className="mt-4 px-4 py-3 bg-[#FBF0E6] rounded-xl border border-[#B85E1A]/20">
              <p className="text-xs text-[#B85E1A] font-medium">
                {selected.length} харшлын орц сонгогдлоо. Эдгээр орцыг агуулсан
                жорт анхааруулга харуулна.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={finish}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#B84230] text-white font-semibold text-sm
                     hover:bg-[#9C3426] transition-colors disabled:opacity-60"
          >
            {loading ? "Хадгалж байна..." : "Үргэлжлүүлэх"}
          </button>
          <button
            type="button"
            onClick={() => router.replace("/home")}
            className="w-full py-3 text-sm text-[#9C8878] hover:text-[#5C4A3A] transition-colors"
          >
            Дараа оруулна
          </button>
        </div>
      </div>
    </div>
  );
}
