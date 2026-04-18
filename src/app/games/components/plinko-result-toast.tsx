"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  multiplier: number;
  payout: number;
  betAmount: number;
}

interface PlinkoResultToastProps {
  result: { multiplier: number; payout: number; betAmount: number; id: string } | null;
}

const PRIMARY = "#c8a2ff";

export default function PlinkoResultToast({ result }: PlinkoResultToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!result) return;
    const toast: Toast = { ...result };
    setToasts((prev) => [...prev, toast]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 500);
    return () => clearTimeout(timer);
  }, [result]);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const isWin = t.payout >= t.betAmount;
          const isBig = t.multiplier >= 10;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 48, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xl font-sans"
              style={{
                background: isBig
                  ? `linear-gradient(135deg, ${PRIMARY}, #9d6fd8)`
                  : isWin
                    ? "linear-gradient(135deg, rgba(200,162,255,0.25), rgba(200,162,255,0.08))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                border: `1px solid ${isBig ? "rgba(200,162,255,0.45)" : "rgba(200,162,255,0.2)"}`,
                minWidth: 168,
              }}
            >
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/65">
                  {isBig ? "BIG WIN" : isWin ? "WIN" : "LOSS"}
                </div>
                <div className="text-sm font-bold text-[#ededed]">
                  {t.multiplier}× → ${t.payout.toFixed(2)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
