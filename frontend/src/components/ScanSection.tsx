"use client";

import { useState } from "react";
import { ScanLine, Package, ChefHat, ArrowRight } from "lucide-react";
import { ScannerModal } from "./ScannerModal";

const STEPS = [
  {
    icon: ScanLine,
    step: "01",
    title: "Баркод скан хий",
    desc: "Бараа бүтээгдэхүүний баркодыг камераар уншуул.",
  },
  {
    icon: Package,
    step: "02",
    title: "Орцоо таниулах",
    desc: "Тухайн бүтээгдэхүүний мэдээлэл автоматаар тодорхойлогдоно.",
  },
  {
    icon: ChefHat,
    step: "03",
    title: "Жороо сонго",
    desc: "Тэр орцыг ашигласан хамгийн тохирох жоруудаас сонгоно уу.",
  },
];

export function ScanSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section id="scan" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chimge-primary-soft text-chimge-primary text-[12px] font-semibold mb-6">
              <ScanLine size={13} /> Шинэ онцлог
            </div>
            <h2 className="font-serif-display text-[38px] font-semibold text-chimge-ink mb-4 leading-tight">
              Баркод скан хийж{" "}
              <span className="text-chimge-primary italic">жорыг</span> ол
            </h2>
            <p className="text-[15px] text-chimge-ink-2 leading-relaxed mb-8">
              Дэлгүүрт байгаа бүтээгдэхүүний баркодыг скан хийхэд л болно —
              тухайн орцоор хийж болох жоруудыг бид шуурхай үзүүлнэ.
            </p>

            <div className="flex flex-col gap-5 mb-8">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-chimge-primary-soft flex items-center justify-center">
                      <Icon size={18} className="text-chimge-primary" />
                    </div>
                    <div>
                      <div className="text-[10.5px] font-bold text-chimge-ink-3 tracking-widest mb-0.5">
                        {s.step}
                      </div>
                      <div className="text-[14px] font-semibold text-chimge-ink mb-0.5">
                        {s.title}
                      </div>
                      <div className="text-[13px] text-chimge-ink-3">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-chimge-primary text-[#FFF8EC] text-[14px] font-semibold hover:bg-chimge-primary-dk transition-colors shadow-lg shadow-chimge-primary/25"
            >
              <ScanLine size={17} /> Одоо туршиж үзэх <ArrowRight size={15} />
            </button>
          </div>

          {/* Right — phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[260px] h-[500px] bg-chimge-ink rounded-[36px] shadow-2xl flex flex-col items-center justify-center overflow-hidden border-4 border-chimge-ink-2">
              {/* Camera viewfinder */}
              <div className="relative w-[180px] h-[180px]">
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />
                {/* Corner brackets */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-6 h-6 border-chimge-primary ${cls}`}
                  />
                ))}
                {/* Scan line */}
                <div className="absolute left-2 right-2 top-1/2 h-px bg-chimge-primary opacity-80 shadow-lg shadow-chimge-primary" />
                {/* Barcode lines mock */}
                <div className="absolute inset-6 flex gap-1 items-end justify-center opacity-30">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white flex-1"
                      style={{ height: `${30 + (i % 3) * 20}px` }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-white/60 text-[12px] mt-5 text-center px-6 leading-relaxed">
                Баркодыг хүрэлцэх болтол ойртуул
              </p>

              {/* Bottom result card */}
              <div className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl p-3">
                <div className="text-[10px] text-chimge-ink-3 mb-1">
                  Илэрц олдлоо →
                </div>
                <div className="text-[13px] font-semibold text-chimge-ink">
                  Тосон гурил 2кг
                </div>
                <div className="text-[11px] text-chimge-primary mt-0.5">
                  12 жор боломжтой
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {open && <ScannerModal onClose={() => setOpen(false)} />}
    </>
  );
}
