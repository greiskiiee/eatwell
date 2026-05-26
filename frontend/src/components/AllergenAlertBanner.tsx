import { AlertTriangle } from "lucide-react";

interface Props {
  matched: string[];
  labelFor?: (mealDbName: string) => string;
}

export function AllergenAlertBanner({ matched, labelFor }: Props) {
  if (matched.length === 0) return null;

  const display = labelFor
    ? matched.map(labelFor).join(", ")
    : matched.join(", ");

  return (
    <div
      role="alert"
      className="flex gap-3 p-4 rounded-2xl border-2 border-[#FCA5A5] bg-[#FEF2F2]
                 text-[#991B1B] shadow-sm"
    >
      <AlertTriangle size={22} className="shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#B91C1C]">
          Анхааруулга: таны харшлын орц агуулсан
        </p>
        <p className="text-[13px] mt-1 text-[#991B1B]/90">
          Энэ жоронд таны мэдэгдсэн харшилтай орц байна:{" "}
          <span className="font-semibold">{display}</span>
        </p>
      </div>
    </div>
  );
}
