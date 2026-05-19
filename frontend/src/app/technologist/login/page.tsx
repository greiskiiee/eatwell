"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/UserContext";
import { technologistAuthApi } from "@/lib/technologistAuth";
import type { ApiError } from "@/lib/api";
import { FlaskConical } from "lucide-react";

export default function TechnologistLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await technologistAuthApi.login(email, password);
      setAuth(token, user);
      router.replace("/home");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const data = apiErr?.data as { error?: string; rejectionReason?: string } | undefined;
      const code = data?.error;

      if (code === "APPROVAL_PENDING") {
        setError(
          "Таны бүртгэл хараахан батлагдаагүй байна. Админ баталгаажуулсны дараа нэвтэрнэ үү.",
        );
      } else if (code === "APPROVAL_REJECTED") {
        setError(
          data?.rejectionReason
            ? `Бүртгэл татгалзагдсан: ${data.rejectionReason}`
            : "Бүртгэл татгалзагдсан. Дахин бүртгүүлэх эсвэл админтай холбогдоно уу.",
        );
      } else {
        setError("И-мэйл эсвэл нууц үг буруу байна");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-[#F5F0E8] to-[#EFE8DA]">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D5A4A] text-white mb-4">
          <FlaskConical size={28} />
        </div>
        <h1 className="font-display text-3xl font-semibold text-[#2D5A4A] mb-1">
          Хоол технологийн портал
        </h1>
        <p className="text-sm text-[#5C4A3A]">
          Баталгаажсан мэргэжилтнүүдэд зориулсан нэвтрэх хуудас
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 border border-[#2D5A4A]/15">
        <h2 className="font-display text-xl font-semibold text-[#221C16] mb-2">
          Технологийн нэвтрэх
        </h2>
        <p className="text-xs text-[#9C8878] mb-6">
          Энгийн хэрэглэгчийн нэвтрэх биш — зөвхөн батлагдсан технологид
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[#FBF0E6] text-[#B84230] text-sm font-medium border border-[#B84230]/20">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              И-мэйл
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tech@email.mn"
              className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              Нууц үг
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C8878] text-xs"
              >
                {showPw ? "Нуух" : "Харах"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-xs text-[#2D5A4A] hover:underline"
            >
              Нууц үг мартсан?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2D5A4A] text-white font-semibold text-sm hover:bg-[#234A3D] disabled:opacity-60"
          >
            {loading ? "Нэвтрэж байна..." : "Нэвтрэх"}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C4A3A] mt-6">
          Бүртгэл байхгүй?{" "}
          <Link
            href="/technologist/signup"
            className="text-[#2D5A4A] font-semibold hover:underline"
          >
            Бүртгүүлэх
          </Link>
        </p>
        <p className="text-center text-xs text-[#9C8878] mt-3">
          <Link href="/login" className="hover:underline">
            ← Энгийн хэрэглэгчийн нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
