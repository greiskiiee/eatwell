import type { User } from "../models/User";

export function toPublicUser(user: User & { _id: unknown }) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    allergens: user.allergens ?? [],
    avatarUrl: user.avatarUrl ?? "",
  };
}
