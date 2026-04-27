"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ScanLine,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

interface ScannerModalProps {
  onClose: () => void;
}

interface Nutriments {
  "energy-kcal_100g"?: number;
  sugars_100g?: number;
  fat_100g?: number;
  "saturated-fat_100g"?: number;
  salt_100g?: number;
  proteins_100g?: number;
  fiber_100g?: number;
}

interface Product {
  product_name?: string;
  brands?: string;
  image_url?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  nutriments?: Nutriments;
}

const THRESHOLDS = {
  sugars: { low: 5, high: 22.5 },
  fat: { low: 3, high: 17.5 },
  saturated: { low: 1.5, high: 5 },
  salt: { low: 0.3, high: 1.5 },
  calories: { low: 100, high: 400 },
};

type Level = "low" | "medium" | "high";

function getLevel(value: number, low: number, high: number): Level {
  if (value <= low) return "low";
  if (value <= high) return "medium";
  return "high";
}

const LEVEL_STYLES: Record<Level, { bg: string; text: string; label: string }> =
  {
    low: { bg: "bg-chimge-sage-soft", text: "text-chimge-sage", label: "Бага" },
    medium: {
      bg: "bg-chimge-gold-soft",
      text: "text-chimge-gold",
      label: "Дунд",
    },
    high: { bg: "bg-chimge-warn-soft", text: "text-chimge-warn", label: "Их" },
  };

const NUTRISCORE_STYLES: Record<string, string> = {
  a: "bg-[#038141] text-white",
  b: "bg-[#85BB2F] text-white",
  c: "bg-[#FECB02] text-chimge-ink",
  d: "bg-[#EE8100] text-white",
  e: "bg-[#E63E11] text-white",
};

function getVerdict(n: Nutriments) {
  const warn: string[] = [];
  const good: string[] = [];

  const sugar = n.sugars_100g ?? 0;
  const fat = n.fat_100g ?? 0;
  const sat = n["saturated-fat_100g"] ?? 0;
  const salt = n.salt_100g ?? 0;
  const kcal = n["energy-kcal_100g"] ?? 0;
  const prot = n.proteins_100g ?? 0;
  const fiber = n.fiber_100g ?? 0;

  if (sugar > 22.5) warn.push(`Хэт их сахар — ${sugar.toFixed(1)}г/100г`);
  else if (sugar < 5) good.push("Сахрын агуулга бага ✓");

  if (fat > 17.5) warn.push(`Хэт их өөх тос — ${fat.toFixed(1)}г/100г`);
  else if (fat < 3) good.push("Өөх тосны агуулга бага ✓");

  if (sat > 5) warn.push(`Ханасан өөх тос их — ${sat.toFixed(1)}г/100г`);
  if (salt > 1.5) warn.push(`Давсны агуулга өндөр — ${salt.toFixed(2)}г/100г`);
  if (kcal > 400) warn.push(`Калори өндөр — ${Math.round(kcal)} ккал/100г`);
  if (prot > 10) good.push(`Уургийн агуулга сайн — ${prot.toFixed(1)}г ✓`);
  if (fiber > 3)
    good.push(`Эслэгийн агуулга хангалттай — ${fiber.toFixed(1)}г ✓`);

  return { warn, good };
}

function NutrientRow({
  label,
  value,
  unit,
  low,
  high,
}: {
  label: string;
  value: number;
  unit: string;
  low: number;
  high: number;
}) {
  const level = getLevel(value, low, high);
  const s = LEVEL_STYLES[level];
  const pct = Math.min((value / (high * 1.5)) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="w-[120px] text-[12px] text-chimge-ink-2 flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 h-2 bg-chimge-line rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            level === "low"
              ? "bg-chimge-sage"
              : level === "medium"
                ? "bg-chimge-gold"
                : "bg-chimge-warn"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-[64px] text-right text-[12px] font-medium text-chimge-ink flex-shrink-0">
        {value.toFixed(1)}
        {unit}
      </div>
      <span
        className={`text-[10px] font-semibold px-2 py-[2px] rounded-full ${s.bg} ${s.text} w-[38px] text-center flex-shrink-0`}
      >
        {s.label}
      </span>
    </div>
  );
}

type Stage = "scanning" | "loading" | "found" | "notfound" | "error";

export function ScannerModal({ onClose }: ScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [stage, setStage] = useState<Stage>("scanning");
  const [product, setProduct] = useState<Product | null>(null);
  const [barcode, setBarcode] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showIngr, setShowIngr] = useState(false);

  async function fetchProduct(code: string) {
    setStage("loading");
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      );
      const data = (await res.json()) as { status: number; product: Product };
      if (data.status === 1 && data.product) {
        setProduct(data.product);
        setStage("found");
      } else {
        setStage("notfound");
      }
    } catch {
      setStage("notfound");
    }
  }

  async function startScanner() {
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      if (!videoRef.current) return;

      let done = false;
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result) => {
          if (done || !result) return;
          done = true;
          controls.stop();
          const code = result.getText();
          setBarcode(code);
          await fetchProduct(code);
        },
      );
      controlsRef.current = controls;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setErrMsg(
        msg.includes("ermission")
          ? "Камерын зөвшөөрөл олгоно уу."
          : "Камер нээгдсэнгүй. Хөтчийнхөө тохиргоог шалгана уу.",
      );
      setStage("error");
    }
  }

  // Start scanner on mount, stop on unmount
  useEffect(() => {
    startScanner();
    return () => {
      controlsRef.current?.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function rescan() {
    controlsRef.current?.stop();
    setStage("scanning");
    setProduct(null);
    setBarcode("");
    setShowIngr(false);
    await startScanner();
  }

  const n = product?.nutriments ?? {};
  const verdict = product ? getVerdict(n) : { warn: [], good: [] };
  const scoreGrade = product?.nutriscore_grade?.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-200 bg-[rgba(34,28,22,0.72)] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-110 bg-white rounded-3xl overflow-hidden shadow-2xl animate-modal-in flex flex-col"
        style={{ maxHeight: "calc(100vh - 32px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-chimge-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-chimge-primary-soft flex items-center justify-center">
              <ScanLine size={16} className="text-chimge-primary" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-chimge-ink">
                Баркод скан
              </div>
              <div className="text-[11px] text-chimge-ink-3">
                {stage === "scanning" && "Бараагаа камерт харуул"}
                {stage === "loading" && "Мэдээлэл ачаалж байна..."}
                {stage === "found" && (barcode || "Бараа олдлоо")}
                {stage === "notfound" && "Бараа олдсонгүй"}
                {stage === "error" && "Алдаа гарлаа"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-chimge-bg flex items-center justify-center text-chimge-ink-3 hover:bg-chimge-line transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Scanning */}
          {stage === "scanning" && (
            <div className="relative bg-chimge-ink">
              <video
                ref={videoRef}
                className="w-full h-70 object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-50 h-32.5">
                  {[
                    "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg",
                    "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg",
                    "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg",
                    "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg",
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute w-7 h-7 border-chimge-primary ${cls}`}
                    />
                  ))}
                  <div className="absolute left-2 right-2 h-0.5 bg-chimge-primary top-1/2 opacity-90" />
                </div>
              </div>
              <p className="absolute bottom-3 inset-x-0 text-center text-white/60 text-[12px]">
                Баркодыг хүрэлцэх болтол ойртуул
              </p>
            </div>
          )}

          {/* Loading */}
          {stage === "loading" && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-chimge-primary border-t-transparent animate-spin" />
              <p className="text-[13px] text-chimge-ink-3">
                Бүтээгдэхүүний мэдээлэл хайж байна...
              </p>
              <p className="text-[11px] text-chimge-ink-3 font-mono bg-chimge-bg px-3 py-1 rounded-lg">
                {barcode}
              </p>
            </div>
          )}

          {/* Not found */}
          {stage === "notfound" && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-chimge-gold-soft flex items-center justify-center">
                <AlertTriangle size={24} className="text-chimge-gold" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-chimge-ink mb-1">
                  Мэдээлэл олдсонгүй
                </div>
                <div className="text-[13px] text-chimge-ink-3 leading-relaxed">
                  Баркод{" "}
                  <span className="font-mono text-chimge-ink bg-chimge-bg px-1.5 py-0.5 rounded">
                    {barcode}
                  </span>{" "}
                  нь мэдээллийн санд байхгүй байна.
                </div>
              </div>
              <button
                onClick={rescan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[13px] font-semibold hover:bg-chimge-primary-dk transition-colors"
              >
                <RotateCcw size={14} /> Дахин скан хийх
              </button>
            </div>
          )}

          {/* Error */}
          {stage === "error" && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-chimge-warn-soft flex items-center justify-center">
                <X size={24} className="text-chimge-warn" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-chimge-ink mb-1">
                  Камер нээгдсэнгүй
                </div>
                <div className="text-[13px] text-chimge-ink-3 leading-relaxed">
                  {errMsg}
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[13px] font-semibold hover:bg-chimge-primary-dk transition-colors"
              >
                Хаах
              </button>
            </div>
          )}

          {/* Found */}
          {stage === "found" && product && (
            <div className="px-5 py-5 flex flex-col gap-5">
              {/* Product identity */}
              <div className="flex gap-3 items-start">
                {product.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-16 h-16 rounded-xl object-contain bg-chimge-bg border border-chimge-line shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-semibold text-chimge-ink leading-snug">
                    {product.product_name || "Нэргүй бараа"}
                  </div>
                  {product.brands && (
                    <div className="text-[12px] text-chimge-ink-3 mt-0.5">
                      {product.brands}
                    </div>
                  )}
                  {scoreGrade && NUTRISCORE_STYLES[scoreGrade] && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-chimge-ink-3">
                        Nutri-score
                      </span>
                      <span
                        className={`text-[13px] font-bold px-2.5 py-0.5 rounded-md uppercase ${NUTRISCORE_STYLES[scoreGrade]}`}
                      >
                        {scoreGrade}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verdict */}
              {(verdict.warn.length > 0 || verdict.good.length > 0) && (
                <div className="flex flex-col gap-2">
                  {verdict.warn.map((w) => (
                    <div
                      key={w}
                      className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-chimge-warn-soft border border-chimge-warn/20"
                    >
                      <AlertTriangle
                        size={14}
                        className="text-chimge-warn shrink-0 mt-0.5"
                      />
                      <span className="text-[12.5px] font-medium text-chimge-warn">
                        {w}
                      </span>
                    </div>
                  ))}
                  {verdict.good.map((g) => (
                    <div
                      key={g}
                      className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-chimge-sage-soft border border-chimge-sage/20"
                    >
                      <CheckCircle
                        size={14}
                        className="text-chimge-sage shrink-0 mt-0.5"
                      />
                      <span className="text-[12.5px] font-medium text-chimge-sage">
                        {g}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Nutrition bars */}
              <div>
                <div className="text-[11px] font-bold text-chimge-ink-3 uppercase tracking-[0.5px] mb-3">
                  Тэжээллэг чанар (100г тутамд)
                </div>
                <div className="flex flex-col gap-2.5">
                  {n["energy-kcal_100g"] != null && (
                    <NutrientRow
                      label="Калори"
                      value={n["energy-kcal_100g"]!}
                      unit=" ккал"
                      low={THRESHOLDS.calories.low}
                      high={THRESHOLDS.calories.high}
                    />
                  )}
                  {n.sugars_100g != null && (
                    <NutrientRow
                      label="Сахар"
                      value={n.sugars_100g!}
                      unit="г"
                      low={THRESHOLDS.sugars.low}
                      high={THRESHOLDS.sugars.high}
                    />
                  )}
                  {n.fat_100g != null && (
                    <NutrientRow
                      label="Өөх тос"
                      value={n.fat_100g!}
                      unit="г"
                      low={THRESHOLDS.fat.low}
                      high={THRESHOLDS.fat.high}
                    />
                  )}
                  {n["saturated-fat_100g"] != null && (
                    <NutrientRow
                      label="Ханасан өөх тос"
                      value={n["saturated-fat_100g"]!}
                      unit="г"
                      low={THRESHOLDS.saturated.low}
                      high={THRESHOLDS.saturated.high}
                    />
                  )}
                  {n.salt_100g != null && (
                    <NutrientRow
                      label="Давс"
                      value={n.salt_100g!}
                      unit="г"
                      low={THRESHOLDS.salt.low}
                      high={THRESHOLDS.salt.high}
                    />
                  )}
                  {n.proteins_100g != null && (
                    <div className="flex items-center gap-3">
                      <div className="w-30px text-[12px] text-chimge-ink-2 shrink-0">
                        Уураг
                      </div>
                      <div className="flex-1 text-[12px] text-chimge-ink">
                        {n.proteins_100g.toFixed(1)}г
                      </div>
                    </div>
                  )}
                  {n.fiber_100g != null && (
                    <div className="flex items-center gap-3">
                      <div className="w-30 text-[12px] text-chimge-ink-2 shrink-0">
                        Эслэг
                      </div>
                      <div className="flex-1 text-[12px] text-chimge-ink">
                        {n.fiber_100g.toFixed(1)}г
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients collapsible */}
              {product.ingredients_text && (
                <div className="border border-chimge-line rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowIngr((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-chimge-bg text-[13px] font-semibold text-chimge-ink hover:bg-chimge-line transition-colors"
                  >
                    <span>Найрлага</span>
                    {showIngr ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {showIngr && (
                    <div className="px-4 py-3 text-[12px] text-chimge-ink-2 leading-relaxed border-t border-chimge-line">
                      {product.ingredients_text}
                    </div>
                  )}
                </div>
              )}

              {/* Rescan */}
              <button
                onClick={rescan}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-chimge-line text-[13px] font-medium text-chimge-ink-2 hover:bg-chimge-bg transition-colors"
              >
                <RotateCcw size={14} /> Дахин скан хийх
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
