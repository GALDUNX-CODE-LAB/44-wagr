"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import {
  RPSGameMode,
  RPSDifficulty,
  RPSBetResult,
  RPS_DIFFICULTY_OPTIONS,
  ROUND_MULTIPLIERS,
} from "../../../interfaces/interface";

const PRIMARY = "#c8a2ff";
const SURFACE = "#131212";

interface RPSControlsProps {
  gameMode: RPSGameMode;
  onGameModeChange: (m: RPSGameMode) => void;
  betAmount: number;
  onBetAmountChange: (v: number) => void;
  difficulty: RPSDifficulty;
  onDifficultyChange: (d: RPSDifficulty) => void;
  phase: "idle" | "playing" | "won" | "lost" | "draw";
  currentRound: number;
  currentMultiplier: number;
  profit: number;
  betAmountUsed: number;
  onBet: () => void;
  onCashout: () => void;
  onRandomPick: () => void;
  results: RPSBetResult[];
}

export default function RPSControls({
  gameMode,
  onGameModeChange,
  betAmount,
  onBetAmountChange,
  difficulty,
  onDifficultyChange,
  phase,
  currentRound,
  currentMultiplier,
  profit,
  betAmountUsed,
  onBet,
  onCashout,
  onRandomPick,
  results,
}: RPSControlsProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const inActiveGame = phase === "playing" || phase === "draw";
  const isIdle = phase === "idle" || phase === "won" || phase === "lost";
  const diffOption = RPS_DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;
  const canCashout = inActiveGame && currentRound > 1;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2 p-3 overflow-hidden text-[#ededed]">
      <div className="flex flex-col gap-2 shrink-0">
        <div
          className="flex rounded-xl overflow-hidden shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
        >
          {(["manual", "auto"] as RPSGameMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => !inActiveGame && onGameModeChange(mode)}
              className="flex-1 py-1.5 text-xs font-semibold transition-all duration-200 capitalize tracking-wide"
              style={{
                background: gameMode === mode ? PRIMARY : "transparent",
                color: gameMode === mode ? SURFACE : "rgba(255,255,255,0.45)",
                borderRadius: 10,
                cursor: inActiveGame ? "not-allowed" : "pointer",
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
              opacity: inActiveGame ? 0.5 : 1,
            }}
          >
            <input
              type="number"
              value={betAmount}
              onChange={(e) => !inActiveGame && onBetAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="flex-1 bg-transparent outline-none text-white text-xs min-w-0"
              disabled={inActiveGame}
              step={0.01}
              min={0}
            />
            <button
              type="button"
              onClick={() => !inActiveGame && onBetAmountChange(betAmount / 2)}
              disabled={inActiveGame}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => !inActiveGame && onBetAmountChange(betAmount * 2)}
              disabled={inActiveGame}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              2×
            </button>
          </div>
          {!inActiveGame && (
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
          <div className="relative" style={{ opacity: inActiveGame ? 0.5 : 1 }}>
            <button
              type="button"
              onClick={() => !inActiveGame && setDiffOpen(!diffOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,162,255,0.1)",
                cursor: inActiveGame ? "not-allowed" : "pointer",
              }}
            >
              <span className="flex items-center gap-2 truncate pr-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: diffOption.color }} />
                <span className="truncate">{diffOption.label}</span>
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
                  className="absolute left-0 right-0 rounded-xl mt-1 z-20 overflow-hidden"
                  style={{ background: SURFACE, border: "1px solid rgba(200,162,255,0.15)" }}
                >
                  {RPS_DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onDifficultyChange(opt.value);
                        setDiffOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-all"
                      style={{
                        color: difficulty === opt.value ? "#fff" : "rgba(255,255,255,0.65)",
                        background: difficulty === opt.value ? "rgba(200,162,255,0.1)" : "transparent",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {inActiveGame && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="shrink-0"
            >
              <div className="text-[10px] tracking-wider text-white/50 mb-1">ROUND</div>
              <div className="flex gap-1">
                {ROUND_MULTIPLIERS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: 4,
                      background:
                        currentRound > i + 1 ? "#22c55e" : currentRound === i + 1 ? PRIMARY : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
              <div className="text-white/40 text-[10px] mt-1">
                Round {currentRound} of 5 · {currentMultiplier.toFixed(2)}× if cashed
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="shrink-0">
          <div className="flex items-center justify-between text-[10px] tracking-wider text-white/50 mb-1">
            <span className="truncate pr-1">PROFIT ({inActiveGame ? `${currentMultiplier.toFixed(2)}×` : "1×"})</span>
            <span style={{ color: profit >= 0 ? "#4ade80" : "#f87171" }}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </span>
          </div>
          <div
            className="rounded-xl px-2.5 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,162,255,0.08)" }}
          >
            <span className="text-white text-xs font-semibold">
              {inActiveGame && canCashout ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : "0.00"}
            </span>
          </div>
        </div>

        {isIdle ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onBet}
            className="w-full py-2 rounded-xl font-semibold text-[11px] tracking-wide text-[#131212]"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #9d6fd8 100%)`,
              boxShadow: "0 4px 18px rgba(200,162,255,0.28)",
            }}
          >
            BET
          </motion.button>
        ) : (
          <div className="flex flex-col gap-1.5">
            {canCashout && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onCashout}
                className="w-full py-2 rounded-xl font-semibold text-[11px] tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(34,197,94,0.25)",
                }}
              >
                CASHOUT ${(betAmountUsed * currentMultiplier).toFixed(2)}
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onRandomPick}
              className="w-full py-2 rounded-xl font-semibold text-[11px] tracking-wide border border-white/12 bg-white/[0.06] text-white/85"
            >
              RANDOM PICK
            </motion.button>
          </div>
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
                    key={r.id ?? i}
                    className="flex items-center justify-between px-2 py-1 rounded-lg text-[11px] shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="inline-flex items-center justify-center w-4" style={{ color: r.won ? "#22c55e" : "#ef4444" }}>
                      {r.won ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <X className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>${r.betAmount.toFixed(2)}</span>
                    <span style={{ color: r.won ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                      {r.won ? `${r.multiplier.toFixed(2)}×` : "OUT"}
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
