import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import type { Response, NextFunction } from "express";
import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "../middleware/auth";
import { verifyAccessToken } from "../lib/auth";

jest.mock("../lib/auth", () => ({
  verifyAccessToken: jest.fn(),
}));

const mockedVerify = verifyAccessToken as jest.MockedFunction<
  typeof verifyAccessToken
>;

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("auth middleware", () => {
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requireAuth rejects missing token (bad case)", () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "UNAUTHORIZED" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth rejects invalid token (bad case)", () => {
    mockedVerify.mockImplementation(() => {
      throw new Error("invalid");
    });
    const req = {
      headers: { authorization: "Bearer bad-token" },
    } as AuthenticatedRequest;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth attaches auth and continues (happy path)", () => {
    mockedVerify.mockReturnValue({ sub: "user-1", role: "admin" });
    const req = {
      headers: { authorization: "Bearer good-token" },
    } as AuthenticatedRequest;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(req.auth).toEqual({ userId: "user-1", role: "admin" });
    expect(next).toHaveBeenCalled();
  });

  it("requireRole rejects missing auth (bad case)", () => {
    const req = {} as AuthenticatedRequest;
    const res = mockRes();
    const guard = requireRole(["admin"]);

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("requireRole rejects wrong role (bad case)", () => {
    const req = { auth: { userId: "u1", role: "user" } } as AuthenticatedRequest;
    const res = mockRes();
    const guard = requireRole(["admin"]);

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "FORBIDDEN" });
  });

  it("requireRole allows matching role (happy path)", () => {
    const req = { auth: { userId: "u1", role: "admin" } } as AuthenticatedRequest;
    const res = mockRes();
    const guard = requireRole(["admin"]);

    guard(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
