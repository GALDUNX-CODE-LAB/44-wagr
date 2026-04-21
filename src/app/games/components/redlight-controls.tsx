"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown, CirclePlay, Footprints, Skull, Snowflake, Wallet } from "lucide-react";
import {
  RedlightDifficulty,
  GameMode,
  REDLIGHT_DIFFICULTY_OPTIONS,
  RedlightBetResult,
  FREEZE_GRACE_MS,
  MULT_INCREMENT,
} from "../../../interfaces/interface";

interface RLGLControlsProps {
  gameMode: GameMode;
  onGameModeChange: (m: GameMode) => void;
  betAmount: number;
  onBetAmountChange: (v: number) => void;
  difficulty: RedlightDifficulty;
  onDifficultyChange: (d: RedlightDifficulty) => void;
  phase: "idle" | "green" | "red" | "frozen" | "eliminated" | "cashedout";
  currentMultiplier: number;
  profit: number;
  betAmountUsed: number;
  onStartRun: () => void;
  onFreeze: () => void;
  onCashout: () => void;
  onContinue: () => void;
  results: RedlightBetResult[];
}

export default function RLGLControls({
  gameMode,
  onGameModeChange,
  betAmount,
  onBetAmountChange,
  difficulty,
  onDifficultyChange,
  phase,
  currentMultiplier,
  profit,
  betAmountUsed,
  onStartRun,
  onFreeze,
  onCashout,
  onContinue,
  results,
}: RLGLControlsProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const isPlaying = phase === "green" || phase === "red";
  const isFrozen = phase === "frozen";
  const isIdle = phase === "idle" || phase === "eliminated" || phase === "cashedout";
  const diffOption = REDLIGHT_DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-1.5 overflow-y-auto overflow-x-hidden p-2 font-sans text-[#ededed] md:gap-2 md:p-3">
      {/* Mode toggle — desktop only */}
      <div
        className="hidden shrink-0 rounded-xl overflow-hidden md:flex"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
      >
        {(["manual", "auto"] as GameMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => !isPlaying && onGameModeChange(mode)}
            className="flex-1 py-1.5 text-xs font-semibold transition-all duration-200 capitalize tracking-wide"
            style={{
              background: gameMode === mode ? "#1a9fff" : "transparent",
              color: gameMode === mode ? "#fff" : "rgba(255,255,255,0.45)",
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
            opacity: isPlaying || isFrozen ? 0.5 : 1,
          }}
        >
          <input
            type="number"
            value={betAmount}
            onChange={(e) => !isPlaying && !isFrozen && onBetAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
            className="flex-1 min-w-0 bg-transparent outline-none text-white text-sm tabular-nums"
            disabled={isPlaying || isFrozen}
            step={0.01}
            min={0}
          />
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount / 2)}
              disabled={isPlaying}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount * 2)}
              disabled={isPlaying}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              2×
            </button>
          </div>
        </div>
        {isIdle && (
          <div className="mt-1.5 hidden gap-1 md:flex">
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
        <div className="relative" style={{ opacity: isPlaying || isFrozen ? 0.5 : 1 }}>
          <button
            type="button"
            onClick={() => !isPlaying && !isFrozen && setDiffOpen(!diffOpen)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-sm text-white"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(200,162,255,0.1)",
              cursor: isPlaying ? "not-allowed" : "pointer",
            }}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 shrink-0 rounded-full" style={{ background: diffOption.color }} />
              <span className="truncate">{diffOption.label}</span>
              <span className="text-[11px] text-white/30 shrink-0">{diffOption.tag}</span>
            </span>
            <ChevronDown
              className="w-3.5 h-3.5 shrink-0 text-white/40 transition-transform duration-200"
              style={{ transform: diffOpen ? "rotate(180deg)" : "none" }}
            />
          </button>
          <AnimatePresence>
            {diffOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 rounded-xl mt-1 z-20 overflow-hidden"
                style={{ background: "#131212", border: "1px solid rgba(200,162,255,0.15)" }}
              >
                {REDLIGHT_DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onDifficultyChange(opt.value);
                      setDiffOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm transition-all"
                    style={{
                      color: difficulty === opt.value ? "#fff" : "rgba(255,255,255,0.65)",
                      background: difficulty === opt.value ? "rgba(200,162,255,0.1)" : "transparent",
                    }}
                  >
                    <span className="w-2 h-2 shrink-0 rounded-full" style={{ background: opt.color }} />
                    <span>{opt.label}</span>
                    <span className="ml-auto text-[11px] text-white/30">{opt.tag}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Difficulty stats — desktop only */}
      <div className="hidden shrink-0 grid-cols-2 gap-2 md:grid">
        <div
          className="rounded-xl px-2.5 py-1.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="text-[10px] tracking-wider text-white/40">+MULT/2s</div>
          <div className="text-[11px] font-bold tabular-nums" style={{ color: diffOption.color }}>
            +{MULT_INCREMENT[difficulty]}
          </div>
        </div>
        <div
          className="rounded-xl px-2.5 py-1.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="text-[10px] tracking-wider text-white/40">GRACE</div>
          <div className="text-[11px] font-bold tabular-nums" style={{ color: diffOption.color }}>
            {FREEZE_GRACE_MS[difficulty]}ms
          </div>
        </div>
      </div>

      {/* Live multiplier — desktop only (mobile: HUD on playfield) */}
      <AnimatePresence>
        {(isPlaying || isFrozen) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="hidden rounded-xl px-2.5 py-1.5 md:block"
            style={{ background: `${diffOption.color}12`, border: `1px solid ${diffOption.color}33` }}
          >
            <div className="text-[10px] tracking-wider text-white/50">LIVE MULTIPLIER</div>
            <div className="text-[11px] font-bold tabular-nums leading-snug" style={{ color: diffOption.color }}>
              {currentMultiplier.toFixed(2)}×
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/35">
              <ArrowRight className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              <span>${(betAmountUsed * currentMultiplier).toFixed(2)} if cashed out</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profit */}
      <div className="shrink-0">
        <div className="mb-1 flex justify-between gap-2 text-[10px] text-white/50 md:text-[11px]">
          <span className="leading-snug md:truncate">
            <span className="md:hidden">TOTAL PROFIT</span>
            <span className="hidden md:inline">TOTAL PROFIT ({currentMultiplier.toFixed(2)}×)</span>
          </span>
          <span className="shrink-0 tabular-nums" style={{ color: profit >= 0 ? "#22c55e" : "#ef4444" }}>
            {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
          </span>
        </div>
        <div
          className="rounded-xl px-2 py-1 md:px-2.5 md:py-1.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-[10px] leading-snug text-white tabular-nums md:text-[11px]">
            {isPlaying || isFrozen ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : "0.00"}
          </span>
        </div>
      </div>

      {/* Action Buttons — desktop only (mobile uses centered FAB on playfield) */}
      <div className="mt-auto hidden flex-col gap-2 md:flex">
      {isIdle && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStartRun}
          type="button"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 font-semibold text-[11px] tracking-wide text-[#131212]"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
            boxShadow: "0 4px 18px rgba(34,197,94,0.28)",
          }}
        >
          <CirclePlay className="h-3 w-3 shrink-0" aria-hidden />
          START RUN
        </motion.button>
      )}

      {isPlaying && (
        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCashout}
            type="button"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 font-semibold text-[11px] tabular-nums text-[#131212] tracking-wide"
            style={{
              background: `linear-gradient(135deg, ${diffOption.color}, ${diffOption.color}99)`,
              boxShadow: `0 4px 18px ${diffOption.color}44`,
            }}
          >
            <Wallet className="h-3 w-3 shrink-0" aria-hidden />
            CASHOUT ${(betAmountUsed * currentMultiplier).toFixed(2)}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onFreeze}
            type="button"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 py-2 font-semibold text-[11px] tracking-wide text-white"
            style={{
              background: phase === "red" ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "rgba(255,255,255,0.08)",
              boxShadow: phase === "red" ? "0 4px 18px rgba(239,68,68,0.3)" : "none",
              animation: phase === "red" ? "pulse 0.3s ease-in-out infinite" : "none",
            }}
          >
            <Snowflake className="h-3 w-3 shrink-0" aria-hidden />
            FREEZE
          </motion.button>
        </div>
      )}

      {isFrozen && (
        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCashout}
            type="button"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 font-semibold text-[11px] tabular-nums tracking-wide text-[#131212]"
            style={{
              background: "linear-gradient(135deg, #22c55e, #15803d)",
              boxShadow: "0 4px 18px rgba(34,197,94,0.28)",
            }}
          >
            <Wallet className="h-3 w-3 shrink-0" aria-hidden />
            CASHOUT ${(betAmountUsed * currentMultiplier).toFixed(2)}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            type="button"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] py-2 font-semibold text-[11px] tracking-wide text-white"
          >
            <Footprints className="h-3 w-3 shrink-0" aria-hidden />
            KEEP RUNNING
          </motion.button>
        </div>
      )}
      </div>

      {/* Recent results — desktop only */}
      {results.length > 0 && (
        <div className="hidden min-h-0 flex-1 flex-col gap-1 pt-0.5 md:flex">
          <div className="text-[10px] tracking-wider text-white/50 shrink-0">RECENT</div>
          <div className="flex max-h-28 flex-col gap-0.5 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-1.5">
            {[...results]
              .reverse()
              .slice(0, 6)
              .map((r, i) => (
                <div
                  key={i}
                  className="flex shrink-0 items-center justify-between gap-1 rounded-lg px-2 py-1 text-[11px] tabular-nums leading-snug"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <span className="flex w-4 shrink-0 items-center justify-center" aria-hidden>
                    {r.won ? (
                      <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
                    ) : (
                      <Skull className="h-3 w-3 text-red-500" strokeWidth={2} />
                    )}
                  </span>
                  <span className="text-white/45">${r.betAmount.toFixed(2)}</span>
                  <span className="font-bold" style={{ color: r.won ? "#22c55e" : "#ef4444" }}>
                    {r.won ? `${r.multiplier.toFixed(2)}×` : "ELIM"}
                  </span>
                  <span style={{ color: r.won ? "#22c55e" : "#ef4444" }}>
                    {r.won ? `+$${(r.payout - r.betAmount).toFixed(2)}` : `-$${r.betAmount.toFixed(2)}`}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
