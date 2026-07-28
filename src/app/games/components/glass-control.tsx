"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GameMode,
  GlassDifficulty,
  GLASS_DIFFICULTY_OPTIONS,
} from "../../../interfaces/interface";

const PRIMARY = "#c8a2ff";
const SURFACE = "#131212";

interface GlassControlsProps {
  gameMode: GameMode;
  onGameModeChange: (m: GameMode) => void;
  betAmount: number;
  onBetAmountChange: (v: number) => void;
  difficulty: GlassDifficulty;
  onDifficultyChange: (d: GlassDifficulty) => void;
  phase: "idle" | "playing" | "won" | "lost";
  currentRow: number;
  currentMultiplier: number;
  profit: number;
  betAmountUsed: number;
  onBet: () => void;
  onCashout: () => void;
  autoPicking?: boolean;
}

export default function GlassControls({
  gameMode,
  onGameModeChange,
  betAmount,
  onBetAmountChange,
  difficulty,
  onDifficultyChange,
  phase,
  currentRow,
  currentMultiplier,
  profit,
  betAmountUsed,
  onBet,
  onCashout,
  autoPicking = false,
}: GlassControlsProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const isPlaying = phase === "playing";
  const isIdle = phase === "idle" || phase === "won" || phase === "lost";
  const canCashout = isPlaying && currentRow > 0;
  const diffOption = GLASS_DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;

  return (
    <div className="flex flex-col gap-3.5 p-4 font-sans text-[#ededed] md:min-h-0 md:flex-1 md:gap-3 md:p-3">
        {autoPicking && (
          <div
            className="order-3 md:order-1 shrink-0 rounded-xl px-3 py-2 text-center text-[11px] font-semibold tracking-wide"
            style={{
              background: "rgba(200,162,255,0.1)",
              border: "1px solid rgba(200,162,255,0.2)",
              color: PRIMARY,
            }}
          >
            AUTO · CHOOSING TILE…
          </div>
        )}

        <div
          className="order-4 md:order-2 flex shrink-0 gap-1 rounded-xl p-1"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
        >
          {(["manual", "auto"] as GameMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => !isPlaying && onGameModeChange(mode)}
              className="flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 capitalize tracking-wide"
              style={{
                background: gameMode === mode ? PRIMARY : "transparent",
                color: gameMode === mode ? SURFACE : "rgba(255,255,255,0.45)",
                cursor: isPlaying ? "not-allowed" : "pointer",
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="shrink-0 order-2 md:order-3 space-y-2">
          <div className="text-[10px] tracking-wider text-white/50">BET AMOUNT</div>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(200,162,255,0.1)",
              opacity: isPlaying ? 0.5 : 1,
            }}
          >
            <input
              type="number"
              value={betAmount}
              onChange={(e) => !isPlaying && onBetAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-white outline-none focus:border-white/10"
              disabled={isPlaying}
              step={0.01}
              min={0}
            />
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount / 2)}
              disabled={isPlaying}
              className="shrink-0 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount * 2)}
              disabled={isPlaying}
              className="shrink-0 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              2×
            </button>
          </div>
          {isIdle && (
            <div className="flex gap-1.5 pt-0.5">
              {[1, 5, 10, 25].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onBetAmountChange(v)}
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 text-[11px] text-white/55 transition-all"
                >
                  ${v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 order-5 md:order-4 space-y-2">
          <div className="text-[10px] tracking-wider text-white/50">DIFFICULTY</div>
          <div className="relative" style={{ opacity: isPlaying ? 0.5 : 1 }}>
            <button
              type="button"
              onClick={() => !isPlaying && setDiffOpen(!diffOpen)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,162,255,0.1)",
                cursor: isPlaying ? "not-allowed" : "pointer",
              }}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: diffOption.color }} />
                <span className="truncate">{diffOption.label}</span>
                <span className="text-[10px] text-white/30 truncate hidden sm:inline">{diffOption.tag}</span>
              </span>
              <span
                className="text-white/40 inline-block transition-transform duration-200 shrink-0"
                style={{ transform: diffOpen ? "rotate(180deg)" : "none" }}
              >
                ▼
              </span>
            </button>
            <AnimatePresence>
              {diffOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute left-0 right-0 z-50 mt-1.5 rounded-xl overflow-hidden"
                  style={{ background: SURFACE, border: "1px solid rgba(200,162,255,0.15)" }}
                >
                  {GLASS_DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onDifficultyChange(opt.value);
                        setDiffOpen(false);
                      }}
                      className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-all"
                      style={{
                        color: difficulty === opt.value ? "#fff" : "rgba(255,255,255,0.65)",
                        background: difficulty === opt.value ? "rgba(200,162,255,0.1)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                        <span className="text-sm">{opt.label}</span>
                      </div>
                      <div className="text-[10px] text-white/35 pl-4 mt-0.5">{opt.tag}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {canCashout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="order-8 md:order-7 shrink-0 rounded-xl px-3 py-2"
              style={{
                background: "rgba(200,162,255,0.08)",
                border: "1px solid rgba(200,162,255,0.18)",
              }}
            >
              <div className="text-[10px] tracking-wider text-white/50">CURRENT</div>
              <div className="font-bold text-lg" style={{ color: PRIMARY }}>
                {currentMultiplier.toFixed(2)}×
              </div>
              <div className="text-[11px] text-white/45">= ${(betAmountUsed * currentMultiplier).toFixed(2)}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="order-9 md:order-8 shrink-0 space-y-2">
          <div className="flex items-baseline justify-between gap-2 text-[10px] tracking-wider text-white/50">
            <span className="truncate">TOTAL PROFIT ({currentMultiplier.toFixed(2)}×)</span>
            <span className={`shrink-0 font-semibold ${profit >= 0 ? "text-emerald-400" : "text-primary"}`}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </span>
          </div>
          <div
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2"
            style={{ borderColor: "rgba(200,162,255,0.08)" }}
          >
            <span className="text-white text-xs font-semibold">
              {canCashout ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : "0.00"}
            </span>
          </div>
        </div>

      {(isIdle || canCashout) && (
        <div className="order-1 md:order-9 shrink-0 space-y-2">
          {isIdle ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onBet}
              className="w-full rounded-xl border border-transparent py-3 font-semibold text-xs tracking-wide text-[#131212]"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #9d6fd8 100%)`,
                boxShadow: "0 4px 18px rgba(200,162,255,0.28)",
              }}
            >
              BET
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onCashout}
              className="w-full rounded-xl border border-transparent py-3 font-semibold text-xs tracking-wide text-[#131212]"
              style={{
                background: `linear-gradient(135deg, ${diffOption.color}, ${diffOption.color}bb)`,
                boxShadow: `0 4px 18px ${diffOption.color}44`,
              }}
            >
              CASHOUT ${(betAmountUsed * currentMultiplier).toFixed(2)}
            </motion.button>
          )}
        </div>
      )}

    </div>
  );
}
