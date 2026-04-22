"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cell } from "../../../interfaces/interface";

interface MinesGridProps {
  cells: Cell[];
  phase: "idle" | "playing" | "won" | "lost";
  onCellClick: (index: number) => void;
}

export default function MinesGrid({ cells, phase, onCellClick }: MinesGridProps) {
  const isClickable = phase === "playing";

  return (
    <div className="w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-3 md:p-4">
      <div
        className="grid gap-1 sm:gap-1.5 md:gap-2 w-full max-w-[min(100%,380px)] md:max-w-[min(100%,440px)] lg:max-w-[min(100%,500px)] aspect-square max-h-full"
        style={{
          gridTemplateColumns: "repeat(5, 1fr)",
        }}
      >
        {cells.map((cell, i) => (
          <MinesCell
            key={i}
            cell={cell}
            phase={phase}
            onClick={() => isClickable && !cell.isRevealed && onCellClick(i)}
          />
        ))}
      </div>
    </div>
  );
}

interface MinesCellProps {
  cell: Cell;
  phase: string;
  onClick: () => void;
}

function MinesCell({ cell, phase, onClick }: MinesCellProps) {
  const isClickable = phase === "playing" && !cell.isRevealed;

  return (
    <motion.button
      onClick={onClick}
      whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden"
      style={{
        aspectRatio: "1/1",
        cursor: isClickable ? "pointer" : "default",
        outline: "none",
        border: "none",
        padding: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {!cell.isRevealed ? (
          /* Hidden cell */
          <motion.div
            key="hidden"
            initial={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 rounded-lg sm:rounded-xl flex items-center justify-center"
            style={{
              background: isClickable
                ? "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)"
                : "linear-gradient(145deg, #242424 0%, #161616 100%)",
              border: "1px solid rgba(200,162,255,0.1)",
              boxShadow: isClickable ? "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
            }}
          >
            {isClickable && (
              <div
                className="absolute inset-0 rounded-lg sm:rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />
            )}
          </motion.div>
        ) : cell.isMine ? (
          /* Mine cell */
          <motion.div
            key="mine"
            initial={{ rotateY: -90, scale: 0.8 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute inset-0 rounded-lg sm:rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #3d1515 0%, #1f0a0a 100%)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
          >
            <MineSVG isExploded={cell.state === "mine" && phase === "lost"} />
          </motion.div>
        ) : (
          /* Gem cell */
          <motion.div
            key="gem"
            initial={{ rotateY: -90, scale: 0.8 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute inset-0 rounded-lg sm:rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #142e1f 0%, #0c1a12 100%)",
              border: "1px solid rgba(74,222,128,0.22)",
              boxShadow: "0 0 16px rgba(34,197,94,0.12)",
            }}
          >
            <GemSVG />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function GemSVG() {
  return (
    <svg viewBox="0 0 60 60" className="w-3/5 h-3/5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6effa0" />
          <stop offset="40%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="gemShine" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Main gem shape */}
      <polygon points="30,4 52,20 44,56 16,56 8,20" fill="url(#gemGrad)" />
      {/* Top facet */}
      <polygon points="30,4 52,20 30,22 8,20" fill="rgba(255,255,255,0.15)" />
      {/* Left facet */}
      <polygon points="8,20 30,22 16,56" fill="rgba(0,0,0,0.2)" />
      {/* Shine */}
      <polygon points="30,4 42,18 30,16 18,18" fill="url(#gemShine)" />
      {/* Center highlight */}
      <ellipse cx="26" cy="18" rx="5" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-15, 26, 18)" />
    </svg>
  );
}

function MineSVG({ isExploded }: { isExploded: boolean }) {
  return (
    <div className="relative w-3/5 h-3/5 flex items-center justify-center">
      {isExploded && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, #fff700, #ff4400, transparent)" }}
        />
      )}
      <svg viewBox="0 0 60 60" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mineGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#cc2222" />
            <stop offset="60%" stopColor="#880000" />
            <stop offset="100%" stopColor="#3a0000" />
          </radialGradient>
        </defs>
        {/* Spikes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 30 + 18 * Math.cos(rad);
          const y1 = 30 + 18 * Math.sin(rad);
          const x2 = 30 + 28 * Math.cos(rad);
          const y2 = 30 + 28 * Math.sin(rad);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#880000" strokeWidth="3" strokeLinecap="round" />
          );
        })}
        {/* Body */}
        <circle cx="30" cy="30" r="17" fill="url(#mineGrad)" />
        {/* Crack lines */}
        <line x1="22" y1="24" x2="30" y2="36" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
        <line x1="30" y1="22" x2="36" y2="34" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
        {/* Shine */}
        <ellipse cx="24" cy="24" rx="5" ry="3.5" fill="rgba(255,255,255,0.25)" transform="rotate(-30, 24, 24)" />
        {/* Detonator */}
        <rect x="27" y="10" width="6" height="5" rx="2" fill="#555" />
        <rect x="29" y="5" width="2" height="6" rx="1" fill="#444" />
      </svg>
    </div>
  );
}
