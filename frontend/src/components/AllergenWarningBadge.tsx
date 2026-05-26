import { AlertTriangle } from "lucide-react";

interface Props {
  matched?: string[];
  /** compact for cards; full shows allergen list on detail */
  variant?: "compact" | "full";
  className?: string;
}

export function AllergenWarningBadge({
  matched = [],
  variant = "compact",
  className = "",
}: Props) {
  if (matched.length === 0) return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 font-bold uppercase tracking-wide",
        variant === "compact"
          ? "text-[9px] px-2 py-0.5 rounded-full bg-[#DC2626] text-white shadow-sm"
          : "text-[11px] px-3 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
        className,
      ].join(" ")}
      title={
        matched.length > 0
          ? `Харшил: ${matched.join(", ")}`
          : "Таны харшлын орц агуулсан"
      }
    >
      <AlertTriangle size={variant === "compact" ? 10 : 13} className="shrink-0" />
      {variant === "compact" ? "Харшил" : `Харшил — ${matched.join(", ")}`}
    </span>
  );
}
