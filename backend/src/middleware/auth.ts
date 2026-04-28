import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/auth";

export type AuthenticatedRequest = Request & {
  auth?: { userId: string; role: string };
};

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    header && header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: "FORBIDDEN" });
    return next();
  };
}

