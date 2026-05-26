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

  it("getStats calls admin stats endpoint (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          users: 10,
          technologists: 2,
          recipes: 5,
          pendingApplications: 1,
        }),
    });

    const stats = await adminApi.getStats();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/stats"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-jwt",
        }),
      }),
    );
    expect(stats.users).toBe(10);
  });

  it("listUsers builds query string for filters (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ users: [], total: 0 }),
    });

    await adminApi.listUsers({
      q: "  nar  ",
      role: "technologist",
      limit: 50,
    });

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("q=nar");
    expect(url).toContain("role=technologist");
    expect(url).toContain("limit=50");
  });

  it("listUsers omits role when all and skips empty q", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ users: [], total: 0 }),
    });

    await adminApi.listUsers({ q: "   ", role: "all" });

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toBe(
      `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "http://localhost:5000"}/api/admin/users`,
    );
  });

  it("listApplications uses status query (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify([]),
    });

    await adminApi.listApplications("approved");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("status=approved"),
      expect.any(Object),
    );
  });

  it("reviewApplication patches with rejection reason (happy path)", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ userId: "u1", approvalStatus: "rejected" }),
    });

    const res = await adminApi.reviewApplication(
      "u1",
      "reject",
      "Invalid certificate",
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/technologist-applications/u1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          action: "reject",
          rejectionReason: "Invalid certificate",
        }),
      }),
    );
    expect(res.approvalStatus).toBe("rejected");
  });

  it("listIngredients without search uses base query", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "admin-jwt");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [], total: 0 }),
    });

    await adminApi.listIngredients();

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("limit=2000");
    expect(url).not.toContain("&q=");
  });
});
