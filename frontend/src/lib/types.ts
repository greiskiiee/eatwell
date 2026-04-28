// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = "reader" | "technologist" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  allergens: string[];
  savedRecipes: string[];
  createdAt: string;
}

// ─── Recipe ───────────────────────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
}

export interface Step {
  order: number;
  instruction: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  _id: string;
  title: string;
  titleMn?: string;
  description: string;
  coverImage?: string;
  author: { name: string };
  categories: string[];
  tags: string[];
  ingredients?: Ingredient[]; // optional — mock data doesn't need it
  steps?: Step[]; // optional — mock data doesn't need it
  allergens: string[];
  isPremium?: boolean; // optional — not all recipes are premium
  price?: number;
  cookTime: number;
  prepTime: number;
  servings: number;
  difficulty?: Difficulty; // optional — mock data doesn't need it
  nutrition?: NutritionInfo;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  createdAt?: string; // optional — mock data doesn't need it
  updatedAt?: string; // optional — mock data doesn't need it
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  _id: string;
  recipe: string;
  author: Pick<User, "_id" | "name" | "avatar">;
  body: string;
  rating: number;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
  allergens?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface RecipeFilters {
  _id?: string;
  title: string;
  description?: string;
  author: { name: string };
  ingredients: string[];
  categories?: string[];
  excludeAllergens?: string[];
  isPremium?: boolean;
  difficulty: Difficulty;
  maxCookTime?: number;
  page?: number;
  limit?: number;
  steps: number;
  createdAt: Date;
  updatedAt: Date;
}
