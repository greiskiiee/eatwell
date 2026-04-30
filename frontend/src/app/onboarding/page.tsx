"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALLERGENS } from "@/lib/constants";
import AllergenPill from "@/components/Allergenpill";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function finish() {
    setLoading(true);
    try {
      const token = localStorage.getItem("chimge_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/allergens`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ allergens: selected }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      router.replace("/home");
    } catch (err) {
      console.error("Failed to save allergens:", err);
      router.replace("/home"); // still continue, allergens aren't critical
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center px-6 py-12">
      <div className="w-[60%] min-h-screen flex flex-col px-6 py-12">
        {/* Header */}
        <div className="mb-8 ">
          <span className="font-display text-2xl font-semibold text-chimge-primary">
            Eatwell+
          </span>
          <div className="mt-6">
            <h1 className="font-display text-2xl font-semibold text-chimge-ink mb-2">
              Харшлын мэдээлэл
            </h1>
            <p className="text-sm text-chimge-ink-2 leading-relaxed">
              Таны харшилтай орцуудыг тэмдэглэснээр бид жор санал болгохдоо
              анхааруулга үзүүлнэ. Хэзээ ч өөрчлөх боломжтой.
            </p>
          </div>
        </div>

        {/* Allergen grid */}
        <div className="flex-1">
          <p className="text-xs font-semibold text-chimge-ink-3 uppercase tracking-widest mb-4">
            Харшлын орцоо сонгоно уу
          </p>
          <div className="flex flex-wrap gap-2.5">
            {ALLERGENS.map((a) => (
              <AllergenPill
                key={a.id}
                allergenId={a.id}
                variant={selected.includes(a.id) ? "selected" : "unselected"}
                onClick={() => toggle(a.id)}
              />
            ))}
          </div>

          {selected.length > 0 && (
            <div className="mt-6 px-4 py-3 bg-chimge-warn-soft rounded-xl border border-chimge-warn/20">
              <p className="text-xs text-chimge-warn font-medium">
                ⚠ {selected.length} харшлын орц сонгогдлоо. Эдгээрийг агуулах
                жорт анхааруулга харуулна.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={finish}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-chimge-primary text-chimge-white font-semibold text-sm
                     hover:bg-chimge-primary-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Хадгалж байна..." : "Үргэлжлүүлэх"}
          </button>
          <button
            onClick={() => router.replace("/home")}
            className="w-full py-3 text-sm text-chimge-ink-3 hover:text-chimge-ink-2 transition-colors"
          >
            Дараа оруулна
          </button>
        </div>
      </div>
    </div>
  );
}
