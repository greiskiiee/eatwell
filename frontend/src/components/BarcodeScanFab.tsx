"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { BarcodeScanModal } from "@/components/BarcodeScanModal";

export function BarcodeScanFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Баркод сканнер нээх"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40
                   w-14 h-14 rounded-full bg-[#B84230] text-white
                   flex items-center justify-center shadow-xl
                   hover:bg-[#9C3426] hover:scale-105 active:scale-95
                   transition-all duration-200
                   ring-4 ring-[#B84230]/15"
      >
        <ScanLine size={22} />
      </button>
      <BarcodeScanModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
