import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../lib/auth";
import type { AuthenticatedRequest } from "./auth";

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token =
    header && header.startsWith("Bearer ")
      ? header.slice("Bearer ".length).trim()
      : "";

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.auth = { userId: payload.sub, role: payload.role };
    } catch {
      // ignore invalid token — treat as guest
    }
  }
  return next();
}
