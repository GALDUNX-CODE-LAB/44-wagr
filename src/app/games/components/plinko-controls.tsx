"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Difficulty, GameMode, ROW_OPTIONS, BetResult } from "../../../interfaces/interface";

interface PlinkoControlsProps {
  betAmount: number;
  onBetAmountChange: (val: number) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  rows: number;
  onRowsChange: (r: number) => void;
  gameMode: GameMode;
  onGameModeChange: (m: GameMode) => void;
  onBet: () => void;
  isAutoRunning: boolean;
  onAutoToggle: () => void;
  autoCount: number;
  onAutoCountChange: (n: number) => void;
  results: BetResult[];
}

const PRIMARY = "#c8a2ff";
const SURFACE = "#131212";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#4caf50" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

export default function PlinkoControls({
  betAmount,
  onBetAmountChange,
  difficulty,
  onDifficultyChange,
  rows,
  onRowsChange,
  gameMode,
  onGameModeChange,
  onBet,
  isAutoRunning,
  onAutoToggle,
  autoCount,
  onAutoCountChange,
  results,
}: PlinkoControlsProps) {
  const [diffOpen, setDiffOpen] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2 p-3 overflow-hidden font-sans text-[#ededed]">
      <div className="flex flex-col gap-2 shrink-0">
      <div
        className="flex rounded-xl overflow-hidden shrink-0"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
      >
        {(["manual", "auto"] as GameMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onGameModeChange(mode)}
            className="flex-1 py-1.5 text-xs font-semibold transition-all duration-200 capitalize tracking-wide"
            style={{
              background: gameMode === mode ? PRIMARY : "transparent",
              color: gameMode === mode ? SURFACE : "rgba(255,255,255,0.45)",
              borderRadius: 10,
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
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
        >
          <input
            type="number"
            value={betAmount}
            onChange={(e) => onBetAmountChange(Math.max(0, parseFloat(e.target.value) || 0))}
            className="flex-1 bg-transparent outline-none text-white text-sm min-w-0"
            step={0.01}
            min={0}
          />
          <button
            type="button"
            onClick={() => onBetAmountChange(betAmount / 2)}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
          >
            ½
          </button>
          <button
            type="button"
            onClick={() => onBetAmountChange(betAmount * 2)}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}
          >
            2×
          </button>
        </div>
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
      </div>

      <div className="shrink-0">
        <div className="text-[10px] tracking-wider text-white/50 mb-1">DIFFICULTY</div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDiffOpen(!diffOpen);
              setRowsOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-sm text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.color }}
              />
              <span className="capitalize">{difficulty}</span>
            </span>
            <span
              className="text-white/40 inline-block transition-transform duration-200"
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
                {DIFFICULTY_OPTIONS.map((opt) => (
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
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0">
        <div className="text-[10px] tracking-wider text-white/50 mb-1">ROWS</div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRowsOpen(!rowsOpen);
              setDiffOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-sm text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
          >
            <span>{rows}</span>
            <span
              className="text-white/40 inline-block transition-transform duration-200"
              style={{ transform: rowsOpen ? "rotate(180deg)" : "none" }}
            >
              ▼
            </span>
          </button>
          <AnimatePresence>
            {rowsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 rounded-xl mt-1 z-20 overflow-hidden max-h-36 overflow-y-auto"
                style={{ background: SURFACE, border: "1px solid rgba(200,162,255,0.15)" }}
              >
                {ROW_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onRowsChange(r);
                      setRowsOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-sm transition-all"
                    style={{
                      color: rows === r ? "#fff" : "rgba(255,255,255,0.65)",
                      background: rows === r ? "rgba(200,162,255,0.1)" : "transparent",
                    }}
                  >
                    {r} rows
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {gameMode === "auto" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0"
          >
            <div className="text-[10px] tracking-wider text-white/50 mb-1">NUMBER OF BETS</div>
            <input
              type="number"
              value={autoCount}
              onChange={(e) => onAutoCountChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-2.5 py-1.5 rounded-xl outline-none text-white text-sm"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,162,255,0.1)" }}
              min={1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {gameMode === "manual" ? (
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
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onAutoToggle}
          className="w-full py-2 rounded-xl font-semibold text-[11px] tracking-wide text-[#131212]"
          style={{
            background: isAutoRunning
              ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
              : `linear-gradient(135deg, ${PRIMARY} 0%, #7c5cbf 100%)`,
            boxShadow: isAutoRunning ? "0 4px 18px rgba(239,68,68,0.3)" : "0 4px 18px rgba(200,162,255,0.28)",
          }}
        >
          {isAutoRunning ? "STOP" : "START AUTO"}
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
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-2 py-1 rounded-lg text-[11px] shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-white/45">${r.betAmount.toFixed(2)}</span>
                    <span style={{ color: getMultColor(r.multiplier) }} className="font-bold">
                      {r.multiplier}×
                    </span>
                    <span className={r.payout >= r.betAmount ? "text-emerald-400" : "text-red-400"}>
                      ${r.payout.toFixed(2)}
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

function getMultColor(mult: number): string {
  if (mult >= 10) return PRIMARY;
  if (mult >= 2) return "#f59e0b";
  if (mult >= 1) return "#4caf50";
  return "#ef4444";
}
