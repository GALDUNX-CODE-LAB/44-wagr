"use client";

import { motion } from "framer-motion";
import { RPSChoice } from "../../../interfaces/interface";

interface RPSHandProps {
  choice: RPSChoice | null;
  size?: number;
  glow?: boolean;
  glowColor?: string;
  label?: boolean;
  isHouse?: boolean;
}

export default function RPSHand({
  choice,
  size = 56,
  glow = false,
  glowColor = "#22c55e",
  label = false,
  isHouse = false,
}: RPSHandProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={
          glow
            ? {
                filter: [
                  `drop-shadow(0 0 6px ${glowColor})`,
                  `drop-shadow(0 0 14px ${glowColor})`,
                  `drop-shadow(0 0 6px ${glowColor})`,
                ],
              }
            : {}
        }
        transition={{ repeat: Infinity, duration: 1.2 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {choice === "rock" && <RockSVG size={size} isHouse={isHouse} />}
        {choice === "paper" && <PaperSVG size={size} isHouse={isHouse} />}
        {choice === "scissors" && <ScissorsSVG size={size} isHouse={isHouse} />}
        {!choice && <EmptySVG size={size} />}
      </motion.div>
      {label && choice && (
        <span className="text-[11px] tracking-wide uppercase text-white/50">{choice}</span>
      )}
    </div>
  );
}

// ── Rock ──────────────────────────────────────────────────────────────────────
function RockSVG({ size, isHouse }: { size: number; isHouse: boolean }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`rg${isHouse ? "h" : "p"}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#e0e8f0" />
          <stop offset="60%" stopColor="#c0ccd8" />
          <stop offset="100%" stopColor="#7a8a9a" />
        </radialGradient>
      </defs>
      {/* Fist body */}
      <ellipse cx="30" cy="36" rx="20" ry="18" fill={`url(#rg${isHouse ? "h" : "p"})`} />
      {/* Knuckle lines */}
      <path
        d="M 14 30 Q 20 24 30 26 Q 40 24 46 30"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Thumb */}
      <ellipse cx="13" cy="34" rx="5" ry="7" fill={`url(#rg${isHouse ? "h" : "p"})`} transform="rotate(-20,13,34)" />
      {/* Knuckle dots */}
      <circle cx="21" cy="26" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="30" cy="24" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="39" cy="26" r="2" fill="rgba(255,255,255,0.3)" />
      {/* Shine */}
      <ellipse cx="22" cy="29" rx="6" ry="4" fill="rgba(255,255,255,0.2)" transform="rotate(-15,22,29)" />
    </svg>
  );
}

// ── Paper ─────────────────────────────────────────────────────────────────────
function PaperSVG({ size, isHouse }: { size: number; isHouse: boolean }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`pg${isHouse ? "h" : "p"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8f0f8" />
          <stop offset="100%" stopColor="#b0c4d8" />
        </linearGradient>
      </defs>
      {/* Palm */}
      <rect x="15" y="30" width="30" height="22" rx="5" fill={`url(#pg${isHouse ? "h" : "p"})`} />
      {/* Fingers */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={16 + i * 8}
          y={10}
          width={6}
          height={22}
          rx={3}
          fill={`url(#pg${isHouse ? "h" : "p"})`}
          style={{ filter: "brightness(1.05)" }}
        />
      ))}
      {/* Thumb */}
      <rect
        x="8"
        y="26"
        width="10"
        height="6"
        rx="3"
        fill={`url(#pg${isHouse ? "h" : "p"})`}
        transform="rotate(-15,8,26)"
      />
      {/* Knuckle lines */}
      <line x1="16" y1="30" x2="16" y2="34" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="24" y1="30" x2="24" y2="34" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="32" y1="30" x2="32" y2="34" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <line x1="40" y1="30" x2="40" y2="34" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      {/* Shine */}
      <ellipse cx="22" cy="18" rx="5" ry="3" fill="rgba(255,255,255,0.3)" transform="rotate(-10,22,18)" />
    </svg>
  );
}

// ── Scissors ──────────────────────────────────────────────────────────────────
function ScissorsSVG({ size, isHouse }: { size: number; isHouse: boolean }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`sg${isHouse ? "h" : "p"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8f0f8" />
          <stop offset="100%" stopColor="#b0c4d8" />
        </linearGradient>
      </defs>
      {/* Palm */}
      <rect x="15" y="34" width="30" height="20" rx="5" fill={`url(#sg${isHouse ? "h" : "p"})`} />
      {/* Index finger - extended */}
      <rect x="22" y="10" width="7" height="26" rx="3.5" fill={`url(#sg${isHouse ? "h" : "p"})`} />
      {/* Middle finger - extended, spread */}
      <rect
        x="31"
        y="8"
        width="7"
        height="26"
        rx="3.5"
        fill={`url(#sg${isHouse ? "h" : "p"})`}
        transform="rotate(8,34,20)"
      />
      {/* Ring + pinky curled */}
      <rect x="38" y="28" width="6" height="10" rx="3" fill={`url(#sg${isHouse ? "h" : "p"})`} />
      {/* Thumb */}
      <rect
        x="9"
        y="30"
        width="10"
        height="6"
        rx="3"
        fill={`url(#sg${isHouse ? "h" : "p"})`}
        transform="rotate(-15,9,30)"
      />
      {/* Shine */}
      <ellipse cx="26" cy="16" rx="2.5" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-5,26,16)" />
    </svg>
  );
}

function EmptySVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="30"
        cy="30"
        r="22"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text x="30" y="35" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.15)">
        ?
      </text>
    </svg>
  );
}
