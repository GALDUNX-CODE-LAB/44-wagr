"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Check, Circle, CircleDot, OctagonAlert, Snowflake } from "lucide-react";

interface TrafficLightProps {
  phase: "idle" | "green" | "red" | "frozen" | "frozen-red" | "eliminated" | "cashedout";
  /** Narrower SVG + tinier label for mobile corner HUD */
  compact?: boolean;
}

export default function TrafficLight({ phase, compact }: TrafficLightProps) {
  const rid = useId().replace(/:/g, "");
  const isRed = phase === "red" || phase === "frozen-red" || phase === "eliminated";
  const isGreen = phase === "green";
  const w = compact ? 30 : 90;
  const h = compact ? Math.round((w * 200) / 90) : 200;

  return (
    <div
      className={`flex flex-col select-none ${compact ? "items-start" : "items-center"}`}
      style={{ userSelect: "none" }}
    >
      <svg viewBox="0 0 90 200" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
        {/* Pole */}
        <rect x="40" y="155" width="10" height="45" rx="3" fill="#2d3f58" />

        {/* Housing */}
        <rect x="10" y="10" width="70" height="148" rx="14" fill="#1a2535" />
        <rect x="13" y="13" width="64" height="142" rx="11" fill="#0f1923" />

        {/* Bolts */}
        <circle cx="20" cy="20" r="3" fill="#1a2535" />
        <circle cx="70" cy="20" r="3" fill="#1a2535" />
        <circle cx="20" cy="150" r="3" fill="#1a2535" />
        <circle cx="70" cy="150" r="3" fill="#1a2535" />

        {/* Red light */}
        <defs>
          <radialGradient id={`redGlow-${rid}`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ff9090" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          <radialGradient id={`redOff-${rid}`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#3a1010" />
            <stop offset="100%" stopColor="#1a0808" />
          </radialGradient>
          <radialGradient id={`greenGlow-${rid}`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>
          <radialGradient id={`greenOff-${rid}`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#0a2010" />
            <stop offset="100%" stopColor="#051008" />
          </radialGradient>
          <filter id={`glow-${rid}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Red circle */}
        <circle
          cx="45"
          cy="52"
          r="26"
          fill={isRed ? `url(#redGlow-${rid})` : `url(#redOff-${rid})`}
          filter={isRed ? `url(#glow-${rid})` : undefined}
        />
        {/* Red shine */}
        {isRed && <ellipse cx="36" cy="42" rx="9" ry="6" fill="rgba(255,255,255,0.2)" transform="rotate(-20,36,42)" />}

        {/* Divider */}
        <rect x="18" y="90" width="54" height="2" rx="1" fill="#1a2535" />

        {/* Green circle */}
        <circle
          cx="45"
          cy="118"
          r="26"
          fill={isGreen ? `url(#greenGlow-${rid})` : `url(#greenOff-${rid})`}
          filter={isGreen ? `url(#glow-${rid})` : undefined}
        />
        {/* Green shine */}
        {isGreen && (
          <ellipse cx="36" cy="108" rx="9" ry="6" fill="rgba(255,255,255,0.2)" transform="rotate(-20,36,108)" />
        )}
      </svg>

      {/* Light label */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: isRed ? 0.5 : 1.5 }}
        className={`flex items-center font-bold uppercase tracking-widest text-white/90 ${compact ? "mt-0 justify-start gap-0.5 text-[6px] leading-none max-w-[52px]" : "justify-center gap-1.5 mt-1.5 text-[11px]"}`}
        style={{
          color: isRed ? "#ef4444" : isGreen ? "#22c55e" : "rgba(255,255,255,0.3)",
          fontFamily: "'Courier New', monospace",
        }}
      >
        {isRed && (
          <>
            <OctagonAlert className={compact ? "h-2 w-2 shrink-0" : "h-3 w-3 shrink-0"} aria-hidden />
            <span>{compact ? "RED" : "RED LIGHT"}</span>
          </>
        )}
        {isGreen && (
          <>
            <CircleDot
              className={compact ? "h-2 w-2 shrink-0 text-emerald-400" : "h-3 w-3 shrink-0 text-emerald-400"}
              aria-hidden
            />
            <span>{compact ? "GO" : "GREEN LIGHT"}</span>
          </>
        )}
        {!isRed && !isGreen && phase === "frozen" && (
          <>
            <Snowflake className={compact ? "h-2 w-2 shrink-0 text-sky-300" : "h-3 w-3 shrink-0 text-sky-300"} aria-hidden />
            <span>{compact ? "ICE" : "FROZEN"}</span>
            {!compact && <Check className="h-3 w-3 shrink-0 text-emerald-400" strokeWidth={2.5} aria-hidden />}
          </>
        )}
        {!isRed && !isGreen && phase !== "frozen" && (
          <>
            <Circle className="h-2 w-2 shrink-0 fill-current opacity-80" aria-hidden />
            <span>{compact ? "·" : "STANDBY"}</span>
          </>
        )}
      </motion.div>
    </div>
  );
}
