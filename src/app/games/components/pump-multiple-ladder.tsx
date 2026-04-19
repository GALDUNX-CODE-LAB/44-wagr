"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PumpDifficulty, DIFFICULTY_COLORS } from "../../../interfaces/interface";

// Re-export colors from types
const DIFF_COLORS: Record<PumpDifficulty, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
  extreme: "#a855f7",
};

interface MultiplierLadderProps {
  ladder: number[];
  currentStep: number;
  phase: string;
  difficulty: PumpDifficulty;
}

export default function MultiplierLadder({ ladder, currentStep, phase, difficulty }: MultiplierLadderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeColor = DIFF_COLORS[difficulty];

  // Auto-scroll to keep active step visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentStep]);

  return (
    <div
      className="relative z-10 shrink-0 flex w-full items-center border-t border-white/[0.06]"
      style={{
        minHeight: 56,
        background: "linear-gradient(to top, #161616 0%, #1c1c1c 55%)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-3 py-2 md:px-4 md:py-2.5 touch-pan-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {ladder.map((mult, i) => {
          const isActive = i === currentStep;
          const isPast = i < currentStep;
          const isFuture = i > currentStep;

          return (
            <motion.div
              key={i}
              data-step={i}
              animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ repeat: isActive && phase === "playing" ? Infinity : 0, duration: 1.2 }}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold text-center"
              style={{
                fontFamily: "inherit",
                minWidth: 60,
                background: isActive ? activeColor : isPast ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                color: isActive ? "#000" : isPast ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)",
                border: isActive ? `2px solid ${activeColor}` : "2px solid transparent",
                boxShadow: isActive ? `0 0 16px ${activeColor}66` : "none",
                transition: "all 0.25s",
                opacity: isFuture ? 0.7 : 1,
              }}
            >
              {mult >= 1000 ? `${(mult / 1000).toFixed(1)}k×` : `${mult.toFixed(2)}×`}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
