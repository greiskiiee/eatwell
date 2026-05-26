"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, Send } from "lucide-react";
import { recipeApi } from "@/lib/recipes";
import { ImageFileUpload } from "@/components/ImageFileUpload";
import { uploadApi } from "@/lib/upload";
import { validateRecipeTextForm } from "@/lib/recipeForm";

const inputCls = `w-full px-3.5 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
  border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none transition-colors`;

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState<number | "">(4);
  const [prepTime, setPrepTime] = useState<number | "">(15);
  const [cookTime, setCookTime] = useState<number | "">(30);
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState<number | "">(0);

  useEffect(() => {
    recipeApi
      .get(id)
      .then((r) => {
        setTitle(r.title);
        setDescription(r.description ?? "");
        setServings(r.servings ?? "");
        setPrepTime(r.prepTimeMinutes ?? "");
        setCookTime(r.cookTimeMinutes ?? "");
        setTags((r.tags ?? []).join(", "));
        setIngredients((r.ingredients ?? []).join("\n"));
        setSteps((r.steps ?? []).join("\n"));
        setImageUrl(r.imageUrl ?? "");
        setIsPremium(r.isPremium ?? false);
        setPrice(r.price ?? 0);
      })
      .catch(() => setError("Жор олдсонгүй"))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(isDraft: boolean) {
    const validationError = validateRecipeTextForm(
      { title, ingredientsText: ingredients, stepsText: steps },
      isDraft,
    );

    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(isDraft ? "draft" : "publish");
    try {
      await recipeApi.update(id, {
        title: title.trim(),
        description,
        servings: servings || undefined,
        prepTimeMinutes: prepTime || undefined,
        cookTimeMinutes: cookTime || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: ingredients
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        steps: steps
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        isDraft,
        isPremium,
        price: isPremium ? price : 0,
        imageUrl: imageUrl.trim() || "",
      });
      router.replace("/home");
    } catch {
      setError("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE8DA] flex items-center justify-center text-[#9C8878]">
        Ачаалж байна...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE8DA]">
      <header className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md border-b border-[#D6C9B4]/70 px-4 md:px-8 py-3 flex items-center gap-4">
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9C8878] hover:text-[#5C4A3A]"
        >
          <ChevronLeft size={16} /> Буцах
        </Link>
        <h1 className="font-display text-[17px] font-semibold text-[#221C16]">
          Жор засварлах
        </h1>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={!!saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D6C9B4] bg-white text-sm font-semibold disabled:opacity-50"
          >
            <Save size={14} />
            {saving === "draft" ? "..." : "Драфт"}
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!!saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A4A] text-white text-sm font-semibold disabled:opacity-50"
          >
            <Send size={14} />
            {saving === "publish" ? "..." : "Хадгалах"}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {error && (
          <div
            className="px-4 py-3 rounded-xl bg-[#FBF0E6] border border-[#B84230]/20
                          text-[#B84230] text-[13px] font-medium"
          >
            ⚠ {error}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-[#D6C9B4]/70 p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#9C8878] uppercase">Гарчиг *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls + " mt-1"}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9C8878] uppercase">Тайлбар</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputCls + " mt-1 resize-none"}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#9C8878] uppercase">Бэлтгэх (мин)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) =>
                  setPrepTime(e.target.value === "" ? "" : +e.target.value)
                }
                className={inputCls + " mt-1"}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9C8878] uppercase">Хийх (мин)</label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) =>
                  setCookTime(e.target.value === "" ? "" : +e.target.value)
                }
                className={inputCls + " mt-1"}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9C8878] uppercase">Порц</label>
              <input
                type="number"
                value={servings}
                onChange={(e) =>
                  setServings(e.target.value === "" ? "" : +e.target.value)
                }
                className={inputCls + " mt-1"}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#9C8878] uppercase">
              Орц (мөр бүрт нэг)
            </label>
            <textarea
              aria-label="Орцууд"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={5}
              className={inputCls + " mt-1 resize-none font-mono text-xs"}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9C8878] uppercase">
              Алхам (мөр бүрт нэг)
            </label>
            <textarea
              aria-label="Алхам"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={5}
              className={inputCls + " mt-1 resize-none"}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9C8878] uppercase">
              Шошго (таслалаар)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputCls + " mt-1"}
            />
          </div>
          <div className="mt-2">
            <ImageFileUpload
              value={imageUrl}
              onChange={setImageUrl}
              onUpload={async (file) => {
                const { url } = await uploadApi.recipeImage(file);
                return url;
              }}
              label="Жорын зураг"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            Премиум жор
          </label>
          {isPremium && (
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : +e.target.value)}
              className={inputCls + " max-w-[160px]"}
              placeholder="Үнэ ₮"
            />
          )}
        </div>
      </div>
    </div>
  );
}
