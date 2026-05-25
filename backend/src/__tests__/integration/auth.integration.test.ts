import request from "supertest";
import { beforeAll, afterAll, afterEach, describe, expect, it } from "@jest/globals";
import { createApp } from "../../app";
import {
  clearIntegrationDb,
  connectIntegrationDb,
  disconnectIntegrationDb,
} from "./db";
import { authHeader, loginUser, signupUser } from "./helpers";

describe("Auth integration", () => {
  const app = createApp();

  beforeAll(async () => {
    await connectIntegrationDb();
  });

  afterEach(async () => {
    await clearIntegrationDb();
  });

  afterAll(async () => {
    await disconnectIntegrationDb();
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("signup → login → me full flow", async () => {
    const signup = await signupUser(app, {
      email: "user@integration.test",
      password: "password123",
      name: "Integration User",
    });

    expect(signup.status).toBe(201);
    expect(signup.body.token).toBeTruthy();
    expect(signup.body.user.email).toBe("user@integration.test");

    const login = await loginUser(app, {
      email: "user@integration.test",
      password: "password123",
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const me = await request(app)
      .get("/api/auth/me")
      .set(authHeader(login.body.token));

    expect(me.status).toBe(200);
    expect(me.body.email).toBe("user@integration.test");
    expect(me.body.name).toBe("Integration User");
  });

  it("signup rejects duplicate email", async () => {
    await signupUser(app, {
      email: "dup@integration.test",
      password: "password123",
    });

    const second = await signupUser(app, {
      email: "dup@integration.test",
      password: "password456",
    });

    expect(second.status).toBe(409);
    expect(second.body.error).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("login rejects wrong password", async () => {
    await signupUser(app, {
      email: "wrong@integration.test",
      password: "password123",
    });

    const login = await loginUser(app, {
      email: "wrong@integration.test",
      password: "wrong-password",
    });

    expect(login.status).toBe(401);
    expect(login.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("me requires authorization", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });
});
