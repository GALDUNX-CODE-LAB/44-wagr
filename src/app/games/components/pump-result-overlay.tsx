"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Gem } from "lucide-react";

interface PumpResultOverlayProps {
  phase: "idle" | "playing" | "busted" | "cashedout";
  multiplier: number;
  profit: number;
  onPlayAgain: () => void;
}

/** Matches mines-result-overlay win card styling (green toast modal). */
export default function PumpResultOverlay({ phase, multiplier, profit, onPlayAgain }: PumpResultOverlayProps) {
  const isWin = phase === "cashedout";

  return (
    <AnimatePresence>
      {isWin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(10,40,25,0.3)" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="max-w-[90vw] min-w-[180px] rounded-xl px-5 py-4 text-center pointer-events-auto"
            style={{
              background: "linear-gradient(135deg, #0c1810 0%, #132a1c 100%)",
              border: "1px solid rgba(74,222,128,0.28)",
              boxShadow: "0 12px 40px rgba(34,197,94,0.18)",
            }}
          >
            <div className="mb-1 flex justify-center" aria-hidden>
              <Gem className="size-8 text-emerald-400" strokeWidth={1.75} />
            </div>
            <div className="text-sm font-semibold tracking-wide text-emerald-400">CASHED OUT</div>
            <div className="mt-1 text-[10px] text-white/45">{multiplier.toFixed(2)}× multiplier</div>
            <div className="mt-1 text-lg font-semibold text-emerald-400">+${profit.toFixed(2)}</div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onPlayAgain}
              className="mt-3 rounded-lg px-4 py-1.5 text-[11px] font-semibold tracking-wide"
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.28)",
              }}
            >
              PLAY AGAIN
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
