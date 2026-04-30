import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";
import { authRouter, googleClient } from "../routes/auth";
import { UserModel } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import { signAccessToken } from "../lib/auth";

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

jest.mock("../lib/auth", () => ({
  signAccessToken: jest.fn(),
}));

const mockedBcrypt = bcrypt as unknown as {
  hash: jest.Mock;
  compare: jest.Mock;
};
const mockedUserModel = UserModel as unknown as {
  create: jest.Mock;
  findOne: jest.Mock;
};
const mockedTechProfileModel = TechnologistProfileModel as unknown as {
  create: jest.Mock;
};
const mockedSignAccessToken = signAccessToken as jest.Mock;
const mockedGoogleClient = googleClient as unknown as {
  verifyIdToken: jest.Mock;
};

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
      _id: "u1",
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
      userId: "u1",
      displayName: "Tech",
    });
    expect(res.body).toEqual({
      token: "jwt-token",
      user: {
        id: "u1",
        email: "tech@test.com",
        name: "Tech",
        role: "technologist",
      },
    });
  });

  it("login succeeds with valid credentials", async () => {
    mockedUserModel.findOne.mockResolvedValue({
      _id: "u2",
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

  it("google login returns token and user", async () => {
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    mockedGoogleClient.verifyIdToken = jest.fn().mockResolvedValue({
      getPayload: () => ({
        email: "google@test.com",
        name: "Google User",
      }),
    });
    mockedUserModel.findOne.mockResolvedValue({
      _id: "g1",
      email: "google@test.com",
      name: "Google User",
      role: "user",
      isActive: true,
    });
    mockedSignAccessToken.mockReturnValue("jwt-google");

    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "google-id-token" });

    expect(res.status).toBe(200);
    expect(mockedGoogleClient.verifyIdToken).toHaveBeenCalled();
    expect(res.body).toEqual({
      token: "jwt-google",
      user: {
        id: "g1",
        email: "google@test.com",
        name: "Google User",
        role: "user",
      },
    });
  });
});
