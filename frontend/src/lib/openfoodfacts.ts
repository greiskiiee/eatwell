import type { LocalProduct } from "./products";

export interface OffNutriments {
  "energy-kcal_100g"?: number;
  sugars_100g?: number;
  fat_100g?: number;
  "saturated-fat_100g"?: number;
  salt_100g?: number;
  proteins_100g?: number;
  fiber_100g?: number;
}

export interface OffProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  nutriscore_grade?: string;
  nutriments?: OffNutriments;
  allergens_tags?: string[];
}

export interface OffResponse {
  code?: string;
  status?: number;
  status_verbose?: string;
  product?: OffProduct;
}

const OFF_BASE = "https://world.openfoodfacts.org/api/v2/product";

export async function fetchProduct(code: string): Promise<OffResponse> {
  const clean = code.trim();
  if (!clean) {
    return { status: 0, status_verbose: "empty code" };
  }
  const res = await fetch(`${OFF_BASE}/${encodeURIComponent(clean)}.json`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    return { status: 0, status_verbose: `http ${res.status}` };
  }
  return (await res.json()) as OffResponse;
}

export type HealthLevel = "healthy" | "moderate" | "unhealthy" | "unknown";

export interface HealthVerdict {
  level: HealthLevel;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export function getHealthVerdict(
  grade: string | undefined | null,
): HealthVerdict {
  const g = (grade ?? "").toLowerCase();

  if (g === "a" || g === "b") {
    return {
      level: "healthy",
      label: "Эрүүл",
      badgeClass: "bg-[#E5F1EA] text-[#2D5A4A] border-[#2D5A4A]/30",
      dotClass: "bg-[#2D5A4A]",
      description: "Тэжээллэг чанар сайн — өдөр тутамд тохиромжтой",
    };
  }
  if (g === "c") {
    return {
      level: "moderate",
      label: "Дунд зэрэг",
      badgeClass: "bg-[#FBF0E6] text-[#B85E1A] border-[#B85E1A]/30",
      dotClass: "bg-[#B85E1A]",
      description: "Хэмжээтэй хэрэглэхэд зүгээр",
    };
  }
  if (g === "d" || g === "e") {
    return {
      level: "unhealthy",
      label: "Эрүүл бус",
      badgeClass: "bg-[#F5E0DD] text-[#B84230] border-[#B84230]/30",
      dotClass: "bg-[#B84230]",
      description: "Сахар, давс, өөх тосны агуулга өндөр",
    };
  }
  return {
    level: "unknown",
    label: "Тодорхойгүй",
    badgeClass: "bg-[#EFE8DA] text-[#5C4A3A] border-[#D6C9B4]",
    dotClass: "bg-[#9C8878]",
    description: "Эрүүл мэндийн үнэлгээ тодорхойгүй",
  };
}

export function getProductImage(product: OffProduct): string | null {
  return product.image_front_url || product.image_url || null;
}

export function getProductName(product: OffProduct): string {
  return (
    product.product_name?.trim() ||
    product.product_name_en?.trim() ||
    "Нэргүй бүтээгдэхүүн"
  );
}

export function getProductIngredients(product: OffProduct): string {
  return (
    product.ingredients_text?.trim() ||
    product.ingredients_text_en?.trim() ||
    ""
  );
}

export function localProductToOff(p: LocalProduct): OffProduct {
  return {
    product_name: p.name,
    brands: p.brand,
    image_front_url: p.imageUrl || undefined,
    image_url: p.imageUrl || undefined,
    ingredients_text: p.ingredientsText,
    nutriscore_grade: p.nutriscoreGrade || undefined,
    nutriments: {
      "energy-kcal_100g": p.nutriments?.energyKcal100g,
      sugars_100g: p.nutriments?.sugars100g,
      fat_100g: p.nutriments?.fat100g,
      "saturated-fat_100g": p.nutriments?.saturatedFat100g,
      salt_100g: p.nutriments?.salt100g,
      proteins_100g: p.nutriments?.proteins100g,
      fiber_100g: p.nutriments?.fiber100g,
    },
    allergens_tags: p.allergens,
  };
}
