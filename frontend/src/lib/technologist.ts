import { apiFetch } from "./api";
import { getStoredToken } from "./auth";

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export type TechnologistProfile = {
  displayName: string;
  credentials: string;
  bio: string;
  certificateUrl?: string;
  approvalStatus?: string;
};

export type TechnologistAnalyticsItem = {
  _id: string;
  title: string;
  imageUrl: string;
  isDraft: boolean;
  isPremium: boolean;
  price: number;
  views: number;
  purchases: number;
  revenue: number;
  comments: number;
  createdAt: string;
};

export type TechnologistAnalyticsTotals = {
  recipes: number;
  published: number;
  views: number;
  purchases: number;
  revenue: number;
  comments: number;
};

export type TechnologistAnalytics = {
  items: TechnologistAnalyticsItem[];
  totals: TechnologistAnalyticsTotals;
};

export const technologistApi = {
  getProfile: () =>
    apiFetch<TechnologistProfile>("/api/technologist/me", { token: token() }),

  updateProfile: (body: {
    credentials?: string;
    bio?: string;
    displayName?: string;
  }) =>
    apiFetch<TechnologistProfile>("/api/technologist/me", {
      method: "PATCH",
      token: token(),
      body: JSON.stringify(body),
    }),

  getAnalytics: () =>
    apiFetch<TechnologistAnalytics>("/api/technologist/analytics", {
      token: token(),
    }),
};
