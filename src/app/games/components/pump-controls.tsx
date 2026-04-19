"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Wind, XCircle } from "lucide-react";
import { PumpDifficulty, GameMode, DIFFICULTY_OPTIONS, PumpBetResult } from "../../../interfaces/interface";

const PRIMARY = "#c8a2ff";
const SURFACE = "#131212";

interface PumpControlsProps {
  gameMode: GameMode;
  onGameModeChange: (m: GameMode) => void;
  betAmount: number;
  onBetAmountChange: (v: number) => void;
  difficulty: PumpDifficulty;
  onDifficultyChange: (d: PumpDifficulty) => void;
  phase: "idle" | "playing" | "busted" | "cashedout";
  currentMultiplier: number;
  currentStep: number;
  profit: number;
  betAmountUsed: number;
  onBet: () => void;
  onPump: () => void;
  onCashout: () => void;
  isAutoRunning: boolean;
  autoPumpCount: number;
  onAutoPumpCountChange: (n: number) => void;
  onStartAuto: () => void;
  onStopAuto: () => void;
  results: PumpBetResult[];
}

export default function PumpControls({
  gameMode,
  onGameModeChange,
  betAmount,
  onBetAmountChange,
  difficulty,
  onDifficultyChange,
  phase,
  currentMultiplier,
  currentStep,
  profit,
  betAmountUsed,
  onBet,
  onPump,
  onCashout,
  isAutoRunning,
  autoPumpCount,
  onAutoPumpCountChange,
  onStartAuto,
  onStopAuto,
  results,
}: PumpControlsProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const isPlaying = phase === "playing";
  const isIdle = phase === "idle" || phase === "busted" || phase === "cashedout";

  const diffOption = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2 p-3 overflow-hidden text-[#ededed] font-sans">
      <div className="flex flex-col gap-2 shrink-0">
      {/* Mode toggle */}
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

      {/* Bet Amount */}
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
            className="flex-1 bg-transparent outline-none text-white text-xs min-w-0"
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
        {!isPlaying && (
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

      {/* Difficulty */}
      <div className="shrink-0">
        <div className="text-[10px] tracking-wider text-white/50 mb-1">DIFFICULTY</div>
        <div className="relative" style={{ opacity: isPlaying ? 0.5 : 1 }}>
          <button
            type="button"
            onClick={() => !isPlaying && setDiffOpen(!diffOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-white"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(200,162,255,0.1)",
              cursor: isPlaying ? "not-allowed" : "pointer",
            }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: diffOption.color }} />
              {diffOption.label}
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                display: "inline-block",
                transform: diffOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
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
                className="absolute left-0 right-0 rounded-xl mt-1 z-20 overflow-hidden max-h-40 overflow-y-auto"
                style={{ background: SURFACE, border: "1px solid rgba(200,162,255,0.15)" }}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onDifficultyChange(opt.value);
                      setDiffOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 transition-all"
                    style={{
                      color: difficulty === opt.value ? "#fff" : "rgba(255,255,255,0.6)",
                      background: difficulty === opt.value ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                    <span>{opt.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {opt.value === "easy"
                        ? "low risk"
                        : opt.value === "medium"
                          ? "med risk"
                          : opt.value === "hard"
                            ? "high risk"
                            : "☠️ extreme"}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Auto pump count */}
      <AnimatePresence>
        {gameMode === "auto" && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-[10px] tracking-wider text-white/50 mb-1">AUTO PUMPS BEFORE CASHOUT</div>
            <input
              type="number"
              value={autoPumpCount}
              onChange={(e) => onAutoPumpCountChange(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
              className="w-full px-2.5 py-1.5 rounded-xl outline-none text-white text-xs"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
              min={1}
              max={24}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live multiplier while playing */}
      <AnimatePresence>
        {isPlaying && currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl px-3 py-2"
            style={{
              background: `rgba(${diffOption.color
                .slice(1)
                .match(/.{2}/g)!
                .map((h) => parseInt(h, 16))
                .join(",")},0.1)`,
              border: `1px solid ${diffOption.color}44`,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 1 }}>CURRENT MULTIPLIER</div>
            <div style={{ color: diffOption.color, fontWeight: 700, fontSize: 22 }}>
              {currentMultiplier >= 1000 ? `${(currentMultiplier / 1000).toFixed(1)}k` : currentMultiplier.toFixed(2)}×
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              Pump #{currentStep} · ${(betAmountUsed * currentMultiplier).toFixed(2)} if cashed
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profit */}
      <div className="shrink-0">
        <div className="flex items-center justify-between text-[10px] tracking-wider text-white/50 mb-1 gap-1">
          <span className="truncate">TOTAL PROFIT ({currentMultiplier.toFixed(2)}×)</span>
          <span style={{ color: profit >= 0 ? "#4ade80" : "#f87171" }}>
            {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
          </span>
        </div>
        <div
          className="rounded-xl px-2.5 py-1.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,162,255,0.08)" }}
        >
          <span className="text-white text-xs font-semibold">
            {isPlaying ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : "0.00"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {gameMode === "manual" ? (
        isIdle ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onBet}
            className="w-full py-2 rounded-xl font-semibold text-[11px] tracking-wide text-[#131212] shrink-0"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #9d6fd8 100%)`,
              boxShadow: "0 4px 18px rgba(200,162,255,0.28)",
            }}
          >
            BET
          </motion.button>
        ) : (
          <div className="flex flex-col gap-1.5 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onCashout}
              disabled={currentStep === 0}
              className="w-full py-2 rounded-xl font-semibold text-[11px]"
              style={{
                background:
                  currentStep > 0
                    ? `linear-gradient(135deg, ${diffOption.color}, ${diffOption.color}99)`
                    : "rgba(255,255,255,0.06)",
                color: currentStep > 0 ? "#000" : "rgba(255,255,255,0.3)",
                boxShadow: currentStep > 0 ? `0 4px 18px ${diffOption.color}44` : "none",
                cursor: currentStep === 0 ? "not-allowed" : "pointer",
              }}
            >
              CASHOUT {currentStep > 0 ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : ""}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onPump}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.06] py-2 text-[11px] font-semibold text-white/85"
            >
              <Wind className="size-3.5 shrink-0 opacity-90" aria-hidden strokeWidth={2.25} />
              PUMP
            </motion.button>
          </div>
        )
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={isAutoRunning ? onStopAuto : onStartAuto}
          className="w-full py-2 rounded-xl font-semibold text-[11px] shrink-0"
          style={{
            background: isAutoRunning
              ? "linear-gradient(135deg, #ef4444, #b91c1c)"
              : "linear-gradient(135deg, #22c55e, #15803d)",
            color: "#fff",
            boxShadow: isAutoRunning ? "0 4px 18px rgba(239,68,68,0.3)" : "0 4px 18px rgba(34,197,94,0.3)",
          }}
        >
          {isAutoRunning ? "STOP AUTO" : "START AUTO"}
        </motion.button>
      )}
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-1 pt-0.5">
        <div className="text-[10px] tracking-wider text-white/50 shrink-0">RECENT</div>
        <div
          className="flex-1 min-h-[72px] overflow-y-auto rounded-xl px-2 py-1.5 border border-white/[0.08] bg-white/[0.03]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {results.length === 0 ? (
            <p className="text-[11px] text-white/35 text-center py-5 px-2 leading-snug">No recent game.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {[...results]
                .reverse()
                .slice(0, 50)
                .map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2 py-1 rounded-lg text-[11px] shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="inline-flex shrink-0" aria-hidden>
                      {r.won ? (
                        <Check className="size-3.5 text-emerald-400" strokeWidth={2.5} />
                      ) : (
                        <XCircle className="size-3.5 text-red-400" strokeWidth={2} />
                      )}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>${r.betAmount.toFixed(2)}</span>
                    <span style={{ color: r.won ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                      {r.won ? `${r.multiplier.toFixed(2)}×` : "BUST"}
                    </span>
                    <span style={{ color: r.won ? "#22c55e" : "#ef4444" }}>
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
