"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "@/context/UserContext";
import { getStoredToken } from "@/lib/auth";
import { usersApi } from "@/lib/users";
import { technologistApi } from "@/lib/technologist";
import { uploadApi } from "@/lib/upload";
import { IngredientAllergenPicker } from "@/components/IngredientAllergenPicker";
import { ImageFileUpload } from "@/components/ImageFileUpload";
import { dedupeIngredientNames } from "@/lib/ingredientGroups";

const inputCls = `w-full px-3.5 py-2.5 bg-white rounded-xl text-[13.5px] text-[#221C16]
  border border-[#D6C9B4] focus:border-[#B84230] focus:outline-none transition-colors`;

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [credentials, setCredentials] = useState("");
  const [bio, setBio] = useState("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isTechnologist = user?.role === "technologist";

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const fresh = await usersApi.me();
        if (cancelled) return;
        setName(fresh.name);
        setEmail(fresh.email);
        setAvatarUrl(fresh.avatarUrl ?? "");
        setAllergens(fresh.allergens ?? []);

        if (fresh.role === "technologist") {
          try {
            const profile = await technologistApi.getProfile();
            if (!cancelled) {
              setCredentials(profile.credentials ?? "");
              setBio(profile.bio ?? "");
            }
          } catch {
            if (!cancelled) {
              setCredentials("");
              setBio("");
            }
          }
        }
      } catch {
        if (!cancelled && user) {
          setName(user.name);
          setEmail(user.email);
          setAvatarUrl(user.avatarUrl ?? "");
          setAllergens(user.allergens ?? []);
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  async function handleAvatarUpload(file: File) {
    const { url, user: updated } = await uploadApi.avatar(file);
    const token = getStoredToken();
    if (token && updated) setAuth(token, updated);
    return url;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body: { name?: string; password?: string; avatarUrl?: string } = {
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
      };
      if (password.trim()) body.password = password;

      let updated = await usersApi.update(user.id, body);

      if (isTechnologist) {
        await technologistApi.updateProfile({
          credentials: credentials.trim(),
          bio: bio.trim(),
          displayName: name.trim(),
        });
      } else {
        updated = await usersApi.updateAllergens(
          dedupeIngredientNames(allergens),
        );
      }

      const token = getStoredToken();
      if (token) setAuth(token, updated);

      setSuccess("Профайл амжилттай хадгалагдлаа");
      setPassword("");
    } catch {
      setError("Хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setError("");
    setDeleting(true);
    try {
      await usersApi.remove(user.id);
      logout();
      router.replace("/login");
    } catch {
      setError("Аккаунт устгахад алдаа гарлаа.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#EFE8DA] flex items-center justify-center">
        <p className="text-sm text-[#9C8878]">Ачаалж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE8DA]">
      <header className="sticky top-0 z-30 bg-[#EFE8DA]/92 backdrop-blur-md border-b border-[#D6C9B4]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/home"
            className="w-9 h-9 rounded-xl bg-white border border-[#D6C9B4] flex items-center
                       justify-center text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-xl font-semibold text-[#221C16]">
            Профайл засах
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={save} className="space-y-5">
          {error && (
            <p className="text-sm text-[#B84230] bg-[#FBF0E6] px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-[#2D5A4A] bg-[#E8F0EC] px-3 py-2 rounded-xl">
              {success}
            </p>
          )}

          {fetching ? (
            <p className="text-sm text-[#9C8878] py-12 text-center">Ачаалж байна...</p>
          ) : (
            <>
              <section className="bg-white rounded-2xl border border-[#D6C9B4] p-5 space-y-4">
                <p className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                  Профайл зураг
                </p>
                <ImageFileUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  onUpload={handleAvatarUpload}
                  label=""
                  previewClassName="h-40"
                />
              </section>

              <section className="bg-white rounded-2xl border border-[#D6C9B4] p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                    Нэр
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                    И-мэйл
                  </label>
                  <input
                    value={email}
                    disabled
                    className={
                      inputCls + " bg-[#EFE8DA] text-[#9C8878] cursor-not-allowed"
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                    Шинэ нууц үг
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Хоосон бол өөрчлөхгүй"
                    minLength={8}
                    className={inputCls}
                  />
                </div>
              </section>

              {!isTechnologist && (
                <section className="bg-white rounded-2xl border border-[#D6C9B4] p-5 space-y-3">
                  <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                    Харшлын орц
                  </label>
                  <IngredientAllergenPicker
                    selected={allergens}
                    onChange={setAllergens}
                    maxHeight="max-h-56"
                  />
                </section>
              )}

              {isTechnologist && (
                <section className="bg-white rounded-2xl border border-[#D6C9B4] p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                      Мэргэшил / Баримт бичиг
                    </label>
                    <input
                      value={credentials}
                      onChange={(e) => setCredentials(e.target.value)}
                      placeholder="жнь: Хоол технологич, M.Sc."
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                      Товч танилцуулга
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className={inputCls + " resize-none"}
                    />
                  </div>
                </section>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading || fetching}
            className="w-full py-3.5 rounded-xl bg-[#B84230] text-white font-semibold text-sm
                       hover:bg-[#9C3426] transition-colors disabled:opacity-60"
          >
            {loading ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>

        {!fetching && (
          <section className="mt-8 rounded-2xl border border-[#B84230]/30 bg-[#FBF0E6] p-5">
            <div className="flex items-start gap-3">
              <Trash2 size={18} className="text-[#B84230] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#B84230]">
                  Аюултай хэсэг
                </h3>
                <p className="text-[12.5px] text-[#5C4A3A] mt-1 leading-relaxed">
                  Аккаунтаа устгасны дараа таны бүх жор, сэтгэгдэл,
                  хадгалсан жор, худалдан авалт устах ба сэргээх боломжгүй.
                </p>

                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl
                               bg-white border border-[#B84230]/30 text-[#B84230]
                               text-[13px] font-semibold hover:bg-[#FBE6E0] transition-colors"
                  >
                    <Trash2 size={14} />
                    Аккаунт устгах
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-[12.5px] font-semibold text-[#B84230]">
                      Та итгэлтэй байна уу?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-3 py-2 rounded-xl bg-[#B84230] text-white
                                   text-[13px] font-semibold hover:bg-[#9C3426]
                                   transition-colors disabled:opacity-60"
                      >
                        {deleting ? "Устгаж байна..." : "Тийм, устга"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        disabled={deleting}
                        className="px-3 py-2 rounded-xl bg-white border border-[#D6C9B4]
                                   text-[#5C4A3A] text-[13px] font-semibold
                                   hover:bg-[#EFE8DA] transition-colors disabled:opacity-60"
                      >
                        Болих
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
