/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import request from "supertest";
import * as bcrypt from "bcryptjs";
import { authRouter } from "../routes/auth";
import { UserModel } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { signAccessToken } from "../lib/auth";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../models/User", () => ({
  UserModel: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../models/TechnologistProfile", () => ({
  TechnologistProfileModel: {
    create: jest.fn(),
  },
}));

jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(),
    })),
  };
});

jest.mock("../lib/auth", () => ({
  signAccessToken: jest.fn(),
}));

const mockedBcrypt = bcrypt as any;
const mockedUserModel = UserModel as any;
const mockedTechProfileModel = TechnologistProfileModel as any;
const mockedSignAccessToken = signAccessToken as jest.MockedFunction<
  typeof signAccessToken
>;
OAuth2Client: jest.fn().mockImplementation(() => ({
  verifyIdToken: jest.fn(),
}));

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  return app;
}

describe("Auth routes", () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signup returns token and user for technologist", async () => {
    mockedBcrypt.hash.mockResolvedValue("hashed-password");
    mockedUserModel.create.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      email: "tech@test.com",
      name: "Tech",
      role: "technologist",
    });
    mockedSignAccessToken.mockReturnValue("jwt-token");

    const res = await request(app).post("/api/auth/signup").send({
      email: "Tech@Test.com",
      password: "password123",
      name: "Tech",
      role: "technologist",
    });

    expect(res.status).toBe(201);
    expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockedUserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "tech@test.com",
        passwordHash: "hashed-password",
        role: "technologist",
      }),
    );
    expect(mockedTechProfileModel.create).toHaveBeenCalledWith({
      userId: "507f1f77bcf86cd799439011",
      displayName: "Tech",
    });
    expect(res.body).toEqual({
      token: "jwt-token",
      user: {
        id: "507f1f77bcf86cd799439011",
        email: "tech@test.com",
        name: "Tech",
        role: "technologist",
      },
    });
  });

  it("login succeeds with valid credentials", async () => {
    mockedUserModel.findOne.mockResolvedValue({
      _id: "u2" as any,
      email: "user@test.com",
      name: "User",
      role: "user",
      isActive: true,
      passwordHash: "hashed",
    });
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedSignAccessToken.mockReturnValue("jwt-login");

    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(mockedBcrypt.compare).toHaveBeenCalledWith("password123", "hashed");
    expect(res.body.token).toBe("jwt-login");
    expect(res.body.user.role).toBe("user");
  });

  it("login fails with invalid credentials", async () => {
    mockedUserModel.findOne.mockResolvedValue(null);

    const res = await request(app).post("/api/auth/login").send({
      email: "missing@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "INVALID_CREDENTIALS" });
  });
});
