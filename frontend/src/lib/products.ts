import { apiFetch, type ApiError } from "./api";

export interface ProductNutriments {
  energyKcal100g?: number;
  sugars100g?: number;
  fat100g?: number;
  saturatedFat100g?: number;
  salt100g?: number;
  proteins100g?: number;
  fiber100g?: number;
}

export interface LocalProduct {
  _id: string;
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  ingredientsText: string;
  nutriscoreGrade: string;
  nutriments: ProductNutriments;
  allergens: string[];
  source: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalProductInput {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  ingredientsText?: string;
  nutriscoreGrade?: string;
  nutriments?: ProductNutriments;
  allergens?: string[];
}

export const productApi = {
  async getByBarcode(barcode: string): Promise<LocalProduct | null> {
    try {
      return await apiFetch<LocalProduct>(
        `/api/products/${encodeURIComponent(barcode)}`,
      );
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 404) return null;
      throw err;
    }
  },

  create(input: LocalProductInput): Promise<LocalProduct> {
    return apiFetch<LocalProduct>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
