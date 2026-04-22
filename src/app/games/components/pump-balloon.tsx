"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bomb } from "lucide-react";
import { PumpDifficulty } from "../../../interfaces/interface";

interface PumpBalloonProps {
  phase: "idle" | "playing" | "busted" | "cashedout";
  currentStep: number;
  maxSteps: number;
  currentMultiplier: number;
  difficulty: PumpDifficulty;
}

const DIFFICULTY_COLORS: Record<PumpDifficulty, { body: string; shine: string; neck: string; glow: string }> = {
  easy: { body: "#22c55e", shine: "#86efac", neck: "#15803d", glow: "rgba(34,197,94,0.4)" },
  medium: { body: "#f59e0b", shine: "#fcd34d", neck: "#b45309", glow: "rgba(245,158,11,0.4)" },
  hard: { body: "#ef4444", shine: "#fca5a5", neck: "#b91c1c", glow: "rgba(239,68,68,0.4)" },
  extreme: { body: "#a855f7", shine: "#d8b4fe", neck: "#7e22ce", glow: "rgba(168,85,247,0.4)" },
};

export default function PumpBalloon({ phase, currentStep, maxSteps, currentMultiplier, difficulty }: PumpBalloonProps) {
  const colors = DIFFICULTY_COLORS[difficulty];
  const progress = currentStep / (maxSteps - 1);

  // Balloon grows from 0.55 to 1.0 scale as you pump
  const scale = 0.55 + progress * 0.45;
  // Balloon rises as it grows
  const yOffset = -progress * 60;

  const isBusted = phase === "busted";
  const isCashedout = phase === "cashedout";

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden">
      {/* Pump base — stays at bottom of playfield */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex justify-center px-1">
        <PumpBase colors={colors} phase={phase} />
      </div>

      {/* Balloon / explosion — vertically & horizontally centered in this panel (not viewport) */}
      <div className="absolute inset-0 z-10 flex min-h-0 items-center justify-center px-3 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {!isBusted && (
            <motion.div
              key="balloon"
              className="flex min-h-0 max-h-[min(78%,520px)] w-full max-w-[280px] items-center justify-center"
              initial={{ scale: 0.55, y: 0, opacity: 0 }}
              animate={{
                scale,
                y: yOffset,
                opacity: 1,
                filter: isCashedout
                  ? `drop-shadow(0 0 40px ${colors.glow})`
                  : `drop-shadow(0 0 ${20 + progress * 30}px ${colors.glow})`,
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
            >
              <BalloonSVG colors={colors} multiplier={currentMultiplier} phase={phase} progress={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isBusted && (
            <motion.div
              key="explosion"
              className="flex min-h-0 max-h-[min(78%,520px)] w-full max-w-[280px] items-center justify-center"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: [1, 1.8, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.55, times: [0, 0.4, 1] }}
            >
              <ExplosionSVG color={colors.body} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bust copy — centered overlay */}
      <AnimatePresence>
        {isBusted && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
          >
            <div
              className="text-3xl md:text-[42px]"
              style={{
                fontWeight: 900,
                color: "#ef4444",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                letterSpacing: -1,
              }}
            >
              BUSTED!
            </div>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/50 md:text-base">
              <Bomb className="size-4 shrink-0 text-red-400/85" strokeWidth={2} aria-hidden />
              <span>balloon popped</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BalloonSVG({
  colors,
  multiplier,
  phase,
  progress,
}: {
  colors: (typeof DIFFICULTY_COLORS)[PumpDifficulty];
  multiplier: number;
  phase: string;
  progress: number;
}) {
  // Balloon wobble on pump
  const wobble = phase === "playing" ? "scale(1.02, 0.98)" : "scale(1, 1)";

  return (
    <svg
      viewBox="0 0 220 270"
      className="mx-auto h-auto w-full max-h-full max-w-[min(100%,280px)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="balloonGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor={colors.shine} />
          <stop offset="45%" stopColor={colors.body} />
          <stop offset="100%" stopColor={colors.neck} />
        </radialGradient>
        <radialGradient id="shineGrad" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Balloon body */}
      <ellipse
        cx="110"
        cy="105"
        rx="90"
        ry="98"
        fill="url(#balloonGrad)"
        style={{ transform: wobble, transformOrigin: "110px 105px", transition: "transform 0.15s" }}
      />

      {/* Shine */}
      <ellipse cx="85" cy="68" rx="30" ry="22" fill="url(#shineGrad)" />

      {/* Small shine dot */}
      <ellipse cx="130" cy="52" rx="10" ry="7" fill="rgba(255,255,255,0.35)" />

      {/* Neck triangle */}
      <polygon points="97,198 123,198 110,225" fill={colors.neck} />
      <polygon points="100,198 120,198 110,218" fill={colors.body} opacity="0.5" />

      {/* Knot circle */}
      <circle cx="110" cy="228" r="7" fill={colors.neck} />

      {/* Multiplier text */}
      <text
        x="110"
        y="112"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={multiplier >= 1000 ? 18 : multiplier >= 100 ? 22 : multiplier >= 10 ? 26 : 30}
        fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
      >
        {multiplier >= 1000 ? `${(multiplier / 1000).toFixed(1)}k×` : `${multiplier.toFixed(2)}×`}
      </text>
    </svg>
  );
}

function PumpBase({ colors, phase }: { colors: any; phase: string }) {
  return (
    <svg
      viewBox="0 0 500 120"
      className="h-[72px] w-full max-w-[min(100%,420px)] md:h-[120px]"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground hill */}
      <ellipse cx="180" cy="110" rx="200" ry="55" fill="#1a2535" />

      {/* Pump body */}
      <rect x="280" y="40" width="50" height="70" rx="6" fill="#1e2d42" />
      <rect x="285" y="45" width="40" height="60" rx="4" fill="#243448" />

      {/* Pump handle/nozzle */}
      <rect x="298" y="15" width="14" height="30" rx="4" fill="#2d4060" />
      <rect x="290" y="12" width="30" height="8" rx="4" fill="#3a5070" />

      {/* Pipe up to balloon */}
      <rect x="303" y="0" width="4" height="18" fill="#2d4060" />

      {/* Pump indicator dots */}
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx={130 + i * 22}
          cy={82}
          r={5}
          fill={i === 1 && phase === "playing" ? colors.body : "#2d3f58"}
        />
      ))}
    </svg>
  );
}

function ExplosionSVG({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="mx-auto h-auto w-full max-h-full max-w-[min(100%,280px)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="explGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="30%" stopColor="#ffff00" />
          <stop offset="70%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Burst rays */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x2 = 100 + 85 * Math.cos(angle);
        const y2 = 100 + 85 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={100}
            y1={100}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={3 + (i % 3)}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}
      <circle cx="100" cy="100" r="55" fill="url(#explGrad)" />
      <circle cx="100" cy="100" r="25" fill="#fff" opacity={0.9} />
    </svg>
  );
}
