"use client";

import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, OctagonAlert, PartyPopper, Skull, Snowflake } from "lucide-react";
import { RedlightDifficulty, REDLIGHT_DIFFICULTY_COLORS } from "../../../interfaces/interface";

interface RunnerTrackProps {
  phase: "idle" | "green" | "red" | "frozen" | "frozen-red" | "eliminated" | "cashedout";
  progress: number;
  currentMultiplier: number;
  difficulty: RedlightDifficulty;
  round: number;
  /** Vertical belt + treadmill scroll (mobile HUD only; desktop uses horizontal track) */
  vertical?: boolean;
}

export default function RunnerTrack({
  phase,
  progress,
  currentMultiplier,
  difficulty,
  round,
  vertical = false,
}: RunnerTrackProps) {
  const color = REDLIGHT_DIFFICULTY_COLORS[difficulty];
  const isRunning = phase === "green";
  const isEliminated = phase === "eliminated";
  const isFrozen = phase === "frozen" || phase === "frozen-red";
  const isCashedout = phase === "cashedout";
  const isRed = phase === "red" || phase === "frozen-red";
  const charId = useId().replace(/:/g, "");

  if (vertical) {
    return (
      <VerticalRunnerTrack
        phase={phase}
        progress={progress}
        color={color}
        round={round}
        isRunning={isRunning}
        isEliminated={isEliminated}
        isFrozen={isFrozen}
        isRed={isRed}
        charId={charId}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 px-8 py-6">
      {/* Round badge */}
      <div className="flex items-center gap-3">
        {round > 0 && (
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Courier New', monospace",
              letterSpacing: 1,
            }}
          >
            ROUND {round}
          </div>
        )}
        {isRed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
            style={{ background: "#ef4444", color: "#fff", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}
          >
            <OctagonAlert className="w-3.5 h-3.5 shrink-0" aria-hidden />
            RED LIGHT — FREEZE NOW!
          </motion.div>
        )}
      </div>

      {/* Multiplier display */}
      <div className="text-center">
        <motion.div
          animate={isRunning ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 2 }}
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: isEliminated ? "#ef4444" : isCashedout ? "#22c55e" : color,
            fontFamily: "'Courier New', monospace",
            lineHeight: 1,
            textShadow: `0 0 30px ${isEliminated ? "rgba(239,68,68,0.4)" : isCashedout ? "rgba(34,197,94,0.4)" : color + "66"}`,
            letterSpacing: -2,
          }}
        >
          {isEliminated
            ? "OUT!"
            : isCashedout
              ? `+$${(currentMultiplier - 1).toFixed(2)}`
              : `${currentMultiplier.toFixed(2)}×`}
        </motion.div>
        {!isEliminated && !isCashedout && (
          <div
            className="mt-1 flex justify-center text-sm"
            style={{
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {phase === "idle" ? (
              "place a bet and start"
            ) : phase === "frozen" || phase === "frozen-red" ? (
              <span className="inline-flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2.5} aria-hidden />
                safely frozen
              </span>
            ) : (
              "current multiplier"
            )}
          </div>
        )}
        {isCashedout && (
          <div
            className="inline-flex items-center justify-center gap-1.5 mt-1 text-base text-emerald-500"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            cashed out at {currentMultiplier.toFixed(2)}×
            <PartyPopper className="w-4 h-4 shrink-0" aria-hidden />
          </div>
        )}
      </div>

      {/* Track */}
      <div className="relative w-full" style={{ height: 80 }}>
        {/* Track background */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(to right, #0f1923, #1a2535)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Lane markers */}
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${(i + 1) * 9.09}%`,
                background: "rgba(255,255,255,0.04)",
              }}
            />
          ))}

          {/* Progress fill */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 rounded-2xl"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05 }}
            style={{
              background: isEliminated
                ? "linear-gradient(to right, rgba(239,68,68,0.15), rgba(239,68,68,0.25))"
                : `linear-gradient(to right, ${color}18, ${color}30)`,
              borderRight: `2px solid ${isEliminated ? "#ef4444" : color}`,
            }}
          />

          {/* Finish line */}
          <div className="absolute right-4 top-0 bottom-0 flex items-center">
            <div
              style={{
                width: 3,
                height: "60%",
                background:
                  "repeating-linear-gradient(to bottom, #fff 0px, #fff 4px, transparent 4px, transparent 8px)",
                opacity: 0.3,
              }}
            />
          </div>
        </div>

        {/* Runner character */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          animate={{ left: `calc(${Math.min(progress, 96)}% - 24px)` }}
          transition={{ duration: 0.05 }}
          style={{ zIndex: 10 }}
        >
          <RunnerCharacter charId={charId} phase={phase} color={color} />
        </motion.div>
      </div>

      {/* Progress bar (thin) */}
      <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
          style={{
            background: isEliminated ? "#ef4444" : isCashedout ? "#22c55e" : color,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>

      {/* Distance label */}
      <div
        className="flex justify-between"
        style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}
      >
        <span>START</span>
        <span>{progress.toFixed(1)}%</span>
        <span>FINISH</span>
      </div>

      {/* Phase overlays */}
      <AnimatePresence>
        {isEliminated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-2xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            <div className="flex items-start justify-center gap-2 text-sm text-red-500">
              <Skull className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>You didn&apos;t freeze in time. You&apos;re eliminated.</span>
            </div>
          </motion.div>
        )}
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-2xl"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            <div style={{ fontSize: 13, color: "#22c55e" }}>
              Survived the red light! Cash out or keep running for higher multipliers.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerticalRunnerTrack({
  phase,
  progress,
  color,
  round,
  isRunning,
  isEliminated,
  isFrozen,
  isRed,
  charId,
}: {
  phase: RunnerTrackProps["phase"];
  progress: number;
  color: string;
  round: number;
  isRunning: boolean;
  isEliminated: boolean;
  isFrozen: boolean;
  isRed: boolean;
  charId: string;
}) {
  const beltLines = Array.from({ length: 14 }, (_, i) => i);
  const p = Math.min(progress, 96);

  return (
    <div className="flex w-full flex-col gap-3 px-3 py-2">
      <div className="flex items-center gap-2">
        {round > 0 && (
          <div
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Courier New', monospace",
              letterSpacing: 1,
            }}
          >
            R{round}
          </div>
        )}
        {isRed && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.03, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 0.4 }}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white"
            style={{ background: "#ef4444", fontFamily: "'Courier New', monospace" }}
          >
            <OctagonAlert className="h-3 w-3 shrink-0" aria-hidden />
            FREEZE
          </motion.div>
        )}
      </div>

      <div className="flex min-h-[180px] w-full flex-1 flex-row items-stretch justify-center gap-1.5 md:max-h-[min(44svh,320px)]">
        <div
          className="flex flex-col justify-between py-1 text-[9px] uppercase tracking-wider text-white/30"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          <span className="text-right">finish</span>
          <span className="text-right">{progress.toFixed(0)}%</span>
          <span className="text-right">start</span>
        </div>

        <div className="relative mx-auto w-[min(32vw,112px)] min-w-[88px] flex-1 overflow-hidden rounded-2xl">
          {/* Scrolling belt ribs (illusion of belt moving upward) */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 rounded-2xl"
            aria-hidden
            animate={isRunning ? { y: [0, 48] } : { y: 0 }}
            transition={
              isRunning ? { duration: 0.65, repeat: Infinity, ease: "linear" } : { duration: 0.15 }
            }
            style={{
              top: "-100%",
              backgroundImage:
                "repeating-linear-gradient(180deg, transparent 0px, transparent 14px, rgba(255,255,255,0.07) 14px, rgba(255,255,255,0.07) 16px)",
              backgroundSize: "100% 48px",
            }}
          />

          <div
            className="absolute inset-0 z-[1] rounded-2xl"
            style={{
              background: "linear-gradient(to top, #0f1923 0%, #1a2535 50%, #142536 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          {/* Horizontal lane markers (belt ribs) */}
          <div className="absolute inset-0 z-[2] overflow-hidden rounded-2xl">
            {beltLines.map((i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-white/[0.06]"
                style={{ top: `${(i + 1) * 7.14}%` }}
              />
            ))}
          </div>

          {/* Progress fill rising from start (bottom) toward finish (top) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-[3] rounded-b-2xl"
            animate={{ height: `${p}%` }}
            transition={{ duration: 0.05 }}
            style={{
              background: isEliminated
                ? "linear-gradient(to top, rgba(239,68,68,0.2), rgba(239,68,68,0.12))"
                : `linear-gradient(to top, ${color}35, ${color}18)`,
              borderTop: `2px solid ${isEliminated ? "#ef4444" : color}`,
              boxShadow: isEliminated ? "none" : `0 -4px 24px ${color}22`,
            }}
          />

          {/* Finish line (top) */}
          <div className="absolute left-3 right-3 top-3 z-[4] flex justify-center">
            <div
              style={{
                height: 3,
                width: "72%",
                background:
                  "repeating-linear-gradient(to right, #fff 0px, #fff 5px, transparent 5px, transparent 10px)",
                opacity: 0.35,
              }}
            />
          </div>

          {/* Runner — feet track bottom edge at progress */}
          <div className="absolute left-1/2 z-[10] -translate-x-1/2" style={{ bottom: `${p}%` }}>
            <RunnerCharacter charId={charId} phase={phase} color={color} size={44} />
          </div>
        </div>

        <div
          className="relative flex h-full min-h-[140px] w-1.5 shrink-0 justify-end overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-full"
            style={{
              background: phase === "cashedout" ? "#22c55e" : isEliminated ? "#ef4444" : color,
              boxShadow: `0 0 8px ${color}44`,
            }}
            animate={{ height: `${p}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>

      <div className="w-full rounded-full" style={{ height: 5, background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
          style={{
            background: isEliminated ? "#ef4444" : phase === "cashedout" ? "#22c55e" : color,
          }}
        />
      </div>

      <AnimatePresence>
        {isEliminated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 text-center text-xs text-red-400"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Skull className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Didn&apos;t freeze in time.
            </span>
          </motion.div>
        )}
        {isFrozen && !isEliminated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 text-center text-[11px]"
            style={{
              color: "#22c55e",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Safe. Cash out or keep running.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RunnerCharacter({
  charId,
  phase,
  color,
  size = 48,
}: {
  charId: string;
  phase: string;
  color: string;
  size?: number;
}) {
  const isRunning = phase === "green";
  const isEliminated = phase === "eliminated";
  const isFrozen = phase === "frozen" || phase === "frozen-red" || phase === "red";

  return (
    <motion.div
      animate={isRunning ? { y: [0, -3, 0, -2, 0] } : { y: 0 }}
      transition={{ repeat: isRunning ? Infinity : 0, duration: 0.4 }}
      style={{ position: "relative" }}
    >
      <svg viewBox="0 0 48 48" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`charGrad-${charId}`} cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor={isEliminated ? "#ff8080" : isFrozen ? "#80c0ff" : "#fff"} />
            <stop offset="100%" stopColor={isEliminated ? "#ef4444" : isFrozen ? "#3b82f6" : color} />
          </radialGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="24" cy="46" rx="10" ry="2" fill="rgba(0,0,0,0.3)" />
        {/* Body */}
        <circle cx="24" cy="16" r="10" fill={`url(#charGrad-${charId})`} />
        {/* Eyes */}
        {!isEliminated ? (
          <>
            <circle cx="21" cy="14" r="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="27" cy="14" r="1.5" fill="rgba(0,0,0,0.5)" />
            <path
              d="M 20 19 Q 24 22 28 19"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <line x1="19" y1="12" x2="23" y2="16" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="23" y1="12" x2="19" y2="16" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="25" y1="12" x2="29" y2="16" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="29" y1="12" x2="25" y2="16" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {/* Legs */}
        <motion.g
          animate={isRunning ? { rotate: [-15, 15, -15] } : { rotate: 0 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 0.35 }}
          style={{ transformOrigin: "24px 28px" }}
        >
          <line x1="18" y1="28" x2="14" y2="40" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="28" x2="34" y2="40" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        {/* Torso */}
        <rect
          x="19"
          y="25"
          width="10"
          height="8"
          rx="3"
          fill={isEliminated ? "#ef4444" : isFrozen ? "#3b82f6" : color}
        />
        {/* Arms */}
        <motion.g
          animate={isRunning ? { rotate: [20, -20, 20] } : { rotate: 0 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 0.35 }}
          style={{ transformOrigin: "24px 27px" }}
        >
          <line x1="19" y1="27" x2="11" y2="33" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="29" y1="27" x2="37" y2="33" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>
        {/* Freeze badge */}
        {isFrozen && (
          <foreignObject x="12" y="0" width="24" height="12">
            <div className="pointer-events-none flex h-full w-full items-center justify-center">
              <Snowflake className="h-3 w-3 text-white" strokeWidth={2} aria-hidden />
            </div>
          </foreignObject>
        )}
      </svg>
    </motion.div>
  );
}
