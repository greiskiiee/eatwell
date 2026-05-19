import { adminApi } from "@/lib/admin";
import { AUTH_TOKEN_KEY } from "@/lib/auth";

describe("adminApi", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it("throws when token missing (bad case)", () => {
    expect(() => adminApi.listIngredients()).toThrow("UNAUTHORIZED");
  });

  it("listIngredients calls API with token (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          items: [],
          total: 0,
        }),
    });

    const data = await adminApi.listIngredients("chicken");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/ingredients?"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-jwt",
        }),
      }),
    );
    expect(data.total).toBe(0);
  });

  it("updateIngredientNameMn patches ingredient (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          mealDbKey: "chicken",
          mealDbName: "Chicken",
          nameMn: "Тахиа шинэ",
          group: "meat",
          thumb: "",
        }),
    });

    const updated = await adminApi.updateIngredientNameMn("chicken", "Тахиа шинэ");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/ingredients/chicken"),
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(updated.nameMn).toBe("Тахиа шинэ");
  });

  it("syncIngredients posts to sync endpoint (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ created: 1, updated: 0, total: 10 }),
    });

    const result = await adminApi.syncIngredients();
    expect(result.created).toBe(1);
  });

  it("reviewApplication rejects without token (bad case)", () => {
    expect(() => adminApi.reviewApplication("u1", "approve")).toThrow(
      "UNAUTHORIZED",
    );
  });
});
