"use client";

import { motion, AnimatePresence } from "framer-motion";

interface MinesResultOverlayProps {
  phase: "idle" | "playing" | "won" | "lost";
  multiplier: number;
  payout: number;
  betAmount: number;
  onPlayAgain: () => void;
}

export default function MinesResultOverlay({
  phase,
  multiplier,
  payout,
  betAmount,
  onPlayAgain,
}: MinesResultOverlayProps) {
  const isWon = phase === "won";
  const isLost = phase === "lost";

  return (
    <AnimatePresence>
      {(isWon || isLost) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          style={{ background: isLost ? "rgba(60,10,10,0.4)" : "rgba(10,40,25,0.3)" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="rounded-xl px-5 py-4 text-center pointer-events-auto max-w-[90vw]"
            style={{
              background: isLost
                ? "linear-gradient(135deg, #1f0a0a 0%, #2a1212 100%)"
                : "linear-gradient(135deg, #0c1810 0%, #132a1c 100%)",
              border: `1px solid ${isLost ? "rgba(248,113,113,0.28)" : "rgba(74,222,128,0.28)"}`,
              boxShadow: isLost ? "0 12px 40px rgba(180,0,0,0.25)" : "0 12px 40px rgba(34,197,94,0.18)",
              minWidth: 180,
            }}
          >
            <div className="text-2xl mb-1">{isLost ? "💥" : "💎"}</div>
            <div className={`font-semibold text-sm tracking-wide ${isLost ? "text-red-400" : "text-emerald-400"}`}>
              {isLost ? "BOOM!" : "CASHED OUT"}
            </div>
            {isWon && (
              <>
                <div className="text-white/45 text-[10px] mt-1">{multiplier}× multiplier</div>
                <div className="text-emerald-400 text-lg font-semibold mt-1">
                  +${(payout - betAmount).toFixed(2)}
                </div>
              </>
            )}
            {isLost && (
              <div className="text-red-400 text-base font-semibold mt-1">-${betAmount.toFixed(2)}</div>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onPlayAgain}
              className="mt-3 px-4 py-1.5 rounded-lg font-semibold text-[11px] tracking-wide"
              style={{
                background: isLost ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                color: isLost ? "#f87171" : "#4ade80",
                border: `1px solid ${isLost ? "rgba(239,68,68,0.28)" : "rgba(74,222,128,0.28)"}`,
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
