"use client";

import Image from "next/image";
import { User } from "lucide-react";

type Props = {
  name?: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
};

export function UserAvatar({
  name,
  avatarUrl,
  size = 28,
  className = "",
}: Props) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "";
  const box = `rounded-full bg-[#C58772] text-[#FFF8EC] flex items-center justify-center font-semibold shrink-0 overflow-hidden relative ${className}`;

  if (avatarUrl?.trim()) {
    return (
      <div className={box} style={{ width: size, height: size }}>
        <Image
          src={avatarUrl}
          alt={name ? `${name} profile` : ""}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={box}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
    >
      {initial || <User size={Math.max(12, size * 0.46)} />}
    </div>
  );
}
