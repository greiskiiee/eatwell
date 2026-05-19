"use client";

import { useState } from "react";
import Link from "next/link";
import { technologistAuthApi } from "@/lib/technologistAuth";
import type { ApiError } from "@/lib/api";
import { FlaskConical, Upload } from "lucide-react";

export default function TechnologistSignupPage() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [credentials, setCredentials] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    if (!certificate) {
      setError("Мэргэжлийн баталгаа эсвэл үнэмлэхийн зураг оруулна уу");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("lastName", lastName);
      form.append("firstName", firstName);
      form.append("name", `${lastName} ${firstName}`.trim());
      form.append("bio", bio);
      form.append("email", email);
      form.append("password", password);
      form.append("credentials", credentials);
      form.append("certificate", certificate);

      await technologistAuthApi.signup(form);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const code =
        typeof apiErr?.data === "object" && apiErr?.data
          ? (apiErr.data as { error?: string }).error
          : undefined;
      if (code === "EMAIL_ALREADY_EXISTS") {
        setError("Энэ и-мэйлээр бүртгэл байна");
      } else {
        setError("Бүртгэл үүсгэх боломжгүй. Дахин оролдоно уу.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-linear-to-b from-[#F5F0E8] to-[#EFE8DA]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 border border-[#2D5A4A]/15 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D5A4A] text-white mb-4">
            <FlaskConical size={28} />
          </div>
          <h2 className="font-display text-xl font-semibold text-[#221C16] mb-3">
            Хүсэлт илгээгдлээ
          </h2>
          <p className="text-sm text-[#5C4A3A] mb-6 leading-relaxed">
            Таны баталгаажуулах баримтыг админ шалгана. Батлагдсаны дараа
            и-мэйлээр мэдэгдэл ирнэ. Дараа нь нэвтрэх хуудаснаас нэвтэрнэ үү.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-xl bg-[#2D5A4A] text-white font-semibold text-sm hover:bg-[#234A3D]"
          >
            Нэвтрэх хуудас руу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-linear-to-b from-[#F5F0E8] to-[#EFE8DA]">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D5A4A] text-white mb-4">
          <FlaskConical size={28} />
        </div>
        <h1 className="font-display text-3xl font-semibold text-[#2D5A4A] mb-1">
          Хүнсний технологич бүртгэл
        </h1>
        <p className="text-sm text-[#5C4A3A]">
          Мэргэжлийн баталгаа / үнэмлэхийн зураг заавал оруулна
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 border border-[#2D5A4A]/15">
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[#FBF0E6] text-[#B84230] text-sm font-medium border border-[#B84230]/20">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Овог + Нэр side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
                Овог
              </label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Овог"
                className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
                Нэр
              </label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Нэр"
                className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
              />
            </div>
          </div>

          {/* Товч мэдээлэл */}
          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              Товч мэдээлэл
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Өөрийн туршлага, чиглэл, ажлын байрны талаар товч бичнэ үү..."
              rows={3}
              className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              И-мэйл
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              Мэргэжлийн зэрэг / байгууллага
            </label>
            <input
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="жнь: ХХИС, Хоол технологич"
              className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              Баталгаа / үнэмлэх (зураг эсвэл PDF)
            </label>
            <label
              className="flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed border-[#2D5A4A]/40
                         bg-[#F5F0E8]/60 cursor-pointer hover:border-[#2D5A4A] transition-colors"
            >
              <Upload size={18} className="text-[#2D5A4A] shrink-0" />
              <span className="text-sm text-[#5C4A3A] truncate">
                {certificate ? certificate.name : "Файл сонгох..."}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setCertificate(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              Нууц үг
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border border-[#D6C9B4] focus:border-[#2D5A4A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C4A3A] mb-1.5 uppercase tracking-wider">
              Нууц үг давтах
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full px-4 py-3 bg-[#F5F0E8] rounded-xl text-sm border focus:outline-none transition-colors
                ${confirm && confirm !== password ? "border-[#B84230]" : "border-[#D6C9B4] focus:border-[#2D5A4A]"}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2D5A4A] text-white font-semibold text-sm hover:bg-[#234A3D] disabled:opacity-60"
          >
            {loading ? "Илгээж байна..." : "Хүсэлт илгээх"}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C4A3A] mt-6">
          Бүртгэлтэй бол{" "}
          <Link
            href="/login"
            className="text-[#2D5A4A] font-semibold hover:underline"
          >
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
