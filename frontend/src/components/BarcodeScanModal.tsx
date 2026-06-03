"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  ScanLine,
  AlertTriangle,
  RotateCcw,
  Loader2,
  PackagePlus,
  ChevronLeft,
} from "lucide-react";
import {
  fetchProduct,
  getHealthVerdict,
  getProductImage,
  getProductIngredients,
  getProductName,
  localProductToOff,
  type OffProduct,
} from "@/lib/openfoodfacts";
import { productApi, type LocalProduct } from "@/lib/products";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Stage =
  | "scanning"
  | "loading"
  | "found"
  | "notfound"
  | "addform"
  | "submitting"
  | "error";

type Source = "local" | "openfoodfacts" | null;

const GRADE_OPTIONS: { value: string; label: string; helper: string }[] = [
  { value: "a", label: "A", helper: "Маш эрүүл" },
  { value: "b", label: "B", helper: "Эрүүл" },
  { value: "c", label: "C", helper: "Дунд зэрэг" },
  { value: "d", label: "D", helper: "Эрүүл бус" },
  { value: "e", label: "E", helper: "Маш эрүүл бус" },
];

interface FormState {
  name: string;
  brand: string;
  imageUrl: string;
  ingredientsText: string;
  nutriscoreGrade: string;
  energyKcal100g: string;
  sugars100g: string;
  fat100g: string;
  saturatedFat100g: string;
  salt100g: string;
  proteins100g: string;
  fiber100g: string;
  allergens: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  brand: "",
  imageUrl: "",
  ingredientsText: "",
  nutriscoreGrade: "",
  energyKcal100g: "",
  sugars100g: "",
  fat100g: "",
  saturatedFat100g: "",
  salt100g: "",
  proteins100g: "",
  fiber100g: "",
  allergens: "",
};

function toNumberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function BarcodeScanModal({ open, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [stage, setStage] = useState<Stage>("scanning");
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [productSource, setProductSource] = useState<Source>(null);
  const [barcode, setBarcode] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [manualInputError, setManualInputError] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState("");

  const stopScanner = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {
      // ignore
    }
    controlsRef.current = null;
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const reset = useCallback(() => {
    setStage("scanning");
    setProduct(null);
    setProductSource(null);
    setBarcode("");
    setManualInput("");
    setManualInputError("");
    setErrMsg("");
    setForm(EMPTY_FORM);
    setSubmitError("");
  }, []);

  const lookupProduct = useCallback(async (code: string) => {
    setStage("loading");

    try {
      const local = await productApi.getByBarcode(code);
      if (local) {
        setProduct(localProductToOff(local));
        setProductSource("local");
        setStage("found");
        return;
      }
    } catch {
      // ignore, continue to OFF
    }

    try {
      const data = await fetchProduct(code);
      if (data.status === 1 && data.product) {
        setProduct(data.product);
        setProductSource("openfoodfacts");
        setStage("found");
        return;
      }
    } catch {
      // ignore, fall through to notfound
    }

    setStage("notfound");
  }, []);

  const startScanner = useCallback(async () => {
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      if (!videoRef.current) return;

      const reader = new BrowserMultiFormatReader();
      let done = false;

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (done || !result) return;
          done = true;
          try {
            controls.stop();
          } catch {
            // ignore
          }
          controlsRef.current = null;
          const code = result.getText();
          setBarcode(code);
          void lookupProduct(code);
        },
      );
      controlsRef.current = controls;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      const lowered = msg.toLowerCase();
      setErrMsg(
        lowered.includes("permission") || lowered.includes("notallowed")
          ? "Камерын зөвшөөрөл олгоно уу."
          : "Камер нээгдсэнгүй. Хөтчийнхөө тохиргоог шалгана уу.",
      );
      setStage("error");
    }
  }, [lookupProduct]);

  useEffect(() => {
    if (!open) {
      stopScanner();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reset();
      return;
    }
    document.body.style.overflow = "hidden";
    void startScanner();
    return () => {
      document.body.style.overflow = "";
      stopScanner();
    };
  }, [open, startScanner, stopScanner, reset]);

  const rescan = useCallback(async () => {
    stopScanner();
    reset();
    await startScanner();
  }, [reset, startScanner, stopScanner]);

  const submitManualBarcode = useCallback(() => {
    const code = manualInput.replace(/\D/g, "");
    if (code.length < 8) {
      setManualInputError("Баркод дор хаяж 8 оронтой байна");
      return;
    }
    setManualInputError("");
    stopScanner();
    setBarcode(code);
    void lookupProduct(code);
  }, [manualInput, lookupProduct, stopScanner]);

  function openAddForm() {
    setForm({ ...EMPTY_FORM });
    setSubmitError("");
    setStage("addform");
  }

  async function submitAddForm(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode) return;
    if (!form.name.trim()) {
      setSubmitError("Бүтээгдэхүүний нэр оруулна уу");
      return;
    }
    setSubmitError("");
    setStage("submitting");

    try {
      const allergens = form.allergens
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const saved: LocalProduct = await productApi.create({
        barcode,
        name: form.name.trim(),
        brand: form.brand.trim(),
        imageUrl: form.imageUrl.trim(),
        ingredientsText: form.ingredientsText,
        nutriscoreGrade: form.nutriscoreGrade,
        allergens,
        nutriments: {
          energyKcal100g: toNumberOrUndefined(form.energyKcal100g),
          sugars100g: toNumberOrUndefined(form.sugars100g),
          fat100g: toNumberOrUndefined(form.fat100g),
          saturatedFat100g: toNumberOrUndefined(form.saturatedFat100g),
          salt100g: toNumberOrUndefined(form.salt100g),
          proteins100g: toNumberOrUndefined(form.proteins100g),
          fiber100g: toNumberOrUndefined(form.fiber100g),
        },
      });

      setProduct(localProductToOff(saved));
      setProductSource("local");
      setStage("found");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setSubmitError(msg || "Бүтээгдэхүүн нэмэхэд алдаа гарлаа");
      setStage("addform");
    }
  }

  if (!open) return null;

  const verdict = getHealthVerdict(product?.nutriscore_grade);
  const productImage = product ? getProductImage(product) : null;
  const productName = product ? getProductName(product) : "";
  const ingredientsText = product ? getProductIngredients(product) : "";

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Хаах"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl
                   border border-[#D6C9B4] shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE8DA] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F5E6E2] flex items-center justify-center shrink-0">
              <ScanLine size={16} className="text-[#B84230]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#9C8878] uppercase tracking-wider">
                Баркод скан
              </p>
              <p className="text-[13px] font-semibold text-[#221C16] truncate">
                {stage === "scanning" && "Бараагаа камерт харуул"}
                {stage === "loading" && "Уншиж байна..."}
                {stage === "found" && (barcode || "Бараа олдлоо")}
                {stage === "notfound" && "Бараа олдсонгүй"}
                {stage === "addform" && "Бүтээгдэхүүн нэмэх"}
                {stage === "submitting" && "Хадгалж байна..."}
                {stage === "error" && "Камерын алдаа"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9C8878] hover:bg-[#EFE8DA] shrink-0"
            aria-label="Хаах"
          >
            <X size={18} />
          </button>
        </div>

        {stage === "scanning" && (
          <>
            <div className="relative bg-[#221C16]">
              <video
                ref={videoRef}
                className="w-full aspect-4/3 object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-3/5 aspect-3/2">
                  {[
                    "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg",
                    "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg",
                    "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg",
                    "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg",
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute w-7 h-7 border-[#B84230] ${cls}`}
                    />
                  ))}
                  <div className="absolute left-2 right-2 h-0.5 bg-[#B84230] top-1/2 opacity-90" />
                </div>
              </div>
              <p className="absolute bottom-3 inset-x-0 text-center text-white/70 text-[11.5px]">
                Баркодыг хүрээний дунд барина уу
              </p>
            </div>
            <ManualBarcodeInput
              value={manualInput}
              error={manualInputError}
              onChange={(v) => {
                setManualInput(v);
                if (manualInputError) setManualInputError("");
              }}
              onSubmit={submitManualBarcode}
            />
          </>
        )}

        {(stage === "loading" || stage === "submitting") && (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <Loader2 size={32} className="text-[#B84230] animate-spin" />
            <p className="text-[13px] text-[#5C4A3A]">
              {stage === "submitting"
                ? "Бүтээгдэхүүнийг хадгалж байна..."
                : "Бүтээгдэхүүний мэдээлэл хайж байна..."}
            </p>
            {barcode && (
              <p className="text-[11px] text-[#9C8878] font-mono bg-[#EFE8DA] px-3 py-1 rounded-lg">
                {barcode}
              </p>
            )}
          </div>
        )}

        {stage === "notfound" && (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FBF0E6] flex items-center justify-center">
              <AlertTriangle size={22} className="text-[#B85E1A]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#221C16] mb-1">
                Мэдээлэл олдсонгүй
              </p>
              <p className="text-[12.5px] text-[#9C8878] leading-relaxed">
                Баркод{" "}
                <span className="font-mono text-[#221C16] bg-[#EFE8DA] px-1.5 py-0.5 rounded">
                  {barcode}
                </span>{" "}
                нь Eatwell+ болон OpenFoodFacts-д бүртгэлгүй байна.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B84230] text-white text-[13px] font-semibold hover:bg-[#9C3426] transition-colors"
            >
              <PackagePlus size={15} /> Бүтээгдэхүүн нэмэх
            </button>
            <button
              type="button"
              onClick={rescan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D6C9B4] text-[12.5px] font-medium text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
            >
              <RotateCcw size={13} /> Дахин скан хийх
            </button>
          </div>
        )}

        {stage === "addform" && (
          <form onSubmit={submitAddForm} className="px-5 py-4 space-y-4">
            <button
              type="button"
              onClick={() => setStage("notfound")}
              className="flex items-center gap-1 text-[12px] font-semibold text-[#B84230]"
            >
              <ChevronLeft size={14} /> Буцах
            </button>

            <div className="bg-[#FAF7F0] border border-[#EFE8DA] rounded-xl px-3.5 py-2.5">
              <p className="text-[10px] font-bold text-[#9C8878] uppercase tracking-wider">
                Баркод
              </p>
              <p className="text-[13px] font-mono text-[#221C16]">{barcode}</p>
            </div>

            <Field
              label="Нэр"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="ж.нь. Шар тосон гурил"
            />

            <Field
              label="Брэнд"
              value={form.brand}
              onChange={(v) => setForm({ ...form, brand: v })}
              placeholder="ж.нь. Талх Чихэр"
            />

            <Field
              label="Зургийн URL"
              value={form.imageUrl}
              onChange={(v) => setForm({ ...form, imageUrl: v })}
              placeholder="https://..."
              type="url"
            />

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                Найрлага
              </label>
              <textarea
                rows={3}
                value={form.ingredientsText}
                onChange={(e) =>
                  setForm({ ...form, ingredientsText: e.target.value })
                }
                placeholder="Гурил, сахар, сүү, давс..."
                className="w-full px-3 py-2 rounded-xl border border-[#D6C9B4]
                           text-[13px] text-[#221C16] focus:border-[#B84230] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                Эрүүл мэндийн зэрэг (Nutri-Score)
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, nutriscoreGrade: "" })}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                    form.nutriscoreGrade === ""
                      ? "bg-[#B84230] text-white border-[#B84230]"
                      : "bg-white text-[#5C4A3A] border-[#D6C9B4] hover:border-[#B84230]"
                  }`}
                >
                  Тодорхойгүй
                </button>
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, nutriscoreGrade: g.value })
                    }
                    title={g.helper}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors uppercase ${
                      form.nutriscoreGrade === g.value
                        ? "bg-[#2D5A4A] text-white border-[#2D5A4A]"
                        : "bg-white text-[#5C4A3A] border-[#D6C9B4] hover:border-[#2D5A4A]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
                Тэжээллэг чанар (100г тутамд)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <NumField
                  label="Калори (ккал)"
                  value={form.energyKcal100g}
                  onChange={(v) => setForm({ ...form, energyKcal100g: v })}
                />
                <NumField
                  label="Сахар (г)"
                  value={form.sugars100g}
                  onChange={(v) => setForm({ ...form, sugars100g: v })}
                />
                <NumField
                  label="Өөх тос (г)"
                  value={form.fat100g}
                  onChange={(v) => setForm({ ...form, fat100g: v })}
                />
                <NumField
                  label="Ханасан өөх (г)"
                  value={form.saturatedFat100g}
                  onChange={(v) => setForm({ ...form, saturatedFat100g: v })}
                />
                <NumField
                  label="Давс (г)"
                  value={form.salt100g}
                  onChange={(v) => setForm({ ...form, salt100g: v })}
                />
                <NumField
                  label="Уураг (г)"
                  value={form.proteins100g}
                  onChange={(v) => setForm({ ...form, proteins100g: v })}
                />
                <NumField
                  label="Эслэг (г)"
                  value={form.fiber100g}
                  onChange={(v) => setForm({ ...form, fiber100g: v })}
                />
              </div>
            </div>

            <Field
              label="Харшил үүсгэгч (таслалаар тусгаарлана)"
              value={form.allergens}
              onChange={(v) => setForm({ ...form, allergens: v })}
              placeholder="gluten, dairy, soy"
            />

            {submitError && (
              <p className="text-[12px] text-[#B84230] bg-[#F5E0DD] border border-[#B84230]/30 rounded-xl px-3 py-2">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#B84230] text-white text-[13px] font-semibold hover:bg-[#9C3426] transition-colors"
            >
              Хадгалах
            </button>
          </form>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5E0DD] flex items-center justify-center">
              <X size={22} className="text-[#B84230]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#221C16] mb-1">
                Камер нээгдсэнгүй
              </p>
              <p className="text-[12.5px] text-[#9C8878] leading-relaxed">
                {errMsg}
              </p>
            </div>
            <ManualBarcodeInput
              value={manualInput}
              error={manualInputError}
              onChange={(v) => {
                setManualInput(v);
                if (manualInputError) setManualInputError("");
              }}
              onSubmit={submitManualBarcode}
              className="w-full text-left"
            />
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#D6C9B4] text-[13px] font-semibold text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
            >
              Хаах
            </button>
          </div>
        )}

        {stage === "found" && product && (
          <div className="px-5 py-5 flex flex-col gap-5">
            <div className="flex gap-3 items-start">
              {productImage ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#EFE8DA] border border-[#D6C9B4] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-[#EFE8DA] border border-[#D6C9B4] shrink-0 flex items-center justify-center text-[#9C8878]">
                  <ScanLine size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-[16px] font-semibold text-[#221C16] leading-snug">
                  {productName}
                </p>
                {product.brands && (
                  <p className="text-[12px] text-[#9C8878] mt-0.5 truncate">
                    {product.brands}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {productSource === "local" && (
                    <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#F5E6E2] text-[#B84230]">
                      Eatwell+
                    </span>
                  )}
                  {productSource === "openfoodfacts" && (
                    <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#EFE8DA] text-[#5C4A3A]">
                      OpenFoodFacts
                    </span>
                  )}
                  {barcode && (
                    <span className="text-[10.5px] text-[#9C8878] font-mono">
                      {barcode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border ${verdict.badgeClass}`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${verdict.dotClass}`}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold uppercase tracking-wide">
                  {verdict.label}
                </p>
                <p className="text-[12px] mt-0.5 opacity-90">
                  {verdict.description}
                </p>
                {product.nutriscore_grade && (
                  <p className="text-[11px] mt-1 opacity-75">
                    Nutri-Score:{" "}
                    <span className="font-bold uppercase">
                      {product.nutriscore_grade}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {ingredientsText && (
              <div>
                <p className="text-[10.5px] font-bold text-[#9C8878] uppercase tracking-wider mb-1.5">
                  Найрлага
                </p>
                <p className="text-[12.5px] text-[#221C16] leading-relaxed bg-[#FAF7F0] border border-[#EFE8DA] rounded-xl px-3.5 py-3 whitespace-pre-wrap">
                  {ingredientsText}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={rescan}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#D6C9B4] text-[13px] font-semibold text-[#5C4A3A] hover:bg-[#EFE8DA] transition-colors"
            >
              <RotateCcw size={14} /> Дахин скан хийх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ManualBarcodeInput({
  value,
  error,
  onChange,
  onSubmit,
  className = "",
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  className?: string;
}) {
  return (
    <div
      className={`px-5 py-4 border-t border-[#EFE8DA] bg-white ${className}`}
    >
      <p className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider mb-2">
        Эсвэл баркодыг гараар оруулна уу
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="8690632007057"
          aria-label="Баркод"
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-[#D6C9B4]
                     text-[13px] font-mono text-[#221C16] focus:border-[#B84230] focus:outline-none"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={value.replace(/\D/g, "").length < 8}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-[#B84230] text-white text-[13px] font-semibold
                     hover:bg-[#9C3426] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Хайх
        </button>
      </div>
      {error && <p className="text-[11.5px] text-[#B84230] mt-2">{error}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "url";
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-[#9C8878] uppercase tracking-wider">
        {label}
        {required && <span className="text-[#B84230] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 rounded-xl border border-[#D6C9B4]
                   text-[13px] text-[#221C16] focus:border-[#B84230] focus:outline-none"
      />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10.5px] font-semibold text-[#5C4A3A]">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full px-3 py-2 rounded-xl border border-[#D6C9B4]
                   text-[13px] text-[#221C16] focus:border-[#B84230] focus:outline-none"
      />
    </div>
  );
}
