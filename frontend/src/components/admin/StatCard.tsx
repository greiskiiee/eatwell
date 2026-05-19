import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success" | "brand";
}

const TONE_STYLES = {
  default: {
    wrap: "bg-white border-[#D6C9B4]/70",
    icon: "bg-[#EFE8DA] text-[#5C4A3A]",
    value: "text-[#221C16]",
  },
  warning: {
    wrap: "bg-[#FBF0E6] border-[#E8C4A0]/80",
    icon: "bg-[#F5DFC8] text-[#B85E1A]",
    value: "text-[#B85E1A]",
  },
  success: {
    wrap: "bg-[#EDF5F0] border-[#B8D4C4]/80",
    icon: "bg-[#D4E8DC] text-[#2D5A4A]",
    value: "text-[#2D5A4A]",
  },
  brand: {
    wrap: "bg-white border-[#D6C9B4]/70",
    icon: "bg-[#B84230]/12 text-[#B84230]",
    value: "text-[#B84230]",
  },
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: Props) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${styles.wrap}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
            {label}
          </p>
          <p
            className={`font-display text-2xl sm:text-3xl font-semibold mt-1 tabular-nums ${styles.value}`}
          >
            {value}
          </p>
          {hint && (
            <p className="text-[12px] text-[#9C8878] mt-1 truncate">{hint}</p>
          )}
        </div>
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.icon}`}
        >
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}
