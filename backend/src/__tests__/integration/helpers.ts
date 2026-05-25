import bcrypt from "bcryptjs";
import request from "supertest";
import type { Express } from "express";
import { signAccessToken } from "../../lib/auth";
import { UserModel } from "../../models/User";

export async function signupUser(
  app: Express,
  params: { email: string; password: string; name?: string },
) {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({
      email: params.email,
      password: params.password,
      name: params.name ?? "Test User",
    });
  return res;
}

export async function loginUser(
  app: Express,
  params: { email: string; password: string },
) {
  return request(app).post("/api/auth/login").send(params);
}

export async function createTechnologistUser(params: {
  email: string;
  password: string;
  name?: string;
}) {
  const passwordHash = await bcrypt.hash(params.password, 10);
  const user = await UserModel.create({
    email: params.email.trim().toLowerCase(),
    passwordHash,
    name: params.name ?? "Test Technologist",
    role: "technologist",
    isActive: true,
  });

  const token = signAccessToken({
    sub: String(user._id),
    role: "technologist",
  });

  return { user, token };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
