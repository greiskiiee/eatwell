import { ALLERGENS } from "@/lib/constants";

interface Props {
  allergenId: string;
  variant?: "warn" | "info" | "selected" | "unselected";
  onClick?: () => void;
}

export default function AllergenPill({
  allergenId,
  variant = "info",
  onClick,
}: Props) {
  const def = ALLERGENS.find((a) => a.id === allergenId);
  const label = def?.label ?? allergenId;
  const emoji = def?.emoji ?? "⚠";

  const styles: Record<string, string> = {
    warn: "bg-chimge-warn-soft text-chimge-warn border-chimge-warn/30",
    info: "bg-chimge-bg text-chimge-ink-2 border-chimge-line",
    selected:
      "bg-chimge-primary-soft text-chimge-primary border-chimge-primary/30",
    unselected:
      "bg-chimge-bg text-chimge-ink-3 border-chimge-line hover:border-chimge-ink-3",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border
                  transition-colors ${styles[variant]} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
