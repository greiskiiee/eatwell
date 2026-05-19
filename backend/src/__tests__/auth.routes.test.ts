/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import request from "supertest";
import * as bcrypt from "bcryptjs";
import { authRouter } from "../routes/auth";
import { UserModel } from "../models/User";
import { TechnologistProfileModel } from "../models/TechnologistProfile";
import {
  signAccessToken,
  signResetToken,
  verifyResetToken,
} from "../lib/auth";
import { PasswordResetOtpModel } from "../models/PasswordResetOtp";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../models/User", () => ({
  UserModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../models/PasswordResetOtp", () => ({
  PasswordResetOtpModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock("../lib/email", () => ({
  sendPasswordResetOtpEmail: jest.fn(),
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
  signResetToken: jest.fn(),
  verifyResetToken: jest.fn(),
}));

const mockedBcrypt = bcrypt as any;
const mockedUserModel = UserModel as any;
const mockedTechProfileModel = TechnologistProfileModel as any;
const mockedSignAccessToken = signAccessToken as jest.MockedFunction<
  typeof signAccessToken
>;
const mockedSignResetToken = signResetToken as jest.MockedFunction<
  typeof signResetToken
>;
const mockedVerifyResetToken = verifyResetToken as jest.MockedFunction<
  typeof verifyResetToken
>;
const mockedUserFindById = UserModel.findById as jest.MockedFunction<
  typeof UserModel.findById
>;
const mockedOtpFindOne = PasswordResetOtpModel.findOne as jest.MockedFunction<
  typeof PasswordResetOtpModel.findOne
>;
const mockedOtpFindOneAndUpdate =
  PasswordResetOtpModel.findOneAndUpdate as jest.MockedFunction<
    typeof PasswordResetOtpModel.findOneAndUpdate
  >;
const mockedOtpUpdateOne = PasswordResetOtpModel.updateOne as jest.MockedFunction<
  typeof PasswordResetOtpModel.updateOne
>;
const mockedOtpDeleteOne = PasswordResetOtpModel.deleteOne as jest.MockedFunction<
  typeof PasswordResetOtpModel.deleteOne
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

  it("signup always creates a regular user regardless of role in body", async () => {
    mockedBcrypt.hash.mockResolvedValue("hashed-password");
    mockedUserModel.create.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      email: "user@test.com",
      name: "User",
      role: "user",
    });
    mockedSignAccessToken.mockReturnValue("jwt-token");

    const res = await request(app).post("/api/auth/signup").send({
      email: "user@test.com",
      password: "password123",
      name: "User",
      role: "technologist",
    });

    expect(res.status).toBe(201);
    expect(mockedUserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@test.com",
        role: "user",
      }),
    );
    expect(mockedTechProfileModel.create).not.toHaveBeenCalled();
    expect(res.body.user.role).toBe("user");
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

  it("forgot-password always returns 200", async () => {
    mockedUserModel.findOne.mockResolvedValue({
      _id: "u1",
      email: "user@test.com",
      name: "User",
      isActive: true,
    });
    mockedOtpFindOne.mockResolvedValue(null);
    mockedOtpFindOneAndUpdate.mockResolvedValue({});
    mockedBcrypt.hash.mockResolvedValue("otp-hash");

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "user@test.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it("verify-reset-otp fails with invalid otp", async () => {
    mockedOtpFindOne.mockResolvedValue({
      email: "user@test.com",
      otpHash: "hashed",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    } as any);
    mockedBcrypt.compare.mockResolvedValue(false);
    mockedOtpUpdateOne.mockResolvedValue({ acknowledged: true } as any);

    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({ email: "user@test.com", otp: "0000" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_OTP");
  });

  it("verify-reset-otp succeeds and returns reset token", async () => {
    mockedOtpFindOne.mockResolvedValue({
      email: "user@test.com",
      otpHash: "hashed",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    } as any);
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedUserModel.findOne.mockResolvedValue({
      _id: "u1",
      email: "user@test.com",
      isActive: true,
    });
    mockedSignResetToken.mockReturnValue("reset-jwt");

    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({ email: "user@test.com", otp: "1234" });

    expect(res.status).toBe(200);
    expect(res.body.resetToken).toBe("reset-jwt");
  });

  it("login rejects wrong password (bad case)", async () => {
    mockedUserModel.findOne.mockResolvedValue({
      _id: "u2" as any,
      email: "user@test.com",
      isActive: true,
      passwordHash: "hashed",
    });
    mockedBcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "wrong",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("forgot-password returns 200 even when user missing (bad case)", async () => {
    mockedUserModel.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@test.com" });

    expect(res.status).toBe(200);
  });

  it("verify-reset-otp rejects missing email (bad case)", async () => {
    const res = await request(app)
      .post("/api/auth/verify-reset-otp")
      .send({ otp: "1234" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("signup rejects missing fields (bad case)", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "user@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("signup rejects duplicate email (bad case)", async () => {
    mockedUserModel.findOne.mockResolvedValue({ email: "user@test.com" });

    const res = await request(app).post("/api/auth/signup").send({
      email: "user@test.com",
      password: "password123",
      name: "User",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("login rejects inactive user (bad case)", async () => {
    mockedUserModel.findOne.mockResolvedValue({
      email: "user@test.com",
      isActive: false,
      passwordHash: "hashed",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("reset-password rejects invalid token (bad case)", async () => {
    mockedVerifyResetToken.mockImplementation(() => {
      throw new Error("bad");
    });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ resetToken: "bad", password: "newpassword1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_RESET_TOKEN");
  });

  it("reset-password updates password hash", async () => {
    const save = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockedUserFindById.mockResolvedValue({
      _id: "u1",
      email: "user@test.com",
      isActive: true,
      passwordHash: "old",
      save,
    } as any);
    mockedBcrypt.hash.mockResolvedValue("new-hash");
    mockedOtpDeleteOne.mockResolvedValue({ acknowledged: true } as any);

    mockedVerifyResetToken.mockReturnValue("u1");

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ resetToken: "reset-jwt", password: "newpassword1" });

    expect(res.status).toBe(200);
    expect(mockedBcrypt.hash).toHaveBeenCalledWith("newpassword1", 10);
    expect(save).toHaveBeenCalled();
  });
});
