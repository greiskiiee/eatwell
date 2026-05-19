"use client";

import Link from "next/link";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export function LoginRequiredModal({
  open,
  onClose,
  title = "Нэвтэрнэ үү",
  message = "Жор хадгалахын тулд эхлээд нэвтэрч орно уу.",
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Хаах"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl border border-[#D6C9B4]
                   shadow-[var(--shadow-modal)] p-6 animate-[var(--animate-modal-in)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9C8878] hover:text-[#5C4A3A] transition-colors"
          aria-label="Хаах"
        >
          <X size={18} />
        </button>
        <h2
          id="login-required-title"
          className="font-display text-[1.25rem] font-semibold text-[#221C16] pr-8"
        >
          {title}
        </h2>
        <p className="mt-2 text-[13.5px] text-[#5C4A3A] leading-relaxed">{message}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/login"
            onClick={onClose}
            className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#B84230] text-white
                       text-[13px] font-semibold hover:bg-[#9C3426] transition-colors"
          >
            Нэвтрэх
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            className="flex-1 text-center px-4 py-2.5 rounded-xl border border-[#D6C9B4] bg-white
                       text-[#5C4A3A] text-[13px] font-semibold hover:border-[#9C8878] transition-colors"
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    </div>
  );
}
