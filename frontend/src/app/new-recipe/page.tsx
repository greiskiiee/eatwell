"use client";
import { ImageIcon, Upload, Video } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Clock,
  Users,
  Flame,
  Tag,
  ListOrdered,
  ShoppingBasket,
  FileText,
  Sparkles,
  Save,
  Send,
} from "lucide-react";
import {
  IngredientEntry,
  IngredientPicker,
} from "@/components/IngredientPicker";
import { calcNutrition } from "@/lib/usda";
import Image from "next/image";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-[0.7px]">
        {label}
        {required && <span className="text-[#B84230] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full px-3.5 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
  border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none
  transition-colors placeholder-[#B8A898]`;

// ── dynamic list for steps / tags (strings only) ──────────────────────────
function DynamicList({
  items,
  onChange,
  placeholder,
  numbered = false,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  numbered?: boolean;
}) {
  function update(i: number, val: string) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {numbered && (
            <span className="text-[12px] font-bold text-[#D6C9B4] w-5 shrink-0 text-right">
              {i + 1}
            </span>
          )}
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className={inputCls + " flex-1"}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-[#D6C9B4] hover:text-[#B84230] transition-colors p-1 shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-[#B84230]
                   hover:text-[#9C3426] transition-colors mt-1"
      >
        <Plus size={14} /> Нэмэх
      </button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#D6C9B4]/70 p-5 shadow-[0_2px_12px_rgba(34,28,22,0.05)] space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFE8DA]">
        <Icon size={15} className="text-[#B84230]" />
        <h2 className="text-[13px] font-bold text-[#5C4A3A] uppercase tracking-[0.5px]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function NewRecipePage() {
  const router = useRouter();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState<number | "">(4);
  const [prepTime, setPrepTime] = useState<number | "">(15);
  const [cookTime, setCookTime] = useState<number | "">(30);
  const [tags, setTags] = useState<string[]>([""]);
  // ✅ IngredientEntry[] — used only with IngredientPicker
  const [ingredients, setIngredients] = useState<IngredientEntry[]>([]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState<number | "">(0);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // ✅ Auto-calculated — no manual nutrition state
  const nutrition = calcNutrition(ingredients);

  async function submit(isDraft: boolean) {
    if (!title.trim()) {
      setError("Гарчиг оруулна уу");
      return;
    }
    setError("");
    setSaving(isDraft ? "draft" : "publish");

    try {
      const token = localStorage.getItem("chimge_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/recipes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description,
            servings: servings || undefined,
            prepTimeMinutes: prepTime || undefined,
            cookTimeMinutes: cookTime || undefined,
            tags: tags.filter(Boolean),
            steps: steps.filter(Boolean),
            isDraft,
            isPremium,
            price: isPremium ? price : 0,

            ingredients: ingredients.map(
              (e) => `${e.grams}г ${e.food.description}`,
            ),
            nutrition: {
              calories: Math.round(nutrition.calories),
              proteinG: +nutrition.proteinG.toFixed(1),
              carbsG: +nutrition.carbsG.toFixed(1),
              fatG: +nutrition.fatG.toFixed(1),
            },
            imageUrl: imageUrl.trim() || undefined,
            videoUrl: videoUrl.trim() || undefined,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Алдаа гарлаа");
      }

      router.replace("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#EFE8DA]">
      <header
        className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md
                   border-b border-[#D6C9B4]/70 px-4 md:px-8 py-3
                   flex items-center gap-4"
      >
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9C8878]
                     hover:text-[#5C4A3A] transition-colors"
        >
          <ChevronLeft size={16} /> Буцах
        </Link>
        <h1 className="font-display text-[17px] font-semibold text-[#221C16]">
          Шинэ жор
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={!!saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D6C9B4]
                       bg-white text-[#5C4A3A] text-[13px] font-semibold
                       hover:border-[#9C8878] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving === "draft" ? "Хадгалж байна..." : "Драфт"}
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!!saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B84230] text-white
                       text-[13px] font-semibold hover:bg-[#9C3426] transition-colors
                       disabled:opacity-50 shadow-sm"
          >
            <Send size={14} />
            {saving === "publish" ? "Нийтлэж байна..." : "Нийтлэх"}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded-xl bg-[#FBF0E6] border border-[#B84230]/20
                          text-[#B84230] text-[13px] font-medium"
          >
            ⚠ {error}
          </div>
        )}

        {/* Basic info */}
        <Section icon={FileText} title="Үндсэн мэдээлэл">
          <Field label="Гарчиг" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жорын нэрийг оруулна уу"
              className={inputCls}
            />
          </Field>
          <Field label="Тайлбар">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Жорын товч тайлбар..."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Бэлтгэх (мин)">
              <div className="relative">
                <Clock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
                />
                <input
                  type="number"
                  min={0}
                  value={prepTime}
                  onChange={(e) =>
                    setPrepTime(e.target.value === "" ? "" : +e.target.value)
                  }
                  className={inputCls + " pl-8"}
                />
              </div>
            </Field>
            <Field label="Хоол хийх (мин)">
              <div className="relative">
                <Flame
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
                />
                <input
                  type="number"
                  min={0}
                  value={cookTime}
                  onChange={(e) =>
                    setCookTime(e.target.value === "" ? "" : +e.target.value)
                  }
                  className={inputCls + " pl-8"}
                />
              </div>
            </Field>
            <Field label="Порц">
              <div className="relative">
                <Users
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
                />
                <input
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) =>
                    setServings(e.target.value === "" ? "" : +e.target.value)
                  }
                  className={inputCls + " pl-8"}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* ✅ Ingredients — IngredientPicker with auto nutrition */}
        <Section icon={ShoppingBasket} title="Орц материал">
          <IngredientPicker value={ingredients} onChange={setIngredients} />
          {ingredients.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { label: "Калори", val: nutrition.calories, unit: "ккал" },
                { label: "Уураг", val: nutrition.proteinG, unit: "г" },
                { label: "Нүүрс ус", val: nutrition.carbsG, unit: "г" },
                { label: "Өөх тос", val: nutrition.fatG, unit: "г" },
              ].map(({ label, val, unit }) => (
                <div
                  key={label}
                  className="text-center px-2 py-2.5 bg-[#EFE8DA] rounded-xl border border-[#D6C9B4]"
                >
                  <p className="text-[18px] font-bold text-[#B84230]">
                    {val.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-[#9C8878] font-semibold uppercase tracking-wide">
                    {label} ({unit})
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Steps */}
        <Section icon={ListOrdered} title="Хоол хийх арга">
          <DynamicList
            items={steps}
            onChange={setSteps}
            placeholder="Алхам бичнэ үү..."
            numbered
          />
        </Section>

        {/* Tags */}
        <Section icon={Tag} title="Шошго">
          <DynamicList
            items={tags}
            onChange={setTags}
            placeholder="жнь: Монгол, Хурдан, Өглөөний цай..."
          />
        </Section>

        {/* Media */}
        <Section icon={ImageIcon} title="Медиа">
          <Field label="Нүүр зургийн URL">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={inputCls}
            />
          </Field>
          {imageUrl && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#D6C9B4]">
              <Image
                src={imageUrl}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed
                          border-[#D6C9B4] bg-[#EFE8DA]/40 cursor-not-allowed opacity-60"
          >
            <Upload size={16} className="text-[#9C8878] shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[#5C4A3A]">
                Зураг оруулах
              </p>
              <p className="text-[11px] text-[#9C8878]">
                Cloudinary тохиргооны дараа идэвхжинэ
              </p>
            </div>
          </div>
          <Field label="Видео URL (YouTube / заавал биш)">
            <div className="relative">
              <Video
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8878]"
              />
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className={inputCls + " pl-8"}
              />
            </div>
          </Field>
        </Section>

        {/* Premium toggle */}
        <Section icon={Sparkles} title="Дэвшилтэт тохиргоо">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold text-[#221C16]">
                Премиум жор
              </p>
              <p className="text-[12px] text-[#9C8878]">
                Зөвхөн төлбөртэй хэрэглэгчдэд харагдана
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPremium((v) => !v)}
              className={[
                "relative w-11 h-6 rounded-full transition-colors",
                isPremium ? "bg-[#B84230]" : "bg-[#D6C9B4]",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  isPremium ? "translate-x-5" : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
          </div>
          {isPremium && (
            <Field label="Үнэ (₮)">
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? "" : +e.target.value)
                }
                placeholder="0"
                className={inputCls + " max-w-[180px]"}
              />
            </Field>
          )}
        </Section>

        {/* Bottom actions */}
        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={!!saving}
            className="flex-1 py-3 rounded-xl border border-[#D6C9B4] bg-white text-[#5C4A3A]
                       text-[13px] font-semibold hover:border-[#9C8878] transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} /> Драфтаар хадгалах
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!!saving}
            className="flex-1 py-3 rounded-xl bg-[#B84230] text-white text-[13px] font-semibold
                       hover:bg-[#9C3426] transition-colors disabled:opacity-50 shadow-sm
                       flex items-center justify-center gap-2"
          >
            <Send size={14} /> Нийтлэх
          </button>
        </div>
      </div>
    </div>
  );
}
