import { apiFetch } from "@/lib/api";

describe("apiFetch", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns parsed json on success (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    const data = await apiFetch<{ ok: boolean }>("/api/test");
    expect(data.ok).toBe(true);
  });

  it("uses absolute URL when provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => "plain-text",
    });

    await apiFetch("https://example.com/data");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.com/data",
      expect.any(Object),
    );
  });

  it("attaches bearer token when provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
    });

    await apiFetch("/api/secure", { token: "jwt-1" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/secure"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-1",
        }),
      }),
    );
  });

  it("throws ApiError on failure (bad case)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ error: "FORBIDDEN" }),
    });

    await expect(apiFetch("/api/forbidden")).rejects.toMatchObject({
      message: "API request failed",
      status: 403,
    });
  });

  it("handles empty response body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => "",
    });

    const data = await apiFetch<null>("/api/empty");
    expect(data).toBeNull();
  });
});
