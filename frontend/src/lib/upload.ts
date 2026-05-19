import { API_BASE_URL } from "./api";
import { getStoredToken } from "./auth";
import type { AuthUser } from "./auth";
import { mapMeToAuthUser } from "./users";

export type UploadError = Error & { status?: number; data?: unknown };

async function uploadFile(
  path: string,
  file: File,
  fieldName = "image",
): Promise<{ url: string; user?: AuthUser }> {
  const token = getStoredToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const form = new FormData();
  form.append(fieldName, file);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error("Upload failed") as UploadError;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  const url = (data as { url?: string }).url ?? "";
  const userRaw = (data as { user?: Parameters<typeof mapMeToAuthUser>[0] }).user;
  return {
    url,
    user: userRaw ? mapMeToAuthUser(userRaw) : undefined,
  };
}

export const uploadApi = {
  avatar: (file: File) => uploadFile("/api/upload/avatar", file),
  recipeImage: (file: File) => uploadFile("/api/upload/recipe-image", file),
};
