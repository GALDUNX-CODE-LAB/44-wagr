"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb, Check, Hand, Trophy } from "lucide-react";
import {
  GlassGameState,
  GlassDifficulty,
  STEP_MULTIPLIERS,
  GLASS_DIFFICULTY_COLORS,
  TileState,
} from "../../../interfaces/interface";

interface GlassBridgeProps {
  gameState: GlassGameState;
  difficulty: GlassDifficulty;
  onPickTile: (rowIndex: number, tileIndex: number) => void;
  /** Blocks manual clicks while auto-play runs */
  boardLocked?: boolean;
}

const TILE_LABELS: Record<number, string[]> = {
  2: ["LEFT", "RIGHT"],
  3: ["LEFT", "CENTER", "RIGHT"],
  4: ["LEFT", "CENTER-L", "CENTER-R", "RIGHT"],
};

// Height of each row slot (tile + header + gap) in px — keep in sync with the row sizing below
const ROW_SLOT_PX = 120;

/** Matches games board panel in `glass-game.tsx` (#1c1c1c) */
const BOARD_BG_RGBA = "rgba(28, 28, 28";
const PRIMARY_RGB = "200,162,255";

export default function GlassBridge({ gameState, difficulty, onPickTile, boardLocked }: GlassBridgeProps) {
  const { phase, rows, currentRow } = gameState;
  const ladders = STEP_MULTIPLIERS[difficulty];
  const diffColor = GLASS_DIFFICULTY_COLORS[difficulty];
  const [lostOverlayVisible, setLostOverlayVisible] = useState(true);

  useEffect(() => {
    if (phase !== "lost") {
      setLostOverlayVisible(true);
      return;
    }
    setLostOverlayVisible(true);
    const t = window.setTimeout(() => setLostOverlayVisible(false), 1500);
    return () => window.clearTimeout(t);
  }, [phase]);

  // How far to push the stack down so the active row stays near the bottom of the viewport.
  // Each step advances by one ROW_SLOT_PX downward (treadmill effect).
  const translateY = currentRow * ROW_SLOT_PX;

  return (
    <div
      className={`font-sans w-full h-full min-h-0 relative flex flex-col items-stretch overflow-hidden bg-transparent ${boardLocked ? "pointer-events-none" : ""}`}
    >
      {/* Background abyss depth lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${10 + i * 12}%`,
              height: 1,
              background: `rgba(255,255,255,${0.01 + i * 0.005})`,
              transform: `perspective(400px) rotateX(${5 + i * 2}deg)`,
            }}
          />
        ))}
        {/* Abyss glow bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 120, background: "linear-gradient(to top, rgba(200,162,255,0.08), transparent)" }}
        />
      </div>

      {/*
        Treadmill container:
        - Rows are laid out bottom→top (flex-col-reverse) starting from the bottom anchor.
        - translateY pushes the whole stack DOWN each time currentRow advances,
          making it feel like the bridge is scrolling toward the player.
        - The transition gives the smooth conveyor-belt motion.
      */}
      <div className="absolute inset-0 flex items-end justify-center px-4 pb-8 sm:px-8">
        <motion.div
          className="w-full max-w-3xl flex flex-col-reverse"
          style={{ gap: 12 }}
          animate={{ y: translateY }}
          transition={{ type: "spring", stiffness: 260, damping: 32, mass: 1 }}
        >
          {rows.map((row, rowIdx) => {
            const isCurrentRow = rowIdx === currentRow && phase === "playing";
            const isPast = rowIdx < currentRow;
            const isFuture = rowIdx > currentRow;
            const mult = ladders[rowIdx];
            const tileCount = row.tiles.length;
            const labels = TILE_LABELS[tileCount] || row.tiles.map((_, i) => `TILE ${i + 1}`);

            return (
              <motion.div
                key={row.rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isFuture && phase === "playing" ? 0.45 : 1, y: 0 }}
                transition={{ delay: rowIdx * 0.04 }}
                className="flex flex-col items-center scroll-mt-4"
                style={{ gap: 8, minHeight: ROW_SLOT_PX - 12 }}
              >
                {/* Row header: step # and multiplier */}
                <div className="flex items-center gap-3">
                  <div
                    className="text-[10px] tracking-wider uppercase"
                    style={{
                      color: isPast ? diffColor : isCurrentRow ? "#fff" : "rgba(255,255,255,0.25)",
                      fontWeight: isPast || isCurrentRow ? 700 : 400,
                    }}
                  >
                    STEP {rowIdx + 1}
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: isPast
                        ? `${diffColor}22`
                        : isCurrentRow
                          ? `rgba(200,162,255,0.12)`
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isPast ? diffColor + "55" : isCurrentRow ? "rgba(200,162,255,0.25)" : "rgba(255,255,255,0.06)"}`,
                      color: isPast ? diffColor : isCurrentRow ? "#fff" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {mult.toFixed(2)}×
                  </div>
                  {isPast && <Check className="w-3 h-3 text-white/70" strokeWidth={3} aria-hidden />}
                  {isCurrentRow && (
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="text-white/85"
                    >
                      <Hand className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
                    </motion.div>
                  )}
                </div>

                {/* Tiles */}
                <div
                  className={`flex w-full justify-center ${tileCount >= 4 ? "gap-1.5 min-[400px]:gap-2 sm:gap-3" : "gap-3"}`}
                >
                  {row.tiles.map((tile, tileIdx) => {
                    const canClick = isCurrentRow && tile.state === "hidden";
                    return (
                      <GlassTile
                        key={tile.id}
                        state={tile.state}
                        label={labels[tileIdx]}
                        multiplier={mult}
                        isActive={isCurrentRow}
                        canClick={canClick}
                        diffColor={diffColor}
                        compact={tileCount >= 4}
                        onClick={() => canClick && onPickTile(rowIdx, tileIdx)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {/* Start platform */}
          <div className="flex justify-center pt-1">
            <div
              className="px-8 py-2 rounded-xl text-[11px] tracking-[0.2em] text-white/35"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(200,162,255,0.12)",
              }}
            >
              ▶ START
            </div>
          </div>
        </motion.div>
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {phase === "won" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            style={{ background: "rgba(0,30,10,0.55)" }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="rounded-3xl px-10 py-8 text-center pointer-events-auto font-sans"
              style={{
                background: "linear-gradient(135deg, #131212 0%, #1a1520 100%)",
                border: "1px solid rgba(200,162,255,0.35)",
                boxShadow: "0 20px 60px rgba(200,162,255,0.15)",
                minWidth: 240,
              }}
            >
              <div className="flex justify-center">
                <Trophy className="w-11 h-11 text-emerald-400" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="text-emerald-400 font-extrabold text-2xl mt-2 tracking-wide">YOU MADE IT!</div>
              <div className="text-[13px] text-white/50 mt-1">{gameState.currentMultiplier.toFixed(2)}× multiplier</div>
              <div className="text-emerald-400 text-2xl font-bold mt-1.5">
                +${(gameState.betAmount * gameState.currentMultiplier - gameState.betAmount).toFixed(2)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lost toast — compact copy; dismisses after 1.5s */}
      <AnimatePresence>
        {phase === "lost" && lostOverlayVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            style={{ background: `${BOARD_BG_RGBA}, 0.88)` }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="rounded-2xl px-6 py-5 text-center font-sans max-w-[min(280px,92vw)]"
              style={{
                background: "linear-gradient(135deg, #131212 0%, #1a1520 100%)",
                border: `1px solid rgba(${PRIMARY_RGB},0.35)`,
                boxShadow: `0 16px 40px rgba(${PRIMARY_RGB},0.15)`,
                minWidth: 200,
              }}
            >
              <motion.div
                animate={{ rotate: [-4, 4, -4, 4, 0] }}
                transition={{ duration: 0.35 }}
                className="flex justify-center text-primary"
              >
                <Bomb className="w-8 h-8" strokeWidth={1.75} aria-hidden />
              </motion.div>
              <div
                className="text-[15px] sm:text-base mt-1.5 tracking-wide text-primary"
                style={{ fontWeight: 800 }}
              >
                GLASS BROKE!
              </div>
              <div className="text-[11px] text-white/40 mt-1">You fell into the abyss</div>
              <div className="text-primary text-lg font-bold mt-1.5">-${gameState.betAmount.toFixed(2)}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Individual Glass Tile ─────────────────────────────────────────────────────
interface GlassTileProps {
  state: TileState;
  label: string;
  multiplier: number;
  isActive: boolean;
  canClick: boolean;
  diffColor: string;
  /** Narrow layouts (hard / 4 tiles) */
  compact?: boolean;
  onClick: () => void;
}

function GlassTile({ state, label, multiplier, isActive, canClick, diffColor, compact, onClick }: GlassTileProps) {
  const isSafe = state === "safe";
  const isBroken = state === "broken";
  const isSkipped = state === "skipped";
  const isHidden = state === "hidden";

  return (
    <motion.button
      onClick={onClick}
      whileHover={canClick ? { scale: 1.04, y: -3 } : {}}
      whileTap={canClick ? { scale: 0.96 } : {}}
      disabled={!canClick}
      className={`relative flex flex-col items-center justify-center overflow-hidden font-sans rounded-xl sm:rounded-2xl ${compact ? "min-w-0 flex-1 basis-0 max-w-[120px] w-full aspect-[4/3]" : "w-[120px] h-[90px] flex-shrink-0"}`}
      style={{
        cursor: canClick ? "pointer" : "default",
        outline: "none",
        border: "none",
        padding: 0,
        ...(!compact ? { width: 120, height: 90 } : {}),
      }}
    >
      {/* Glass tile body */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: isBroken
            ? `linear-gradient(135deg, rgba(${PRIMARY_RGB},0.14), rgba(80,55,115,0.45))`
            : isSafe
              ? `linear-gradient(135deg, ${diffColor}20, ${diffColor}35)`
              : isSkipped
                ? "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))"
                : isActive
                  ? "linear-gradient(135deg, rgba(200,162,255,0.14), rgba(157,111,216,0.22))"
                  : "linear-gradient(135deg, rgba(60,55,75,0.35), rgba(35,33,38,0.45))",
          border: isBroken
            ? `1.5px solid rgba(${PRIMARY_RGB},0.45)`
            : isSafe
              ? `1.5px solid ${diffColor}66`
              : isActive
                ? "1.5px solid rgba(200,162,255,0.45)"
                : "1.5px solid rgba(200,162,255,0.15)",
          boxShadow: isSafe
            ? `0 0 20px ${diffColor}33, inset 0 1px 0 rgba(255,255,255,0.1)`
            : isActive
              ? "0 0 18px rgba(200,162,255,0.22), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "none",
          transition: "all 0.25s",
        }}
      />

      {/* Glass shine layers */}
      {!isBroken && (
        <>
          <div
            className="absolute inset-x-3 top-2 h-3 rounded-full"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0))" }}
          />
          <div
            className="absolute left-3 top-3 bottom-3 w-1 rounded-full"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02))" }}
          />
        </>
      )}

      {/* Crack SVG when broken */}
      {isBroken && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <CrackSVG />
        </motion.div>
      )}

      {/* Safe checkmark */}
      {isSafe && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check
            className={compact ? "w-5 h-5 sm:w-7 sm:h-7 text-emerald-400" : "w-7 h-7 text-emerald-400"}
            strokeWidth={3}
            aria-hidden
          />
        </motion.div>
      )}

      {/* Tile content (hidden/active state) */}
      {isHidden && (
        <div className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1 px-0.5">
          <div
            className={`font-bold uppercase tracking-wider leading-tight text-center ${compact ? "text-[7px] min-[400px]:text-[8px] sm:text-[10px]" : "text-[10px]"}`}
            style={{
              color: isActive ? "rgba(237,237,237,0.92)" : "rgba(255,255,255,0.38)",
            }}
          >
            {label}
          </div>
          <div
            className={`rounded-full font-bold ${compact ? "px-1 py-px text-[8px] min-[400px]:text-[9px] sm:text-[11px]" : "px-2 py-0.5 text-[11px]"}`}
            style={{
              background: isActive ? "rgba(200,162,255,0.14)" : "rgba(255,255,255,0.05)",
              color: isActive ? "#fff" : "rgba(255,255,255,0.28)",
            }}
          >
            {multiplier.toFixed(2)}×
          </div>
        </div>
      )}

      {/* Pulse ring for active tiles */}
      {isActive && isHidden && (
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: "2px solid rgba(200,162,255,0.45)" }}
        />
      )}
    </motion.button>
  );
}

function CrackSVG() {
  return (
    <svg
      viewBox="0 0 120 90"
      className="w-full h-full max-w-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="crackGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(200,162,255,0.35)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="120" height="90" fill="url(#crackGlow)" rx="14" />
      {/* Main crack lines */}
      <path
        d="M 55 20 L 48 38 L 60 42 L 40 72"
        stroke="rgba(200,162,255,0.85)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 65 15 L 72 35 L 58 40 L 80 68"
        stroke="rgba(200,162,255,0.65)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M 60 42 L 35 55" stroke="rgba(200,162,255,0.55)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M 60 42 L 88 50" stroke="rgba(200,162,255,0.55)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M 48 38 L 28 32" stroke="rgba(200,162,255,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Shatter fragments */}
      <circle cx="60" cy="42" r="3" fill="rgba(200,162,255,0.45)" />
      <circle cx="48" cy="38" r="2" fill="rgba(200,162,255,0.35)" />
    </svg>
  );
}
