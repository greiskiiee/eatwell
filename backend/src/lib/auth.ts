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
