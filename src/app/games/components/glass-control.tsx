"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import {
  GameMode,
  GlassDifficulty,
  GlassBetResult,
  GLASS_DIFFICULTY_OPTIONS,
  STEP_MULTIPLIERS,
  WIN_PROB,
  TOTAL_ROWS,
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
  results: GlassBetResult[];
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
  results,
  autoPicking = false,
}: GlassControlsProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const isPlaying = phase === "playing";
  const isIdle = phase === "idle" || phase === "won" || phase === "lost";
  const canCashout = isPlaying && currentRow > 0;
  const diffOption = GLASS_DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;
  const ladders = STEP_MULTIPLIERS[difficulty];
  const winProb = WIN_PROB[difficulty];

  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-3 overflow-hidden font-sans text-[#ededed]">
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5">
        {autoPicking && (
          <div
            className="rounded-lg px-2.5 py-1.5 text-center text-[11px] font-semibold tracking-wide"
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
          className="flex rounded-xl overflow-hidden shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
        >
          {(["manual", "auto"] as GameMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => !isPlaying && onGameModeChange(mode)}
              className="flex-1 py-1.5 text-xs font-semibold transition-all duration-200 capitalize tracking-wide"
              style={{
                background: gameMode === mode ? PRIMARY : "transparent",
                color: gameMode === mode ? SURFACE : "rgba(255,255,255,0.45)",
                borderRadius: 10,
                cursor: isPlaying ? "not-allowed" : "pointer",
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="shrink-0">
          <div className="text-[10px] tracking-wider text-white/50 mb-1">BET AMOUNT</div>
          <div
            className="flex items-center gap-2 rounded-xl px-2.5 py-1.5"
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
              className="flex-1 bg-transparent outline-none text-white text-sm min-w-0"
              disabled={isPlaying}
              step={0.01}
              min={0}
            />
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount / 2)}
              disabled={isPlaying}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount * 2)}
              disabled={isPlaying}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              2×
            </button>
          </div>
          {isIdle && (
            <div className="flex gap-1 mt-1.5">
              {[1, 5, 10, 25].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onBetAmountChange(v)}
                  className="flex-1 py-1 rounded-lg text-[11px] transition-all border border-white/[0.08] bg-white/[0.04] text-white/55"
                >
                  ${v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <div className="text-[10px] tracking-wider text-white/50 mb-1">DIFFICULTY</div>
          <div className="relative" style={{ opacity: isPlaying ? 0.5 : 1 }}>
            <button
              type="button"
              onClick={() => !isPlaying && setDiffOpen(!diffOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-sm text-white"
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
                  className="absolute left-0 right-0 rounded-xl mt-1 z-20 overflow-hidden"
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
                      className="w-full flex flex-col px-2.5 py-1.5 text-left transition-all"
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

        <div className="shrink-0">
          <div className="text-[10px] tracking-wider text-white/50 mb-1">MULTIPLIER LADDER</div>
          <div className="flex flex-col gap-0.5 max-h-[120px] overflow-y-auto rounded-xl px-2 py-1 border border-white/[0.08] bg-white/[0.03]">
            {ladders.map((m, i) => {
              const isCurrentStep = isPlaying && i === currentRow;
              const isPast = isPlaying && i < currentRow;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-1.5 py-0.5 rounded-lg text-[11px]"
                  style={{
                    background: isPast
                      ? `${diffOption.color}15`
                      : isCurrentStep
                        ? "rgba(200,162,255,0.08)"
                        : "transparent",
                    border: `1px solid ${isPast ? `${diffOption.color}35` : isCurrentStep ? "rgba(200,162,255,0.15)" : "transparent"}`,
                  }}
                >
                  <span className={isPast || isCurrentStep ? "text-white/65" : "text-white/25"}>Step {i + 1}</span>
                  <span
                    className="font-bold inline-flex items-center gap-0.5"
                    style={{
                      color: isPast ? diffOption.color : isCurrentStep ? "#fff" : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {m.toFixed(2)}×
                    {isPast && <Check className="w-3 h-3" strokeWidth={3} aria-hidden />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-xl px-2.5 py-1.5 shrink-0"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,162,255,0.08)" }}
        >
          <div className="text-[10px] tracking-wider text-white/40 mb-1">ODDS PER JUMP</div>
          <div className="font-bold text-sm" style={{ color: diffOption.color }}>
            1 in {Math.round(1 / winProb)} · {(winProb * 100).toFixed(0)}% safe
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">
            All {TOTAL_ROWS} clear: {(winProb ** TOTAL_ROWS * 100).toFixed(2)}% chance
          </div>
        </div>

        <AnimatePresence>
          {canCashout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-2.5 py-1.5 shrink-0"
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

        <div className="shrink-0">
          <div className="flex justify-between items-baseline text-[10px] tracking-wider text-white/50 mb-1 gap-2">
            <span className="truncate">TOTAL PROFIT ({currentMultiplier.toFixed(2)}×)</span>
            <span className={`shrink-0 font-semibold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </span>
          </div>
          <div
            className="rounded-xl px-2.5 py-1.5 border border-white/[0.08] bg-white/[0.04]"
            style={{ borderColor: "rgba(200,162,255,0.08)" }}
          >
            <span className="text-white text-xs font-semibold">
              {canCashout ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : "0.00"}
            </span>
          </div>
        </div>
      </div>

      {(isIdle || canCashout) && (
        <div className="shrink-0 pt-1 border-t border-white/[0.08] space-y-2">
          {isIdle ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onBet}
              className="w-full py-2.5 rounded-xl font-semibold text-[11px] tracking-wide text-[#131212]"
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
              className="w-full py-2.5 rounded-xl font-semibold text-[11px] tracking-wide text-[#131212]"
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

      <div className="flex flex-col shrink-0 min-h-0 max-h-[32%] gap-1 pt-0.5">
        <div className="text-[10px] tracking-wider text-white/50 shrink-0">RECENT</div>
        <div
          className="min-h-[64px] max-h-[112px] flex-1 overflow-y-auto rounded-xl px-2 py-1.5 border border-white/[0.08] bg-white/[0.03]"
          style={{ WebkitOverflowScrolling: "touch", borderColor: "rgba(200,162,255,0.08)" }}
        >
          {results.length === 0 ? (
            <p className="text-[11px] text-white/35 text-center py-5 px-2 leading-snug">No recent game.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {[...results]
                .reverse()
                .slice(0, 50)
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-2 py-1 rounded-lg text-[11px] shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-white/45">S{r.rowsCleared}</span>
                    <span style={{ color: r.won ? PRIMARY : "#ef4444" }} className="font-bold">
                      {r.won ? `${r.multiplier.toFixed(2)}×` : "FELL"}
                    </span>
                    <span className={r.won ? "text-emerald-400" : "text-red-400"}>
                      {r.won ? `+$${(r.payout - r.betAmount).toFixed(2)}` : `-$${r.betAmount.toFixed(2)}`}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
