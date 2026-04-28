"use client";

import { useState } from "react";
import Link from "next/link";
// import { auth as authApi } from "@/lib/api";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      //   await authApi.resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold text-chimge-primary mb-1">
          Eatwell+
        </h1>
      </div>

      <div className="w-full max-w-sm bg-chimge-white rounded-3xl shadow-card p-8 border border-chimge-line/50">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-chimge-success-soft flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#3A7D44"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0-8 5-8-5"
                />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-chimge-ink mb-2">
              И-мэйл илгээгдлээ!
            </h2>
            <p className="text-sm text-chimge-ink-2 leading-relaxed mb-6">
              <strong>{email}</strong> хаяг руу нууц үг сэргээх нэг удаагийн код
              илгээлээ. Имэйлээ шалгана уу.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-xl bg-chimge-primary text-chimge-white text-sm font-semibold
                         hover:bg-chimge-primary-hover transition-colors"
            >
              Нэвтрэх хуудасруу
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-chimge-ink-3 hover:text-chimge-ink-2 mb-5"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
              </svg>
              Нэвтрэх
            </Link>

            <h2 className="font-display text-xl font-semibold text-chimge-ink mb-2">
              Нууц үг сэргээх
            </h2>
            <p className="text-sm text-chimge-ink-2 mb-6">
              Бүртгэлтэй и-мэйлээ оруулна уу. Нэг удаагийн код илгээнэ.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-chimge-warn-soft text-chimge-warn text-sm border border-chimge-warn/20">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-chimge-primary text-chimge-white font-semibold text-sm
                           hover:bg-chimge-primary-hover transition-colors disabled:opacity-60"
              >
                {loading ? "Илгээж байна..." : "Код илгээх"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
