/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as bcrypt from "bcryptjs";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  clearPasswordResetOtp,
} from "../lib/passwordReset";
import { UserModel } from "../models/User";
import { PasswordResetOtpModel } from "../models/PasswordResetOtp";
import { sendPasswordResetOtpEmail } from "../lib/email";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../models/User", () => ({
  UserModel: { findOne: jest.fn() },
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

const mockedUser = UserModel as any;
const mockedOtp = PasswordResetOtpModel as any;
const mockedBcrypt = bcrypt as any;
const mockedEmail = sendPasswordResetOtpEmail as jest.MockedFunction<
  typeof sendPasswordResetOtpEmail
>;

describe("passwordReset lib", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requestPasswordResetOtp returns sent:false for unknown email (bad case)", async () => {
    mockedUser.findOne.mockResolvedValue(null);

    const result = await requestPasswordResetOtp("missing@test.com");

    expect(result).toEqual({ sent: false });
    expect(mockedEmail).not.toHaveBeenCalled();
  });

  it("requestPasswordResetOtp rate limits resend (bad case)", async () => {
    mockedUser.findOne.mockResolvedValue({
      _id: "u1",
      name: "User",
      email: "user@test.com",
    });
    mockedOtp.findOne.mockResolvedValue({
      lastSentAt: new Date(),
    });

    const result = await requestPasswordResetOtp("user@test.com");

    expect(result).toEqual({ sent: true, rateLimited: true });
    expect(mockedEmail).not.toHaveBeenCalled();
  });

  it("requestPasswordResetOtp sends email (happy path)", async () => {
    mockedUser.findOne.mockResolvedValue({
      _id: "u1",
      name: "User",
      email: "user@test.com",
    });
    mockedOtp.findOne.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("otp-hash");
    mockedOtp.findOneAndUpdate.mockResolvedValue({});

    const result = await requestPasswordResetOtp("user@test.com");

    expect(result.sent).toBe(true);
    expect(mockedEmail).toHaveBeenCalled();
  });

  it("verifyPasswordResetOtp fails when record missing (bad case)", async () => {
    mockedOtp.findOne.mockResolvedValue(null);

    const result = await verifyPasswordResetOtp("user@test.com", "1234");

    expect(result).toEqual({ ok: false, error: "INVALID_OTP" });
  });

  it("verifyPasswordResetOtp fails when expired (bad case)", async () => {
    mockedOtp.findOne.mockResolvedValue({
      otpHash: "hash",
      expiresAt: new Date(Date.now() - 1000),
      attempts: 0,
    });
    mockedOtp.deleteOne.mockResolvedValue({});

    const result = await verifyPasswordResetOtp("user@test.com", "1234");

    expect(result).toEqual({ ok: false, error: "OTP_EXPIRED" });
  });

  it("verifyPasswordResetOtp fails after too many attempts (bad case)", async () => {
    mockedOtp.findOne.mockResolvedValue({
      otpHash: "hash",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 5,
    });

    const result = await verifyPasswordResetOtp("user@test.com", "1234");

    expect(result).toEqual({ ok: false, error: "TOO_MANY_ATTEMPTS" });
  });

  it("verifyPasswordResetOtp fails on wrong code (bad case)", async () => {
    mockedOtp.findOne.mockResolvedValue({
      otpHash: "hash",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    });
    mockedBcrypt.compare.mockResolvedValue(false);
    mockedOtp.updateOne.mockResolvedValue({});

    const result = await verifyPasswordResetOtp("user@test.com", "0000");

    expect(result).toEqual({ ok: false, error: "INVALID_OTP" });
  });

  it("verifyPasswordResetOtp fails when user deleted (bad case)", async () => {
    mockedOtp.findOne.mockResolvedValue({
      otpHash: "hash",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    });
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedUser.findOne.mockResolvedValue(null);

    const result = await verifyPasswordResetOtp("user@test.com", "1234");

    expect(result).toEqual({ ok: false, error: "INVALID_OTP" });
  });

  it("verifyPasswordResetOtp succeeds (happy path)", async () => {
    mockedOtp.findOne.mockResolvedValue({
      otpHash: "hash",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    });
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedUser.findOne.mockResolvedValue({ _id: "u1", isActive: true });

    const result = await verifyPasswordResetOtp("user@test.com", "1234");

    expect(result).toEqual({ ok: true, userId: "u1" });
  });

  it("clearPasswordResetOtp deletes record", async () => {
    mockedOtp.deleteOne.mockResolvedValue({});
    await clearPasswordResetOtp("user@test.com");
    expect(mockedOtp.deleteOne).toHaveBeenCalled();
  });
});
