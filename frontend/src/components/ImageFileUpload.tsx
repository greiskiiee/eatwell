"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  hint?: string;
  previewClassName?: string;
}

export function ImageFileUpload({
  value,
  onChange,
  onUpload,
  label = "Зураг",
  hint = "JPG, PNG, WebP — хамгийн ихдээ 5MB",
  previewClassName = "h-48",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Зөвхөн зураг оруулна уу");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл 5MB-аас их байна");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err: unknown) {
      const data =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { error?: string } }).data
          : undefined;
      if (data?.error === "CLOUDINARY_NOT_CONFIGURED") {
        setError("Cloudinary тохиргоо хийгдээгүй байна (.env)");
      } else {
        setError("Зураг оруулахад алдаа гарлаа");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
          {label}
        </p>
      )}

      {value ? (
        <div
          className={`relative w-full ${previewClassName} rounded-xl overflow-hidden border border-[#D6C9B4]`}
        >
          <Image
            src={value}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white
                       flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Зураг хасах"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed
                   border-[#D6C9B4] bg-white hover:bg-[#EFE8DA]/60 transition-colors
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <Loader2 size={18} className="text-[#B84230] animate-spin shrink-0" />
        ) : (
          <Upload size={18} className="text-[#9C8878] shrink-0" />
        )}
        <div className="text-left">
          <p className="text-[13px] font-semibold text-[#5C4A3A]">
            {uploading ? "Оруулж байна..." : value ? "Зураг солих" : "Зураг сонгох"}
          </p>
          <p className="text-[11px] text-[#9C8878]">{hint}</p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {error && (
        <p className="text-xs text-[#B84230] bg-[#FBF0E6] px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
