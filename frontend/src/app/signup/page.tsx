"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, storeAuth } from "@/lib/auth";
import { getGoogleIdToken } from "@/lib/googleAuth";
import type { ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Нууц үг таарахгүй байна");
      return;
    }
    if (password.length < 8) {
      setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authApi.signup({ name, email, password });
      storeAuth(token, user);
      router.replace("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Бүртгэл үүсгэх боломжгүй");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
      const idToken = await getGoogleIdToken(clientId);
      const { token, user } = await authApi.google(idToken);
      storeAuth(token, user);
      router.replace("/onboarding");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const backendCode =
        typeof apiErr?.data === "object" && apiErr?.data
          ? (apiErr.data as { error?: string }).error
          : undefined;

      if (backendCode === "MISSING_GOOGLE_CLIENT_ID") {
        setError("Backend дээр GOOGLE_CLIENT_ID тохируулаагүй байна");
      } else if (backendCode === "INVALID_GOOGLE_TOKEN") {
        setError("Google token хүчингүй байна. OAuth тохиргоогоо шалгана уу");
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Google-ээр бүртгүүлэх боломжгүй байна");
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  const strength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : /[A-Z]/.test(password) && /[0-9]/.test(password)
          ? 3
          : 2;

  const strengthLabel = ["", "Сул", "Дунд", "Хүчтэй"][strength];
  const strengthColor = [
    "",
    "bg-chimge-warn",
    "bg-chimge-gold",
    "bg-chimge-success",
  ][strength];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div onClick={() => router.replace("/")} className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold text-chimge-primary mb-1">
          Eatwell+
        </h1>
        <p className="text-sm text-chimge-ink-3">
          Хоолны жор хуваалцах платформ
        </p>
      </div>

      <div className="w-full max-w-sm bg-chimge-white rounded-3xl shadow-card p-8 border border-chimge-line/50">
        <h2 className="font-display text-xl font-semibold text-chimge-ink mb-6">
          Бүртгүүлэх
        </h2>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-chimge-warn-soft text-chimge-warn text-sm font-medium border border-chimge-warn/20">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-chimge-ink-2 mb-1.5 uppercase tracking-wider">
              Нэр
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Таны нэр"
              className="w-full px-4 py-3 bg-chimge-bg rounded-xl text-sm border border-chimge-line focus:border-chimge-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-chimge-ink-2 mb-1.5 uppercase tracking-wider">
              И-мэйл
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ta@email.mn"
              className="w-full px-4 py-3 bg-chimge-bg rounded-xl text-sm border border-chimge-line focus:border-chimge-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-chimge-ink-2 mb-1.5 uppercase tracking-wider">
              Нууц үг
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Хамгийн багадаа 8 тэмдэгт"
                className="w-full px-4 py-3 pr-12 bg-chimge-bg rounded-xl text-sm border border-chimge-line focus:border-chimge-primary focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-chimge-ink-3"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {showPw ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-chimge-line rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(strength / 3) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-chimge-ink-3">
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-chimge-ink-2 mb-1.5 uppercase tracking-wider">
              Нууц үг давтах
            </label>
            <input
              type={showPw ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Дахин оруулна уу"
              className={`w-full px-4 py-3 bg-chimge-bg rounded-xl text-sm border focus:outline-none transition-colors
                ${confirm && confirm !== password ? "border-chimge-warn" : "border-chimge-line focus:border-chimge-primary"}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-chimge-primary text-chimge-white font-semibold text-sm
                       hover:bg-chimge-primary-hover transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
          </button>
        </form>

        <p className="text-center text-sm text-chimge-ink-2 mt-6">
          Аль хэдийн бүртгэлтэй?{" "}
          <Link
            href="/login"
            className="text-chimge-primary font-semibold hover:underline"
          >
            Нэвтрэх
          </Link>
        </p>
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full mt-4 py-3.5 rounded-xl border border-chimge-line bg-chimge-white text-chimge-ink font-semibold text-sm
                     hover:bg-chimge-bg transition-colors disabled:opacity-60"
        >
          {googleLoading ? "Google бүртгэл..." : "Google-ээр бүртгүүлэх"}
        </button>
      </div>
    </div>
  );
}
