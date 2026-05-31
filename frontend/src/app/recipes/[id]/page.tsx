/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMealById, extractIngredients, MealDBRecipe } from "@/lib/mealdb";
import {
  recipeApi,
  recipeCoverImage,
  type TechnologistRecipe,
} from "@/lib/recipes";
import { isMongoObjectId } from "@/lib/recipeId";
import { commentsApi, type RecipeComment } from "@/lib/comments";
import { useUser } from "@/context/UserContext";
import { useSavedRecipes } from "@/context/SavedRecipesContext";
import { UserAvatar } from "@/components/UserAvatar";
import { AllergenAlertBanner } from "@/components/AllergenAlertBanner";
import { getMatchingAllergens, lineContainsAllergen } from "@/lib/allergens";
import { useIngredientLabels } from "@/hooks/useIngredientLabels";
import { translateToMongolian } from "@/lib/translate";
import {
  Bookmark,
  ChevronLeft,
  PlayCircle,
  Clock,
  Globe,
  Tag,
  Send,
  Flame,
  Users,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { PurchaseRecipeModal } from "@/components/PurchaseRecipeModal";

type RecipeTranslation = {
  title: string;
  ingredients: string[];
  instructions: string[];
};

const TRANSLATION_CACHE_PREFIX = "recipe_mn_";

// ── Helpers ───────────────────────────────────────────────────────────────
function parseInstructions(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\d+\.?$/.test(s)); // drop bare "1", "2." etc.
}

type NutritionDisplay = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sourceNote: string;
};

type RecipeDisplay = {
  title: string;
  coverImage: string;
  metaPrimary: string;
  metaSecondary?: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
  nutrition: NutritionDisplay;
  youtubeUrl?: string;
  stats: { label: string; icon: typeof Clock }[];
};

function estimateNutrition(ingredientCount: number): NutritionDisplay {
  const base = ingredientCount * 18;
  const calories = base * 6;
  return {
    calories,
    protein: Math.round(base * 0.18),
    carbs: Math.round(base * 0.52),
    fat: Math.round(base * 0.22),
    fiber: Math.round(base * 0.08),
    sodium: Math.round(base * 4.2),
    sourceNote: "* Орцын тооноос тооцоолсон тул зөрүү гарч болно. ",
  };
}

function youtubeIdFromUrl(url?: string) {
  if (!url) return undefined;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1];
}

function nutritionFromSystem(
  n: TechnologistRecipe["nutrition"],
  ingredientCount: number,
): NutritionDisplay {
  if (n?.calories) {
    const calories = Math.round(n.calories);
    const protein = Math.round(n.proteinG ?? 0);
    const carbs = Math.round(n.carbsG ?? 0);
    const fat = Math.round(n.fatG ?? 0);
    return {
      calories,
      protein,
      carbs,
      fat,
      fiber: 0,
      sodium: 0,
      sourceNote: "* Technologist-ийн USDA орцоос тооцоолсон утга.",
    };
  }
  return estimateNutrition(ingredientCount);
}

function displayFromMeal(meal: MealDBRecipe): RecipeDisplay {
  const ingredients = extractIngredients(meal);
  return {
    title: meal.strMeal,
    coverImage: meal.strMealThumb,
    metaPrimary: meal.strCategory,
    metaSecondary: meal.strArea,
    tags:
      meal.strTags
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [],
    ingredients,
    steps: parseInstructions(meal.strInstructions),
    nutrition: estimateNutrition(ingredients.length),
    youtubeUrl: meal.strYoutube ?? undefined,
    stats: [
      { icon: Globe, label: meal.strArea },
      { icon: Tag, label: meal.strCategory },
      { icon: Clock, label: `${ingredients.length} орц` },
    ],
  };
}

function displayFromSystem(recipe: TechnologistRecipe): RecipeDisplay {
  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];
  const stats: RecipeDisplay["stats"] = [];
  if (recipe.prepTimeMinutes != null) {
    stats.push({ icon: Clock, label: `${recipe.prepTimeMinutes} мин бэлтгэх` });
  }
  if (recipe.cookTimeMinutes != null) {
    stats.push({ icon: Flame, label: `${recipe.cookTimeMinutes} мин хийх` });
  }
  if (recipe.servings != null) {
    stats.push({ icon: Users, label: `${recipe.servings} хүн` });
  }
  if (stats.length === 0) {
    stats.push({ icon: Tag, label: `${ingredients.length} төрлийн орц` });
  }

  return {
    title: recipe.title,
    coverImage: recipeCoverImage(recipe),
    metaPrimary: "Eatwell+",
    metaSecondary: recipe.tags?.[0],
    tags: recipe.tags ?? [],
    ingredients,
    steps,
    nutrition: nutritionFromSystem(recipe.nutrition, ingredients.length),
    youtubeUrl: recipe.videoUrl,
    stats,
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function RecipeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[380px] bg-[#D6C9B4]/40 rounded-b-3xl mb-8" />
      <div className="max-w-3xl mx-auto space-y-4 px-4">
        <div className="h-5 bg-[#D6C9B4]/40 rounded-full w-1/4" />
        <div className="h-9 bg-[#D6C9B4]/40 rounded-full w-3/4" />
        <div className="grid grid-cols-2 gap-3 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#D6C9B4]/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatCommentDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();

  const [meal, setMeal] = useState<MealDBRecipe | null>(null);
  const [systemRecipe, setSystemRecipe] = useState<TechnologistRecipe | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedRecipes();
  const [activeTab, setActiveTab] = useState<
    "ingredients" | "instructions" | "nutrition"
  >("ingredients");

  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [translation, setTranslation] = useState<RecipeTranslation | null>(
    null,
  );
  const [translating, setTranslating] = useState(false);

  const ingredientLines = useMemo(() => {
    if (meal) return extractIngredients(meal);
    if (systemRecipe) return systemRecipe.ingredients ?? [];
    return [];
  }, [meal, systemRecipe]);

  const userAllergens = user?.allergens ?? [];
  const matchedAllergens = useMemo(
    () => getMatchingAllergens(ingredientLines, userAllergens),
    [ingredientLines, userAllergens],
  );
  const { labelFor } = useIngredientLabels(matchedAllergens);

  useEffect(() => {
    if (!meal) {
      setTranslation(null);
      setTranslating(false);
      return;
    }

    const cacheKey = TRANSLATION_CACHE_PREFIX + meal.idMeal;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setTranslation(JSON.parse(cached) as RecipeTranslation);
        return;
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    let cancelled = false;
    setTranslating(true);

    const ingredients = extractIngredients(meal);
    const steps = parseInstructions(meal.strInstructions);

    Promise.all([
      translateToMongolian(meal.strMeal),
      Promise.all(ingredients.map((ing) => translateToMongolian(ing))),
      Promise.all(steps.map((step) => translateToMongolian(step))),
    ])
      .then(([title, translatedIngredients, translatedSteps]) => {
        if (cancelled) return;
        const result: RecipeTranslation = {
          title,
          ingredients: translatedIngredients,
          instructions: translatedSteps,
        };
        setTranslation(result);
        localStorage.setItem(cacheKey, JSON.stringify(result));
      })
      .catch(() => {
        // silently fail — UI shows original English
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [meal?.idMeal]);

  useEffect(() => {
    setLoading(true);
    setMeal(null);
    setSystemRecipe(null);

    if (isMongoObjectId(id)) {
      recipeApi
        .get(id)
        .then((r) => setSystemRecipe(r))
        .catch(() => setSystemRecipe(null))
        .finally(() => setLoading(false));
      return;
    }

    getMealById(id).then((m) => {
      setMeal(m);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setCommentsLoading(true);
    commentsApi
      .list(id)
      .then((list) => {
        if (!cancelled) setComments(list);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function submitComment() {
    const text = commentText.trim();
    if (!text || commentSubmitting) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setCommentSubmitting(true);
    setCommentError("");
    try {
      const created = await commentsApi.create(id, text);
      setComments((prev) => [created, ...prev]);
      setCommentText("");
    } catch {
      setCommentError("Сэтгэгдэл илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE8DA] p-6 md:p-10">
        <RecipeSkeleton />
      </div>
    );
  }

  if (!meal && !systemRecipe) {
    return (
      <div className="min-h-screen bg-[#EFE8DA] flex flex-col items-center justify-center gap-4">
        <p className="text-[#5C4A3A] text-lg font-medium">Жор олдсонгүй</p>
        <Link
          href="/home"
          className="text-[#B84230] text-sm font-semibold hover:underline"
        >
          ← Нүүр хуудас руу буцах
        </Link>
      </div>
    );
  }

  const display = meal
    ? displayFromMeal(meal)
    : displayFromSystem(systemRecipe!);
  const { ingredients, steps, nutrition } = display;
  const title = translation?.title ?? display.title;
  const shownIngredients = translation?.ingredients ?? ingredients;
  const shownSteps = translation?.instructions ?? steps;
  const youtubeId = youtubeIdFromUrl(display.youtubeUrl);
  const isLocked = Boolean(systemRecipe?.locked);
  const premiumPrice = systemRecipe?.price ?? 0;

  function openPurchase() {
    if (!user) {
      router.push("/login");
      return;
    }
    setPurchaseOpen(true);
  }

  async function handleUnlocked() {
    if (!isMongoObjectId(id)) return;
    const r = await recipeApi.get(id);
    setSystemRecipe(r);
  }

  return (
    <div className="min-h-screen bg-[#EFE8DA]">
      {/* ── Hero ── */}
      <div className="relative h-[280px] sm:h-[340px] md:h-[440px] overflow-hidden bg-[#D6C9B4]">
        {display.coverImage ? (
          <Image
            src={display.coverImage}
            alt={title}
            className="w-full h-full object-cover"
            width={1200}
            height={440}
            priority
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,14,8,0.92) 0%, rgba(20,14,8,0.4) 50%, rgba(20,14,8,0.15) 100%)",
          }}
        />
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10 flex items-center gap-1.5 bg-white/15 hover:bg-white/25
                     backdrop-blur-sm text-white text-[12px] sm:text-[13px] font-medium px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full
                     transition-colors border border-white/20"
        >
          <ChevronLeft size={15} />
          Буцах
        </button>
        <button
          type="button"
          onClick={() => toggleSave(id)}
          aria-label={isSaved(id) ? "Хадгалснаас хасах" : "Жор хадгалах"}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/25
                     backdrop-blur-sm flex items-center justify-center border border-white/20 transition-colors"
        >
          <Bookmark
            size={17}
            className={
              isSaved(id) ? "fill-[#B84230] text-[#B84230]" : "text-white"
            }
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-5 md:px-10 pb-5 sm:pb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              {display.metaPrimary}
            </span>
            {display.metaSecondary && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  {display.metaSecondary}
                </span>
              </>
            )}
          </div>
          <h1 className="font-display text-[1.5rem] sm:text-[2rem] md:text-[2.4rem] font-semibold text-[#FFFDF8] leading-tight max-w-2xl">
            {title}
          </h1>
          {translating && meal && (
            <p className="text-[11px] text-white/50 mt-1.5">Орчуулж байна…</p>
          )}
          {display.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {display.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold text-white/70 bg-white/10 border border-white/15
                             px-2.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <AllergenAlertBanner matched={matchedAllergens} labelFor={labelFor} />

        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          {display.stats.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white border border-[#D6C9B4]/60 rounded-xl
                         px-3.5 py-2 text-[12.5px] font-medium text-[#5C4A3A]
                         shadow-[0_1px_6px_rgba(34,28,22,0.06)]"
            >
              <Icon size={13} className="text-[#B84230]" />
              {label}
            </div>
          ))}
        </div>

        {isLocked && (
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl
                       bg-[#FBF0E6] border border-[#B84230]/30"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Lock size={18} className="text-[#B84230] shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-[#221C16]">
                  Premium жор
                </p>
                <p className="text-[12px] text-[#9C8878]">
                  Орц, заавар, видеог харахын тулд худалдан авна уу
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openPurchase}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                         bg-[#B84230] text-white text-[13px] font-semibold shrink-0"
            >
              <ShoppingBag size={15} />
              Жор худалдан авах — {premiumPrice.toLocaleString()}₮
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div
          className="flex flex-wrap sm:flex-nowrap bg-white border border-[#D6C9B4]/60 rounded-2xl p-1
                        shadow-[0_2px_12px_rgba(34,28,22,0.06)] w-full sm:w-fit"
        >
          {(["ingredients", "instructions", "nutrition"] as const).map(
            (tab) => {
              const labels = {
                ingredients: "Орцууд",
                instructions: "Заавар",
                nutrition: "Тэжээл",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-colors text-center",
                    activeTab === tab
                      ? "bg-[#B84230] text-white shadow-sm"
                      : "text-[#9C8878] hover:text-[#5C4A3A]",
                  ].join(" ")}
                >
                  {labels[tab]}
                </button>
              );
            },
          )}
        </div>

        {isLocked ? (
          <div
            className="relative rounded-2xl overflow-hidden border border-[#D6C9B4]/60
                       bg-white shadow-[0_2px_12px_rgba(34,28,22,0.06)] min-h-[220px]"
          >
            <div className="blur-md p-6 space-y-3 pointer-events-none select-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 bg-[#EFE8DA] rounded-lg opacity-80"
                />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/75 px-4">
              <Lock size={32} className="text-[#B84230]" />
              <p className="text-[13px] font-semibold text-[#221C16] text-center">
                Premium агуулга түгжигдсэн
              </p>
              <button
                type="button"
                onClick={openPurchase}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B84230] text-white text-[13px] font-semibold"
              >
                <ShoppingBag size={15} />
                Жор худалдан авах
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Ingredients tab ── */}
            {activeTab === "ingredients" && (
              <div
                className="bg-white border border-[#D6C9B4]/60 rounded-2xl overflow-hidden
                          shadow-[0_2px_12px_rgba(34,28,22,0.06)]"
              >
                {shownIngredients.map((ing, i) => {
                  const isAllergen = userAllergens.some((a) =>
                    lineContainsAllergen(ingredients[i] ?? ing, a),
                  );
                  return (
                    <div
                      key={i}
                      className={[
                        "flex items-center gap-3 px-5 py-3.5 text-[13.5px]",
                        i !== shownIngredients.length - 1
                          ? "border-b border-[#EFE8DA]"
                          : "",
                        isAllergen ? "bg-[#FEF2F2]" : "",
                      ].join(" ")}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isAllergen
                            ? "bg-[#DC2626] text-white"
                            : "bg-[#F5E6E2] text-[#B84230]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`font-medium ${
                          isAllergen ? "text-[#991B1B]" : "text-[#221C16]"
                        }`}
                      >
                        {ing}
                        {isAllergen && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-[#DC2626]">
                            харшил
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Instructions tab ── */}
            {activeTab === "instructions" && (
              <div
                className="bg-white border border-[#D6C9B4]/60 rounded-2xl p-6
                          shadow-[0_2px_12px_rgba(34,28,22,0.06)] space-y-5"
              >
                {shownSteps.map((step, i) => (
                  <div key={i} className="flex gap-3.5">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full bg-[#F5E6E2] text-[#B84230] text-[10px]
                               font-bold flex items-center justify-center shrink-0"
                    >
                      {i + 1}
                    </span>
                    <p className="text-[13.5px] text-[#5C4A3A] leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Nutrition tab ── */}
            {activeTab === "nutrition" && (
              <div
                className="bg-white border border-[#D6C9B4]/60 rounded-2xl overflow-hidden
                          shadow-[0_2px_12px_rgba(34,28,22,0.06)]"
              >
                <div className="px-5 py-4 border-b border-[#EFE8DA] flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[#221C16]">
                    Нэг порцны тэжээллэг чанар
                  </p>
                  <span className="text-[11px] text-[#9C8878] bg-[#EFE8DA] px-2.5 py-1 rounded-full">
                    {systemRecipe ? "Тооцоолсон" : "Тооцоолсон утга"}
                  </span>
                </div>

                {/* Calorie highlight */}
                <div className="flex items-center gap-4 px-5 py-5 border-b border-[#EFE8DA] bg-[#FBF0E6]/50">
                  <div
                    className="w-14 h-14 rounded-full bg-[#F5E6E2] border-2 border-[#B84230]/20
                              flex flex-col items-center justify-center shrink-0"
                  >
                    <span className="text-[18px] font-bold text-[#B84230] leading-none">
                      {nutrition.calories}
                    </span>
                    <span className="text-[9px] font-semibold text-[#B84230]/60 uppercase tracking-wide">
                      ккал
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#221C16]">
                      Нийт калори
                    </p>
                    <p className="text-[12px] text-[#9C8878] mt-0.5">
                      Дундаж хоолны 2000 ккал-ын{" "}
                      {Math.round((nutrition.calories / 2000) * 100)}%
                    </p>
                    <div className="mt-2 h-1.5 w-48 bg-[#EFE8DA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B84230] rounded-full"
                        style={{
                          width: `${Math.min((nutrition.calories / 2000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Macro rows */}
                {[
                  {
                    label: "Уураг",
                    value: nutrition.protein,
                    unit: "г",
                    color: "#4A90B8",
                    pct: Math.round(
                      ((nutrition.protein * 4) / nutrition.calories) * 100,
                    ),
                  },
                  {
                    label: "Нүүрс ус",
                    value: nutrition.carbs,
                    unit: "г",
                    color: "#B8884A",
                    pct: Math.round(
                      ((nutrition.carbs * 4) / nutrition.calories) * 100,
                    ),
                  },
                  {
                    label: "Өөх тос",
                    value: nutrition.fat,
                    unit: "г",
                    color: "#B84A4A",
                    pct: Math.round(
                      ((nutrition.fat * 9) / nutrition.calories) * 100,
                    ),
                  },
                  {
                    label: "Эслэг",
                    value: nutrition.fiber,
                    unit: "г",
                    color: "#4AB87A",
                    pct: null,
                  },
                  {
                    label: "Натри",
                    value: nutrition.sodium,
                    unit: "мг",
                    color: "#9C8878",
                    pct: null,
                  },
                ].map(({ label, value, unit, color, pct }, i, arr) => (
                  <div
                    key={label}
                    className={[
                      "flex items-center gap-3 px-5 py-3.5",
                      i !== arr.length - 1 ? "border-b border-[#EFE8DA]" : "",
                    ].join(" ")}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[13.5px] text-[#221C16] font-medium flex-1">
                      {label}
                    </span>
                    {pct !== null && (
                      <div className="flex-1 max-w-[120px] h-1.5 bg-[#EFE8DA] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    )}
                    <span className="text-[13px] font-semibold text-[#5C4A3A] tabular-nums">
                      {value}
                      <span className="text-[11px] font-normal text-[#9C8878] ml-0.5">
                        {unit}
                      </span>
                    </span>
                  </div>
                ))}

                <p className="px-5 py-3 text-[11px] text-[#9C8878] bg-[#EFE8DA]/40 border-t border-[#EFE8DA]">
                  {nutrition.sourceNote}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── YouTube ── */}
        {youtubeId && !isLocked && (
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#9C8878] uppercase tracking-widest">
              Видео заавар
            </h3>
            <a
              href={display.youtubeUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-2xl border border-[#D6C9B4]/60
                         shadow-[0_2px_12px_rgba(34,28,22,0.06)]"
            >
              <Image
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt="YouTube thumbnail"
                width={640}
                height={360}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                className="absolute inset-0 bg-black/30 flex items-center justify-center
                              group-hover:bg-black/40 transition-colors"
              >
                <PlayCircle size={52} className="text-white drop-shadow-lg" />
              </div>
            </a>
          </div>
        )}

        {/* ── Comments ── */}
        <div className="space-y-4">
          <h3 className="text-[13px] font-bold text-[#9C8878] uppercase tracking-widest">
            Сэтгэгдэл ({comments.length})
          </h3>

          <div className="space-y-3">
            {commentsLoading ? (
              <p className="text-[13px] text-[#9C8878] py-4 text-center">
                Сэтгэгдэл ачаалж байна...
              </p>
            ) : comments.length === 0 ? (
              <p className="text-[13px] text-[#9C8878] py-4 text-center">
                Одоогоор сэтгэгдэл байхгүй. Эхнийх нь болоорой!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c._id}
                  className="bg-white border border-[#D6C9B4]/60 rounded-2xl px-5 py-4
                           shadow-[0_1px_6px_rgba(34,28,22,0.05)]"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <UserAvatar
                      name={c.author.name}
                      avatarUrl={c.author.avatarUrl}
                      size={28}
                    />
                    <span className="text-[13px] font-semibold text-[#221C16]">
                      {c.author.name}
                    </span>
                    <span className="ml-auto text-[11px] text-[#9C8878] shrink-0">
                      {formatCommentDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5C4A3A] leading-relaxed whitespace-pre-wrap">
                    {c.body}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write a comment */}
          <div
            className="bg-white border border-[#D6C9B4]/60 rounded-2xl p-4
                          shadow-[0_2px_12px_rgba(34,28,22,0.06)]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <UserAvatar
                name={user?.name}
                avatarUrl={user?.avatarUrl}
                size={28}
              />
              <span className="text-[13px] font-semibold text-[#221C16]">
                {user?.name ?? "Зочин"}
              </span>
              {!user && (
                <Link
                  href="/login"
                  className="ml-auto text-[12px] font-medium text-[#B84230] hover:underline"
                >
                  Нэвтрэх
                </Link>
              )}
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  submitComment();
              }}
              placeholder={
                user
                  ? "Сэтгэгдэл бичих..."
                  : "Сэтгэгдэл бичихийн тулд нэвтэрнэ үү..."
              }
              rows={3}
              disabled={!user || commentSubmitting}
              className="w-full resize-none bg-[#EFE8DA]/60 border border-[#D6C9B4]/60 rounded-xl
                         px-4 py-3 text-[13.5px] text-[#221C16] placeholder-[#9C8878] outline-none
                         focus:border-[#B84230]/40 focus:ring-2 focus:ring-[#B84230]/10 transition
                         disabled:opacity-60"
            />
            {commentError && (
              <p className="mt-2 text-[12px] text-[#B84230]">{commentError}</p>
            )}
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-[11px] text-[#9C8878]">
                {user ? "⌘ + Enter илгээх" : "Зочин харах боломжтой"}
              </span>
              <button
                type="button"
                onClick={() => void submitComment()}
                disabled={!user || !commentText.trim() || commentSubmitting}
                className="flex items-center gap-1.5 bg-[#B84230] hover:bg-[#A33828] disabled:opacity-40
                           disabled:cursor-not-allowed text-white text-[12.5px] font-semibold
                           px-4 py-2 rounded-xl transition-colors"
              >
                <Send size={13} />
                {commentSubmitting ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {systemRecipe && isLocked && (
        <PurchaseRecipeModal
          open={purchaseOpen}
          onClose={() => setPurchaseOpen(false)}
          recipeId={systemRecipe._id}
          recipeTitle={systemRecipe.title}
          price={premiumPrice}
          onUnlocked={() => void handleUnlocked()}
        />
      )}
    </div>
  );
}
