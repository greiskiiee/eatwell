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

  it("forgotPassword calls backend (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ message: "sent" }),
    });

    const res = await authApi.forgotPassword("user@test.com");
    expect(res.message).toBe("sent");
  });

  it("forgotPassword surfaces API errors (bad case)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: "SERVER_ERROR" }),
    });

    await expect(authApi.forgotPassword("user@test.com")).rejects.toThrow(
      "API request failed",
    );
  });

  it("verifyResetOtp returns reset token (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ resetToken: "reset-jwt" }),
    });

    const res = await authApi.verifyResetOtp("user@test.com", "1234");
    expect(res.resetToken).toBe("reset-jwt");
  });

  it("getStoredUser returns null for invalid JSON (bad case)", () => {
    localStorage.setItem("chimge_user", "not-json");
    expect(getStoredUser()).toBeNull();
  });

  it("me fetches current user with token (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          id: "u1",
          email: "user@test.com",
          name: "User",
          role: "user",
        }),
    });

    const user = await authApi.me("jwt-me");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-me",
        }),
      }),
    );
    expect(user.email).toBe("user@test.com");
  });

  it("resetPassword calls backend (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ message: "ok" }),
    });

    const res = await authApi.resetPassword("reset-jwt", "newpass123");
    expect(res.message).toBe("ok");
  });

  it("signup passes optional role (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          token: "jwt",
          user: {
            id: "t1",
            email: "tech@test.com",
            name: "Tech",
            role: "technologist",
          },
        }),
    });

    await authApi.signup({
      name: "Tech",
      email: "tech@test.com",
      password: "password123",
      role: "technologist",
    });

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    );
    expect(body.role).toBe("technologist");
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

