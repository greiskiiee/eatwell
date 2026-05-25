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

describe("Authentication middleware — TC-A01–TC-A05", () => {
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-A01 no Authorization header on protected route — 401 UNAUTHORIZED", () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "UNAUTHORIZED" });
    expect(next).not.toHaveBeenCalled();
  });

  it("TC-A02 Bearer invalid-token — 401 UNAUTHORIZED", () => {
    mockedVerify.mockImplementation(() => {
      throw new Error("invalid");
    });
    const req = {
      headers: { authorization: "Bearer invalid-token" },
    } as AuthenticatedRequest;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "UNAUTHORIZED" });
    expect(next).not.toHaveBeenCalled();
  });

  it("TC-A03 Bearer valid-token role user — 200, auth sub and role attached", () => {
    mockedVerify.mockReturnValue({ sub: "user-1", role: "user" });
    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as AuthenticatedRequest;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(req.auth).toEqual({ userId: "user-1", role: "user" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("TC-A04 Bearer valid-token role user on admin-only route — 403 FORBIDDEN", () => {
    const req = {
      auth: { userId: "user-1", role: "user" },
    } as AuthenticatedRequest;
    const res = mockRes();
    const guard = requireRole(["admin"]);

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "FORBIDDEN" });
    expect(next).not.toHaveBeenCalled();
  });

  it("TC-A05 Bearer valid-token role technologist on technologist route — 200", () => {
    const req = {
      auth: { userId: "tech-1", role: "technologist" },
    } as AuthenticatedRequest;
    const res = mockRes();
    const guard = requireRole(["technologist", "admin"]);

    guard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
