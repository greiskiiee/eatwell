"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X, Plus } from "lucide-react";

interface Props {
  values: string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  values,
  onChange,
  onUpload,
  label = "Зургууд",
  maxImages = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList).slice(0, maxImages - values.length);
    if (files.length === 0) {
      setError(`Хамгийн ихдээ ${maxImages} зураг`);
      return;
    }

    setError("");
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          setError("Зураг бүр 5MB-аас ихгүй байх ёстой");
          continue;
        }
        const url = await onUpload(file);
        uploaded.push(url);
      }
      if (uploaded.length > 0) {
        onChange([...values, ...uploaded]);
      }
    } catch (err: unknown) {
      const data =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { error?: string } }).data
          : undefined;
      if (data?.error === "CLOUDINARY_NOT_CONFIGURED") {
        setError("Cloudinary тохиргоо хийгдээгүй байна");
      } else {
        setError("Зураг оруулахад алдаа гарлаа");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  const canAddMore = values.length < maxImages;

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
          {label}{" "}
          <span className="font-normal normal-case text-[#B8A898]">
            ({values.length}/{maxImages})
          </span>
        </p>
      )}

      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {values.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#D6C9B4]"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 text-white
                           flex items-center justify-center hover:bg-black/70"
                aria-label="Зураг хасах"
              >
                <X size={14} />
              </button>
              {i === 0 && (
                <span
                  className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wide
                                 px-2 py-0.5 rounded-full bg-[#B84230] text-white"
                >
                  Нүүр
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed
                     border-[#D6C9B4] bg-white hover:bg-[#EFE8DA]/60 transition-colors
                     disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 size={18} className="text-[#B84230] animate-spin shrink-0" />
          ) : values.length === 0 ? (
            <Upload size={18} className="text-[#9C8878] shrink-0" />
          ) : (
            <Plus size={18} className="text-[#9C8878] shrink-0" />
          )}
          <div className="text-left">
            <p className="text-[13px] font-semibold text-[#5C4A3A]">
              {uploading
                ? "Оруулж байна..."
                : values.length === 0
                  ? "Зураг сонгох"
                  : "Зураг нэмэх"}
            </p>
            <p className="text-[11px] text-[#9C8878]">
              JPG, PNG, WebP — олон зураг сонгож болно
            </p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-xs text-[#B84230] bg-[#FBF0E6] px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
