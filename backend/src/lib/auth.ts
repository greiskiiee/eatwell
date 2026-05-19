import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";
import type { Secret, SignOptions } from "jsonwebtoken";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
};

export type ResetTokenPayload = {
  sub: string;
  purpose: "password-reset";
};

export function signAccessToken(payload: AuthTokenPayload): string {
  const secret = requireEnv("JWT_SECRET") as Secret;
  const expiresIn = (process.env.JWT_EXPIRES_IN ??
    "7d") as unknown as SignOptions["expiresIn"];
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const secret = requireEnv("JWT_SECRET");
  return jwt.verify(token, secret) as AuthTokenPayload;
}

export function signResetToken(userId: string): string {
  const secret = requireEnv("JWT_SECRET") as Secret;
  const payload: ResetTokenPayload = {
    sub: userId,
    purpose: "password-reset",
  };
  const options: SignOptions = { expiresIn: "15m" };
  return jwt.sign(payload, secret, options);
}

export function verifyResetToken(token: string): string {
  const secret = requireEnv("JWT_SECRET");
  const payload = jwt.verify(token, secret) as ResetTokenPayload;
  if (payload.purpose !== "password-reset" || !payload.sub) {
    throw new Error("INVALID_RESET_TOKEN");
  }
  return payload.sub;
}
