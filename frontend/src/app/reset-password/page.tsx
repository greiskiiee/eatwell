"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";
import type { ApiError } from "@/lib/api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "otp" | "password" | "done";

function mapError(err: unknown): string {
  const data = (err as ApiError)?.data as { error?: string } | undefined;
  switch (data?.error) {
    case "INVALID_OTP":
      return "Код буруу байна. Дахин оролдоно уу.";
    case "OTP_EXPIRED":
      return "Кодын хугацаа дууссан. Шинэ код аваарай.";
    case "TOO_MANY_ATTEMPTS":
      return "Хэт олон удаа буруу оруулсан. Шинэ код аваарай.";
    case "INVALID_RESET_TOKEN":
      return "Сэргээх хугацаа дууссан. Эхнээс эхлэнэ үү.";
    case "VALIDATION_ERROR":
      return "Мэдээлэл буруу байна.";
    default:
      return err instanceof Error ? err.message : "Алдаа гарлаа";
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp() {
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStep("otp");
      setOtp("");
    } catch (err: unknown) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (otp.length !== 4) {
      setError("4 оронтой код оруулна уу.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { resetToken: token } = await authApi.verifyResetOtp(
        email.trim(),
        otp,
      );
      setResetToken(token);
      setStep("password");
    } catch (err: unknown) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.");
      return;
    }
    if (password !== confirm) {
      setError("Нууц үг таарахгүй байна.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, password);
      setStep("done");
    } catch (err: unknown) {
      setError(mapError(err));
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
        {step === "done" ? (
          <div className="text-center py-4">
            <h2 className="font-display text-xl font-semibold text-chimge-ink mb-2">
              Нууц үг шинэчлэгдлээ!
            </h2>
            <p className="text-sm text-chimge-ink-2 leading-relaxed mb-6">
              Шинэ нууц үгээрээ нэвтэрч орно уу.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-block px-6 py-2.5 rounded-xl bg-chimge-primary text-chimge-white text-sm font-semibold
                         hover:bg-chimge-primary-hover transition-colors"
            >
              Нэвтрэх
            </button>
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

            {step === "email" && (
              <>
                <h2 className="font-display text-xl font-semibold text-chimge-ink mb-2">
                  Нууц үг сэргээх
                </h2>
                <p className="text-sm text-chimge-ink-2 mb-6">
                  Бүртгэлтэй и-мэйлээ оруулна уу. 4 оронтой код илгээнэ.
                </p>
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-chimge-warn-soft text-chimge-warn text-sm border border-chimge-warn/20">
                    {error}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendOtp();
                  }}
                  className="space-y-4"
                >
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

            {step === "otp" && (
              <>
                <h2 className="font-display text-xl font-semibold text-chimge-ink mb-2">
                  Код баталгаажуулах
                </h2>
                <p className="text-sm text-chimge-ink-2 mb-6">
                  <strong>{email}</strong> хаяг руу илгээсэн 4 оронтой кодыг оруулна уу.
                </p>
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-chimge-warn-soft text-chimge-warn text-sm border border-chimge-warn/20">
                    {error}
                  </div>
                )}
                <form onSubmit={verifyOtp} className="space-y-5">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={otp}
                      onChange={setOtp}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 4}
                    className="w-full py-3.5 rounded-xl bg-chimge-primary text-chimge-white font-semibold text-sm
                               hover:bg-chimge-primary-hover transition-colors disabled:opacity-60"
                  >
                    {loading ? "Шалгаж байна..." : "Үргэлжлүүлэх"}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void sendOtp()}
                    className="w-full text-sm text-chimge-primary font-medium hover:underline disabled:opacity-60"
                  >
                    Код дахин илгээх
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError("");
                    }}
                    className="w-full text-sm text-chimge-ink-3 hover:text-chimge-ink-2"
                  >
                    И-мэйл солих
                  </button>
                </form>
              </>
            )}

            {step === "password" && (
              <>
                <h2 className="font-display text-xl font-semibold text-chimge-ink mb-2">
                  Шинэ нууц үг
                </h2>
                <p className="text-sm text-chimge-ink-2 mb-6">
                  Шинэ нууц үгээ оруулаад баталгаажуулна уу.
                </p>
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-chimge-warn-soft text-chimge-warn text-sm border border-chimge-warn/20">
                    {error}
                  </div>
                )}
                <form onSubmit={submitPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-chimge-ink-2 mb-1.5 uppercase tracking-wider">
                      Шинэ нууц үг
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-10 bg-chimge-bg rounded-xl text-sm border border-chimge-line focus:border-chimge-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-chimge-ink-3 text-xs"
                      >
                        {showPw ? "Нуух" : "Харах"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-chimge-ink-2 mb-1.5 uppercase tracking-wider">
                      Нууц үг давтах
                    </label>
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`w-full px-4 py-3 bg-chimge-bg rounded-xl text-sm border focus:outline-none transition-colors
                        ${confirm && confirm !== password ? "border-chimge-warn" : "border-chimge-line focus:border-chimge-primary"}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-chimge-primary text-chimge-white font-semibold text-sm
                               hover:bg-chimge-primary-hover transition-colors disabled:opacity-60"
                  >
                    {loading ? "Хадгалж байна..." : "Нууц үг солих"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
