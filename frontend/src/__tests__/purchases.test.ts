import {
  buildQpayPayload,
  isEatwellPaymentQr,
  purchasesApi,
  PAYMENT_METHODS,
} from "@/lib/purchases";
import { AUTH_TOKEN_KEY } from "@/lib/auth";

describe("purchases lib", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it("buildQpayPayload includes recipe, amount, and user", () => {
    expect(buildQpayPayload("abc123", 5000, "user-1")).toBe(
      "EATWELL|PAY|abc123|5000|user-1",
    );
  });

  it("buildQpayPayload uses guest when userId missing", () => {
    expect(buildQpayPayload("abc123", 5000)).toContain("|guest");
  });

  it("isEatwellPaymentQr validates payment payload", () => {
    const payload = buildQpayPayload("recipe-1", 1000);
    expect(isEatwellPaymentQr(payload, "recipe-1")).toBe(true);
    expect(isEatwellPaymentQr("random-qr", "recipe-1")).toBe(false);
  });

  it("isEatwellPaymentQr trims whitespace", () => {
    const payload = `  ${buildQpayPayload("r1", 100)}  `;
    expect(isEatwellPaymentQr(payload, "r1")).toBe(true);
  });

  it("exposes all payment methods", () => {
    expect(PAYMENT_METHODS.map((m) => m.id)).toEqual([
      "khan",
      "golomt",
      "turiin",
      "qpay",
    ]);
  });

  it("complete throws without token (bad case)", () => {
    expect(() => purchasesApi.complete("id", "qpay")).toThrow("UNAUTHORIZED");
  });

  it("listMine calls API with token (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "user-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ purchases: [] }),
    });

    const data = await purchasesApi.listMine();
    expect(data.purchases).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchases/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer user-jwt",
        }),
      }),
    );
  });

  it("check returns purchased flag (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "user-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ purchased: true }),
    });

    const res = await purchasesApi.check("recipe-1");
    expect(res.purchased).toBe(true);
  });

  it("complete posts purchase (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "user-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          purchased: true,
          recipeId: "recipe-1",
          amount: 5000,
        }),
    });

    const res = await purchasesApi.complete("recipe-1", "khan");
    expect(res.purchased).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/purchases"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
