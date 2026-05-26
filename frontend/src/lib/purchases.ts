import { apiFetch } from "./api";
import { getStoredToken } from "./auth";
import type { TechnologistRecipe } from "./recipes";

export type PaymentMethod = "khan" | "golomt" | "turiin" | "qpay";

export type PurchasedEntry = {
  recipeId: string;
  amount: number;
  method: PaymentMethod;
  purchasedAt?: string;
  recipe: TechnologistRecipe | null;
};

function token() {
  const t = getStoredToken();
  if (!t) throw new Error("UNAUTHORIZED");
  return t;
}

export function buildQpayPayload(recipeId: string, amount: number, userId?: string) {
  return `EATWELL|PAY|${recipeId}|${amount}|${userId ?? "guest"}`;
}

export function isEatwellPaymentQr(text: string, recipeId: string) {
  const normalized = text.trim();
  return (
    normalized.includes("EATWELL") &&
    normalized.includes("PAY") &&
    normalized.includes(recipeId)
  );
}

export const purchasesApi = {
  listMine: () =>
    apiFetch<{ purchases: PurchasedEntry[] }>("/api/purchases/me", {
      token: token(),
    }),

  check: (recipeId: string) =>
    apiFetch<{ purchased: boolean }>(`/api/purchases/check/${recipeId}`, {
      token: token(),
    }),

  complete: (recipeId: string, method: PaymentMethod) =>
    apiFetch<{ purchased: boolean; recipeId: string; amount: number }>(
      "/api/purchases",
      {
        method: "POST",
        token: token(),
        body: JSON.stringify({ recipeId, method }),
      },
    ),
};

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  hint: string;
}[] = [
  { id: "khan", label: "Хаан банк", hint: "5000 1234567 — Eatwell LLC" },
  { id: "golomt", label: "Голомт банк", hint: "3405 00123456 — Eatwell LLC" },
  { id: "turiin", label: "Төрийн банк", hint: "1105 99887766 — Eatwell LLC" },
  { id: "qpay", label: "QPay", hint: "QR кодоор төлнө" },
];
