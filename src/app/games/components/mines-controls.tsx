"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { GameMode, MineCount, MINE_OPTIONS, calcMultiplier } from "../../../interfaces/interface";

const PRIMARY = "#c8a2ff";
const SURFACE = "#131212";

interface MinesControlsProps {
  gameMode: GameMode;
  onGameModeChange: (m: GameMode) => void;
  betAmount: number;
  onBetAmountChange: (v: number) => void;
  mineCount: MineCount;
  onMineCountChange: (m: MineCount) => void;
  phase: "idle" | "playing" | "won" | "lost";
  gemsFound: number;
  currentMultiplier: number;
  profit: number;
  betAmountUsed: number;
  onBet: () => void;
  onCashout: () => void;
  onRandomPick: () => void;
  results: { multiplier: number; payout: number; bet: number; won: boolean }[];
}

export default function MinesControls({
  gameMode,
  onGameModeChange,
  betAmount,
  onBetAmountChange,
  mineCount,
  onMineCountChange,
  phase,
  gemsFound,
  currentMultiplier,
  profit,
  betAmountUsed,
  onBet,
  onCashout,
  onRandomPick,
  results,
}: MinesControlsProps) {
  const [minesOpen, setMinesOpen] = useState(false);
  const isPlaying = phase === "playing";
  const isIdle = phase === "idle";
  const gemCount = 25 - mineCount;

  // Next gem multiplier (if you find one more)
  const nextMult = calcMultiplier(mineCount, gemsFound + 1);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2 p-3 overflow-hidden text-[#ededed]">
      <div className="flex flex-col gap-2 shrink-0">
        <div
          className="order-3 md:order-1 flex shrink-0 rounded overflow-hidden"
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

        <div className="order-2 md:order-2 shrink-0">
          <div className="text-[10px] tracking-wider text-white/50 mb-1">BET AMOUNT</div>
          <div
            className="flex items-center gap-2 rounded px-2.5 py-2"
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
              className="flex-1 bg-transparent outline-none text-white text-sm min-w-0 rounded py-1 px-1"
              disabled={isPlaying}
              step={0.01}
              min={0}
            />
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount / 2)}
              disabled={isPlaying}
              className="px-2 py-1 rounded text-[11px] font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
            >
              ½
            </button>
            <button
              type="button"
              onClick={() => !isPlaying && onBetAmountChange(betAmount * 2)}
              disabled={isPlaying}
              className="px-2 py-1 rounded text-[11px] font-semibold"
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
                  className="flex-1 py-1 rounded text-[11px] transition-all border border-white/[0.08] bg-white/[0.04] text-white/55"
                >
                  ${v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="order-4 md:order-3 shrink-0">
          <div className="text-[10px] tracking-wider text-white/50 mb-1">MINES</div>
          <div className="relative" style={{ opacity: isPlaying ? 0.5 : 1 }}>
            <button
              type="button"
              onClick={() => !isPlaying && setMinesOpen(!minesOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,162,255,0.1)",
                cursor: isPlaying ? "not-allowed" : "pointer",
              }}
            >
              <span>{mineCount}</span>
              <span
                style={{
                  color: "rgba(255,255,255,0.4)",
                  display: "inline-block",
                  transform: minesOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                ▼
              </span>
            </button>
            <AnimatePresence>
              {minesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute left-0 right-0 rounded mt-1 z-20 overflow-hidden max-h-36 overflow-y-auto"
                  style={{ background: SURFACE, border: "1px solid rgba(200,162,255,0.15)" }}
                >
                  {MINE_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        onMineCountChange(m);
                        setMinesOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-all"
                      style={{
                        color: mineCount === m ? "#fff" : "rgba(255,255,255,0.65)",
                        background: mineCount === m ? "rgba(200,162,255,0.1)" : "transparent",
                      }}
                    >
                      <span>{m} mines</span>
                      <span className="text-white/35 text-[10px]">{25 - m} gems</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className="order-5 md:order-4 shrink-0 rounded px-2.5 py-1.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,162,255,0.08)" }}
        >
          <div className="text-[10px] tracking-wider text-white/50">GEMS</div>
          <div className="text-emerald-400 font-semibold text-sm">
            {isPlaying ? `${gemsFound} / ${gemCount}` : gemCount}
          </div>
        </div>

        <AnimatePresence>
          {isPlaying && gemsFound > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="order-6 md:order-5 shrink-0 rounded px-2.5 py-1.5"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <div className="text-[10px] tracking-wider text-white/50">MULTIPLIER</div>
              <div className="text-emerald-400 font-semibold text-sm">{currentMultiplier}×</div>
              <div className="text-white/40 text-[10px] mt-0.5">Next → {nextMult}×</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="order-7 md:order-6 shrink-0">
          <div className="flex items-center justify-between text-[10px] tracking-wider text-white/50 mb-1">
            <span className="truncate pr-1">PROFIT ({isPlaying ? `${currentMultiplier}×` : "1×"})</span>
            <span style={{ color: profit >= 0 ? "#4ade80" : "#f87171" }}>
              {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
            </span>
          </div>
          <div
            className="rounded px-2.5 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,162,255,0.08)" }}
          >
            <span className="text-white text-xs font-semibold">
              {isPlaying ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : "0.00"}
            </span>
          </div>
        </div>

        {isIdle || phase === "won" || phase === "lost" ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onBet}
            className="order-1 md:order-7 w-full py-2.5 rounded font-semibold text-xs tracking-wide text-[#131212]"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #9d6fd8 100%)`,
              boxShadow: "0 4px 18px rgba(200,162,255,0.28)",
            }}
          >
            BET
          </motion.button>
        ) : (
          <div className="order-1 md:order-7 flex flex-col gap-1.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onCashout}
              disabled={gemsFound === 0}
              className="w-full py-2.5 rounded font-semibold text-xs tracking-wide"
              style={{
                background:
                  gemsFound > 0 ? "linear-gradient(135deg, #22c55e 0%, #15803d 100%)" : "rgba(255,255,255,0.08)",
                color: gemsFound > 0 ? "#fff" : "rgba(255,255,255,0.3)",
                boxShadow: gemsFound > 0 ? "0 4px 18px rgba(34,197,94,0.25)" : "none",
                cursor: gemsFound === 0 ? "not-allowed" : "pointer",
              }}
            >
              CASHOUT {gemsFound > 0 ? `$${(betAmountUsed * currentMultiplier).toFixed(2)}` : ""}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onRandomPick}
              className="w-full py-2 rounded font-semibold text-[11px] tracking-wide border border-white/12 bg-white/[0.06] text-white/85"
            >
              RANDOM PICK
            </motion.button>
          </div>
        )}
      </div>

      <div className="order-8 md:order-8 flex flex-col flex-1 min-h-0 gap-1 pt-0.5">
        <div className="text-[10px] tracking-wider text-white/50 shrink-0">RECENT</div>
        <div
          className="flex-1 min-h-[72px] overflow-y-auto rounded px-2 py-1.5 border border-white/[0.08] bg-white/[0.03]"
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
                    className="flex items-center justify-between px-2 py-1 rounded text-[11px] shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="inline-flex items-center justify-center w-4" style={{ color: r.won ? "#22c55e" : "#ef4444" }}>
                      {r.won ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <X className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>${r.bet.toFixed(2)}</span>
                    <span style={{ color: r.won ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                      {r.won ? `${r.multiplier}×` : "BOOM"}
                    </span>
                    <span style={{ color: r.won ? "#22c55e" : "#ef4444" }}>
                      {r.won ? `+$${(r.payout - r.bet).toFixed(2)}` : `-$${r.bet.toFixed(2)}`}
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
