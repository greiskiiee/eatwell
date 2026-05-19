import type { Comment } from "../models/Comment";

type PopulatedAuthor = {
  _id: unknown;
  name?: string;
  avatarUrl?: string;
};

export function toPublicComment(doc: Comment & { _id: unknown; author: PopulatedAuthor }) {
  return {
    _id: String(doc._id),
    recipeId: doc.recipeId,
    body: doc.body,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt ?? ""),
    author: {
      id: String(doc.author._id),
      name: doc.author.name?.trim() || "Хэрэглэгч",
      avatarUrl: doc.author.avatarUrl?.trim() || "",
    },
  };
}
