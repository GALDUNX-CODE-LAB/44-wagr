"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Skull, Trophy, X } from "lucide-react";
import { RPSGameState, RPSChoice, ROUND_MULTIPLIERS, RoundResult } from "../../../interfaces/interface";
import RPSHand from "./rps-hand";

interface RPSBoardProps {
  gameState: RPSGameState;
  onPlay: (choice: RPSChoice) => void;
}

const RESULT_COLORS: Record<RoundResult, string> = {
  win: "#22c55e",
  lose: "#ef4444",
  draw: "#f59e0b",
};

const PRIMARY = "#c8a2ff";

export default function RPSBoard({ gameState, onPlay }: RPSBoardProps) {
  const { phase, currentRound, rounds, currentMultiplier, animating } = gameState;
  const isPlaying = phase === "playing";
  const lastPlayedRound = [...rounds].reverse().find((r) => r.result !== null);

  /** Ladder SVG scales with card (mobile uses smaller deck) */
  const ladderSvgClass = "w-[44px] h-[54px] sm:w-[56px] sm:h-[68px] md:w-[70px] md:h-[85px]";

  return (
    <div className="w-full h-full min-h-0 flex flex-col relative overflow-hidden bg-[#1c1c1c]">
      {/* ── Card ladder (top, horizontal) ─────────────────────────────────── */}
      <div className="flex items-end justify-end gap-1 sm:gap-2 md:gap-3 px-2 sm:px-6 md:px-8 pt-3 sm:pt-6 md:pt-8 pb-1.5 sm:pb-2 flex-shrink-0 overflow-x-auto [scrollbar-width:thin]">
        {ROUND_MULTIPLIERS.map((mult, i) => {
          const isUnlocked = phase !== "idle" && currentRound > i + 1;
          const isCurrent = phase !== "idle" && currentRound === i + 1;
          const isActive = isUnlocked || isCurrent;

          return (
            <div key={i} className="flex flex-col items-center gap-0.5 sm:gap-2 shrink-0">
              {/* Card */}
              <motion.div
                animate={
                  isCurrent && isPlaying
                    ? {
                        y: [0, -4, 0],
                        boxShadow: [`0 0 0px ${PRIMARY}`, `0 0 20px rgba(200,162,255,0.55)`, `0 0 0px ${PRIMARY}`],
                      }
                    : {}
                }
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden w-[52px] h-[64px] sm:w-[72px] sm:h-[88px] md:w-[90px] md:h-[110px]"
                style={{
                  background: isUnlocked
                    ? "linear-gradient(135deg, #22c55e 0%, #15803d 100%)"
                    : isCurrent
                      ? "linear-gradient(135deg, #c8a2ff 0%, #7c3aed 100%)"
                      : "rgba(255,255,255,0.05)",
                  border: isCurrent
                    ? "2.5px solid rgba(200,162,255,0.85)"
                    : isUnlocked
                      ? "2.5px solid #4ade80"
                      : "2px solid rgba(255,255,255,0.08)",
                  boxShadow: isCurrent
                    ? "0 0 24px rgba(200,162,255,0.35)"
                    : isUnlocked
                      ? "0 0 20px rgba(34,197,94,0.3)"
                      : "none",
                  transition: "all 0.3s",
                }}
              >
                {isActive ? (
                  <>
                    {/* Card face */}
                    <svg viewBox="0 0 70 85" className={ladderSvgClass} xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      {/* Diamond */}
                      <polygon
                        points="35,15 55,40 35,65 15,40"
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="2"
                      />
                      {/* 44 Wagr or logo text */}
                      <text
                        x="35"
                        y="44"
                        textAnchor="middle"
                        fontSize="9"
                        fill="rgba(255,255,255,0.8)"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                      >
                        44W
                      </text>
                      {/* Corner marks (card pips) */}
                      <polygon points="8,14 10.2,16.2 8,18.4 5.8,16.2" fill="rgba(255,255,255,0.5)" />
                      <polygon points="62,66.6 64.2,68.8 62,71 59.8,68.8" fill="rgba(255,255,255,0.5)" />
                    </svg>
                    {/* Unlocked checkmark */}
                    {isUnlocked && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.25)", borderRadius: 14 }}
                      >
                        <Check
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white drop-shadow-sm"
                          strokeWidth={3}
                          aria-hidden
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty locked card */
                  <div style={{ width: "100%", height: "100%" }} />
                )}
              </motion.div>

              {/* Multiplier label */}
              <div
                className="text-[10px] sm:text-[11px] md:text-[13px] font-bold"
                style={{
                  color: isUnlocked ? "#4ade80" : isCurrent ? PRIMARY : "rgba(255,255,255,0.25)",
                  background: isCurrent ? "rgba(200,162,255,0.12)" : "transparent",
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: isCurrent ? "1px solid rgba(200,162,255,0.35)" : "1px solid transparent",
                }}
              >
                {mult.toFixed(2)}×
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Arena (middle) ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center gap-4 sm:gap-10 md:gap-16 px-2 sm:px-6 md:px-10 min-h-0">
        {/* Player side */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <div className="text-[11px] tracking-[0.2em] text-white/30">YOU</div>
          <motion.div
            key={lastPlayedRound?.playerChoice || "empty-p"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="rounded-xl sm:rounded-2xl flex items-center justify-center w-[76px] h-[92px] sm:w-[92px] sm:h-[112px] md:w-[110px] md:h-[130px]"
            style={{
              background: lastPlayedRound?.result
                ? lastPlayedRound.result === "win"
                  ? "rgba(34,197,94,0.12)"
                  : lastPlayedRound.result === "draw"
                    ? "rgba(245,158,11,0.1)"
                    : "rgba(239,68,68,0.12)"
                : "rgba(255,255,255,0.04)",
              border: lastPlayedRound?.result
                ? `2px solid ${RESULT_COLORS[lastPlayedRound.result]}44`
                : "2px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          >
            <div className="flex scale-[0.72] sm:scale-[0.85] md:scale-100 origin-center">
              <RPSHand
                choice={lastPlayedRound?.playerChoice || null}
                size={68}
                glow={lastPlayedRound?.result === "win"}
                glowColor="#22c55e"
              />
            </div>
          </motion.div>
          {lastPlayedRound?.result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold tracking-wide"
              style={{
                color: RESULT_COLORS[lastPlayedRound.result],
              }}
            >
              {lastPlayedRound.result === "win" ? (
                <span className="inline-flex items-center gap-1">
                  WIN <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
                </span>
              ) : lastPlayedRound.result === "draw" ? (
                "DRAW"
              ) : (
                <span className="inline-flex items-center gap-1">
                  LOSS <X className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* VS badge */}
        <div className="text-[14px] sm:text-[22px] font-black text-white/[0.12] tracking-[0.15em] sm:tracking-[0.2em] shrink-0">
          VS
        </div>

        {/* House side */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-3">
          <div className="text-[11px] tracking-[0.2em] text-white/30">HOUSE</div>
          <motion.div
            key={lastPlayedRound?.houseChoice || "empty-h"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="rounded-xl sm:rounded-2xl flex items-center justify-center w-[76px] h-[92px] sm:w-[92px] sm:h-[112px] md:w-[110px] md:h-[130px]"
            style={{
              background: lastPlayedRound?.result
                ? lastPlayedRound.result === "lose"
                  ? "rgba(34,197,94,0.08)"
                  : lastPlayedRound.result === "draw"
                    ? "rgba(245,158,11,0.08)"
                    : "rgba(239,68,68,0.1)"
                : "rgba(255,255,255,0.04)",
              border: lastPlayedRound?.result
                ? `2px solid ${lastPlayedRound.result === "lose" ? "#22c55e33" : lastPlayedRound.result === "draw" ? "#f59e0b33" : "#ef444433"}`
                : "2px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          >
            <div className="flex scale-[0.72] sm:scale-[0.85] md:scale-100 origin-center">
              <RPSHand choice={lastPlayedRound?.houseChoice || null} size={68} isHouse />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Machine / choice buttons (bottom) ───────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col items-center gap-0 pb-3 sm:pb-6 w-full max-w-[min(100%,280px)] mx-auto px-1">
        {/* Machine housing top */}
        <div
          className="rounded-t-lg sm:rounded-t-xl flex items-center justify-center w-[min(100%,200px)] sm:w-[240px] h-7 sm:h-8"
          style={{
            background: "#252525",
            borderTop: "2px solid rgba(200,162,255,0.22)",
            marginBottom: -2,
            zIndex: 1,
          }}
        >
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[7px] border-l-transparent border-r-transparent border-b-[rgba(200,162,255,0.28)] sm:border-l-8 sm:border-r-8 sm:border-b-8 sm:border-b-[rgba(200,162,255,0.28)]" />
        </div>
        {/* Machine body */}
        <div
          className="rounded-b-lg sm:rounded-b-xl w-full max-w-[min(100%,220px)] sm:max-w-[280px] h-2 sm:h-[10px]"
          style={{ background: "#1a1a1a" }}
        />

        {/* Connector lines */}
        <div className="relative flex justify-center w-full h-7 sm:h-10 max-w-[min(100%,220px)] sm:max-w-[280px]">
          <svg
            viewBox="0 0 280 40"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M 140 0 L 140 15 L 60 15 L 60 40"
              stroke="rgba(200,162,255,0.35)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M 140 0 L 140 15 L 140 40" stroke="rgba(200,162,255,0.35)" strokeWidth="3" fill="none" />
            <path
              d="M 140 0 L 140 15 L 220 15 L 220 40"
              stroke="rgba(200,162,255,0.35)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* RPS Buttons */}
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 w-full px-1">
          {(["rock", "paper", "scissors"] as RPSChoice[]).map((choice) => (
            <ChoiceButton
              key={choice}
              choice={choice}
              disabled={!isPlaying || animating}
              onClick={() => onPlay(choice)}
            />
          ))}
        </div>
      </div>

      {/* ── Result overlays ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {(phase === "won" || phase === "lost") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            style={{ background: phase === "won" ? "rgba(0,40,15,0.3)" : "rgba(60,0,0,0.3)" }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-xl sm:rounded-2xl px-6 py-4 sm:px-10 sm:py-6 text-center mx-4 max-w-[min(320px,92vw)] sm:max-w-none sm:min-w-[220px]"
              style={{
                background:
                  phase === "won"
                    ? "linear-gradient(135deg, #051510, #0a2a1a)"
                    : "linear-gradient(135deg, #1a0404, #2d0808)",
                border: `1px solid ${phase === "won" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              <div className="flex justify-center text-3xl sm:text-[40px] leading-none">
                {phase === "won" ? (
                  <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Skull className="w-9 h-9 sm:w-11 sm:h-11 text-red-500" strokeWidth={1.75} aria-hidden />
                )}
              </div>
              <div
                className="text-lg sm:text-2xl mt-1.5 sm:mt-2 font-black"
                style={{ color: phase === "won" ? "#22c55e" : "#ef4444" }}
              >
                {phase === "won" ? "YOU WIN!" : "ELIMINATED"}
              </div>
              <div className="text-[11px] sm:text-xs text-white/40 mt-1 sm:mt-1">
                {phase === "won"
                  ? `${currentMultiplier.toFixed(2)}× → $${(gameState.betAmount * currentMultiplier).toFixed(2)}`
                  : `Lost $${gameState.betAmount.toFixed(2)}`}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceButton({ choice, disabled, onClick }: { choice: RPSChoice; disabled: boolean; onClick: () => void }) {
  const LABELS: Record<RPSChoice, string> = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.06, y: -3 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1 w-[62px] h-[70px] sm:w-[72px] sm:h-[82px] md:w-[80px] md:h-[88px] shrink-0"
      style={{
        background: disabled
          ? "linear-gradient(145deg, #2a2828, #1a1818)"
          : "linear-gradient(135deg, #c8a2ff 0%, #9d6fd8 100%)",
        border: "3px solid",
        borderColor: disabled ? "rgba(255,255,255,0.08)" : "rgba(200,162,255,0.65)",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 18px rgba(200,162,255,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Button top bevel */}
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
        style={{ background: disabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.22)" }}
      />

      <div className="flex scale-[0.88] sm:scale-95 md:scale-100 origin-center">
        <RPSHand choice={choice} size={42} />
      </div>
      <span
        className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight"
        style={{ color: disabled ? "rgba(255,255,255,0.3)" : "#131212" }}
      >
        {LABELS[choice]}
      </span>

      {/* Machine base notch */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 12,
          height: 4,
          background: disabled ? "#2a2828" : "#7c3aed",
          borderRadius: "2px 2px 0 0",
        }}
      />
    </motion.button>
  );
}
