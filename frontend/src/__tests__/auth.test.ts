import { authApi, clearAuth, getStoredToken, getStoredUser, storeAuth } from "@/lib/auth";

describe("frontend auth", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it("signup calls backend and returns auth payload", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          token: "jwt-signup",
          user: {
            id: "u1",
            email: "user@test.com",
            name: "User",
            role: "user",
          },
        }),
    });

    const res = await authApi.signup({
      name: "User",
      email: "user@test.com",
      password: "password123",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/signup"),
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(res.token).toBe("jwt-signup");
    expect(res.user.email).toBe("user@test.com");
  });

  it("login calls backend and returns technologist role", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          token: "jwt-login",
          user: {
            id: "t1",
            email: "tech@test.com",
            name: "Tech",
            role: "technologist",
          },
        }),
    });

    const res = await authApi.login("tech@test.com", "password123");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(res.user.role).toBe("technologist");
  });

  it("google login calls backend and returns user", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          token: "jwt-google",
          user: {
            id: "g1",
            email: "google@test.com",
            name: "Google User",
            role: "user",
          },
        }),
    });

    const res = await authApi.google("google-id-token");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/google"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(res.token).toBe("jwt-google");
  });

  it("stores and clears auth state in localStorage", () => {
    storeAuth("jwt-token", {
      id: "u9",
      email: "x@test.com",
      name: "X",
      role: "user",
    });

    expect(getStoredToken()).toBe("jwt-token");
    expect(getStoredUser()?.email).toBe("x@test.com");

    clearAuth();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});

