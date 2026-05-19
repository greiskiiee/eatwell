import type { AuthUser } from "./auth";

export function getPostLoginPath(role: AuthUser["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "technologist") return "/home";
  return "/home";
}
