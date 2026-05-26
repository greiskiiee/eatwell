"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { CheckCircle2, X, Camera, Loader2 } from "lucide-react";
import {
  PAYMENT_METHODS,
  buildQpayPayload,
  isEatwellPaymentQr,
  type PaymentMethod,
} from "@/lib/purchases";
import { useAuth } from "@/context/UserContext";
import { usePurchasedRecipes } from "@/context/PurchasedRecipesContext";

interface Props {
  open: boolean;
  onClose: () => void;
  recipeId: string;
  recipeTitle: string;
  price: number;
  onUnlocked: () => void;
}

export function PurchaseRecipeModal({
  open,
  onClose,
  recipeId,
  recipeTitle,
  price,
  onUnlocked,
}: Props) {
  const { user } = useAuth();
  const { completePurchase } = usePurchasedRecipes();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"pick" | "pay" | "success">("pick");
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);

  const qrPayload = useMemo(
    () => buildQpayPayload(recipeId, price, user?.id),
    [recipeId, price, user?.id],
  );

  const qrImageUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`,
    [qrPayload],
  );

  const reset = useCallback(() => {
    setMethod(null);
    setStep("pick");
    setSubmitting(false);
    setScanning(false);
    setScanError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, reset]);

  const stopScanner = useCallback(() => {
    readerRef.current = null;
    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!open) stopScanner();
    return () => stopScanner();
  }, [open, stopScanner]);

  async function onSuccessWithMethod(selected: PaymentMethod) {
    setSubmitting(true);
    setScanError(null);
    try {
      await completePurchase(recipeId, selected);
      setStep("success");
      setTimeout(() => {
        onUnlocked();
        onClose();
        reset();
      }, 1400);
    } catch {
      setScanError("Төлбөр бүртгэхэд алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  }

  async function startQrScan() {
    if (!videoRef.current) return;
    setScanError(null);
    setScanning(true);
    const reader = new BrowserQRCodeReader();
    readerRef.current = reader;
    try {
      const result = await reader.decodeOnceFromVideoDevice(
        undefined,
        videoRef.current,
      );
      const text = result.getText();
      if (isEatwellPaymentQr(text, recipeId)) {
        stopScanner();
        await onSuccessWithMethod("qpay");
      } else {
        setScanError("Энэ QR код Eatwell+ төлбөр биш байна");
        stopScanner();
      }
    } catch {
      setScanError("QR уншиж чадсангүй. Дахин оролдоно уу.");
      stopScanner();
    }
  }

  if (!open) return null;

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE8DA]">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#9C8878] uppercase tracking-wider">
              Premium жор худалдан авах
            </p>
            <h2 className="font-display text-lg font-semibold text-[#221C16] truncate">
              {recipeTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9C8878] hover:bg-[#EFE8DA] shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {step === "success" ? (
          <div className="px-5 py-12 text-center">
            <CheckCircle2 size={48} className="mx-auto text-[#2D5A4A] mb-4" />
            <p className="font-semibold text-[#221C16]">Төлбөр амжилттай!</p>
            <p className="text-sm text-[#9C8878] mt-1">
              Жорын дэлгэрэнгүй харагдана
            </p>
          </div>
        ) : step === "pick" ? (
          <div className="p-5 space-y-3">
            <p className="text-sm text-[#5C4A3A]">
              Үнэ:{" "}
              <span className="font-bold text-[#B84230]">
                {price.toLocaleString()}₮
              </span>
            </p>
            <p className="text-[12px] text-[#9C8878]">
              Төлбөрийн хэрэгслээ сонгоно уу
            </p>
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMethod(m.id);
                  setStep("pay");
                }}
                className="w-full text-left px-4 py-3 rounded-xl border border-[#D6C9B4]
                           hover:border-[#B84230] hover:bg-[#FBF0E6]/40 transition-colors"
              >
                <p className="font-semibold text-[#221C16]">{m.label}</p>
                <p className="text-[12px] text-[#9C8878] mt-0.5">{m.hint}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="text-[12px] font-semibold text-[#B84230]"
            >
              ← Буцах
            </button>

            {method === "qpay" ? (
              <>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#221C16] mb-1">
                    QPay QR — {price.toLocaleString()}₮
                  </p>
                  <p className="text-[11px] text-[#9C8878] mb-3">
                    Банкны апп эсвэл доорх камераар уншуулна
                  </p>
                  <img
                    src={qrImageUrl}
                    alt="QPay QR"
                    width={220}
                    height={220}
                    className="mx-auto rounded-xl border border-[#D6C9B4]"
                  />
                </div>

                {!scanning ? (
                  <button
                    type="button"
                    onClick={startQrScan}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                               bg-[#B84230] text-white font-semibold text-sm"
                  >
                    <Camera size={16} />
                    Камераар QR уншуулах
                  </button>
                ) : (
                  <div className="space-y-2">
                    <video
                      ref={videoRef}
                      className="w-full rounded-xl border border-[#D6C9B4] bg-black max-h-48 object-cover"
                      muted
                      playsInline
                    />
                    <button
                      type="button"
                      onClick={stopScanner}
                      className="w-full py-2 text-sm text-[#9C8878]"
                    >
                      Цуцлах
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => onSuccessWithMethod("qpay")}
                  className="w-full py-2.5 rounded-xl border border-[#D6C9B4] text-sm font-semibold
                             text-[#5C4A3A] hover:bg-[#EFE8DA] disabled:opacity-60"
                >
                  QR-гүйгээр төлбөр баталгаажуулах
                </button>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-[#EFE8DA] p-4 text-sm text-[#5C4A3A]">
                  <p className="font-semibold text-[#221C16] mb-1">
                    {selectedMethod?.label}
                  </p>
                  <p>{selectedMethod?.hint}</p>
                  <p className="mt-2 text-[#B84230] font-bold">
                    Дүн: {price.toLocaleString()}₮
                  </p>
                  <p className="text-[11px] text-[#9C8878] mt-2">
                    Гүйлгээний утга: {recipeTitle.slice(0, 40)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => method && onSuccessWithMethod(method)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                             bg-[#2D5A4A] text-white font-semibold text-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Төлбөр төлсөн
                </button>
              </>
            )}

            {scanError && (
              <p className="text-[12px] text-[#DC2626] text-center">{scanError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
