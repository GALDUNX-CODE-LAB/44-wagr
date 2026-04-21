"use client";

import { ArrowRight, CirclePlay, Footprints, Snowflake, Wallet } from "lucide-react";
import { useRLGLGame } from "../../../hooks/useRedlight";
import TrafficLight from "./redlight-trafficlight";
import RunnerTrack from "./redlight-runner-track";
import RLGLControls from "./redlight-controls";
import { motion, AnimatePresence } from "framer-motion";
import { RedlightDifficulty, REDLIGHT_DIFFICULTY_OPTIONS } from "../../../interfaces/interface";

export default function RedLightGame() {
  const {
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    difficulty,
    setDifficulty,
    gameState,
    results,
    startGame,
    freeze,
    handleCashout,
    continueRun,
    resetGame,
  } = useRLGLGame();

  const handleStartRun = () => {
    if (gameState.phase === "eliminated" || gameState.phase === "cashedout") {
      resetGame();
      setTimeout(startGame, 60);
    } else {
      startGame();
    }
  };

  const isRed = gameState.phase === "red";
  const isEliminated = gameState.phase === "eliminated";
  const isPlaying = gameState.phase === "green" || gameState.phase === "red";
  const isFrozen = gameState.phase === "frozen";
  const isIdleLike =
    gameState.phase === "idle" || gameState.phase === "eliminated" || gameState.phase === "cashedout";

  const diffOption = REDLIGHT_DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;
  const stakeHud = gameState.phase === "idle" ? betAmount : gameState.betAmount;
  const payoutHud = stakeHud * gameState.currentMultiplier;

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] mt-4 md:mt-10 mx-auto min-h-0 overflow-hidden rounded-2xl border border-white/10 font-sans h-[calc(100svh-5.5rem)] max-h-[calc(100svh-4rem)] md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))]"
      style={{ background: "#131212" }}
    >
      <div className="flex-1 min-h-0 md:flex-none md:h-full h-auto overflow-y-auto overflow-x-hidden flex flex-col w-full md:w-[220px] lg:w-[240px] border-t border-[rgba(200,162,255,0.12)] md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] pt-2 md:pt-0 md:overflow-hidden">
        <RLGLControls
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          difficulty={difficulty}
          onDifficultyChange={(d) => {
            setDifficulty(d);
            resetGame();
          }}
          phase={gameState.phase}
          currentMultiplier={gameState.currentMultiplier}
          profit={gameState.profit}
          betAmountUsed={gameState.betAmount}
          onStartRun={handleStartRun}
          onFreeze={freeze}
          onCashout={handleCashout}
          onContinue={continueRun}
          results={results}
        />
      </div>

      <div
        className="relative flex min-h-0 max-h-[min(55svh,420px)] flex-shrink-0 flex-col overflow-hidden h-[min(55svh,420px)] md:h-full md:max-h-none md:flex-1"
        style={{ background: "#0d1520" }}
      >
        {/* Red light flash overlay */}
        <AnimatePresence>
          {isRed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0.08, 0.18, 0.08] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, times: [0, 0.2, 0.4, 0.6, 1] }}
              className="absolute inset-0 pointer-events-none z-10"
              style={{ background: "radial-gradient(ellipse at center, rgba(239,68,68,0.35) 0%, transparent 70%)" }}
            />
          )}
          {isEliminated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-10"
              style={{ background: "rgba(239,68,68,0.15)" }}
            />
          )}
        </AnimatePresence>

        {/* Mobile only: compact traffic top-left + counter top-right */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-between px-2 pt-1.5 md:hidden">
          <div className="pointer-events-auto shrink-0">
            <TrafficLight compact phase={gameState.phase} />
          </div>
          <div className="pointer-events-auto max-w-[42%] text-right font-mono leading-tight">
            <div className="text-[7px] uppercase tracking-wide text-white/35">mult</div>
            <div className="text-[11px] font-bold tabular-nums" style={{ color: diffOption.color }}>
              {gameState.currentMultiplier.toFixed(2)}×
            </div>
            <div className="text-[8px] tabular-nums text-white/45">${payoutHud.toFixed(2)}</div>
          </div>
        </div>

        {/* Desktop: unchanged header + traffic */}
        <div className="hidden md:flex items-start justify-between px-10 pt-8 flex-shrink-0">
          <div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
              Red Light · Green Light
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.06)",
                fontSize: 40,
                fontWeight: 900,
                marginTop: -8,
                letterSpacing: -2,
              }}
            >
              SURVIVE
            </div>
          </div>

          <TrafficLight phase={gameState.phase} />
        </div>

        {/* Mobile: vertical belt track */}
        <div className="flex min-h-0 flex-1 flex-col justify-center pt-14 pb-28 md:hidden">
          <RunnerTrack
            vertical
            phase={gameState.phase}
            progress={gameState.progress}
            currentMultiplier={gameState.currentMultiplier}
            difficulty={difficulty as RedlightDifficulty}
            round={gameState.round}
          />
        </div>

        {/* Desktop: horizontal track (unchanged) */}
        <div className="hidden md:flex flex-1 flex-col justify-center">
          <RunnerTrack
            phase={gameState.phase}
            progress={gameState.progress}
            currentMultiplier={gameState.currentMultiplier}
            difficulty={difficulty as RedlightDifficulty}
            round={gameState.round}
          />
        </div>

        {/* Desktop ground strip */}
        <div
          className="hidden md:block flex-shrink-0 w-full"
          style={{
            height: 48,
            background: "linear-gradient(to top, #0a1320 0%, transparent 100%)",
          }}
        />

        {/* Mobile: floating actions (center, over playfield) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center px-2 md:hidden">
          <div className="pointer-events-auto w-full max-w-[min(100%,20rem)]">
            {isIdleLike && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleStartRun}
                className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold tracking-wide text-[#131212] shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                  boxShadow: "0 6px 20px rgba(34,197,94,0.3)",
                }}
              >
                <CirclePlay className="h-3.5 w-3.5 shrink-0" aria-hidden />
                START RUN
              </motion.button>
            )}

            {isPlaying && (
              <div className="flex w-full flex-row gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleCashout}
                  className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[#131212] shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${diffOption.color}, ${diffOption.color}99)`,
                    boxShadow: `0 4px 16px ${diffOption.color}40`,
                  }}
                >
                  <Wallet className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="text-[9px] font-bold leading-none">CASH</span>
                  <span className="text-[8px] font-bold tabular-nums leading-none">
                    ${(gameState.betAmount * gameState.currentMultiplier).toFixed(2)}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={freeze}
                  className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/12 px-1 py-1.5 text-white"
                  style={{
                    background:
                      gameState.phase === "red"
                        ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                        : "rgba(255,255,255,0.09)",
                  }}
                >
                  <Snowflake className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="text-[9px] font-bold leading-none">FREEZE</span>
                </motion.button>
              </div>
            )}

            {isFrozen && (
              <div className="flex w-full flex-row gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleCashout}
                  className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[#131212] shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #15803d)",
                    boxShadow: "0 4px 16px rgba(34,197,94,0.32)",
                  }}
                >
                  <Wallet className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="text-[9px] font-bold leading-none">CASH</span>
                  <span className="text-[8px] font-bold tabular-nums leading-none">
                    ${(gameState.betAmount * gameState.currentMultiplier).toFixed(2)}
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={continueRun}
                  className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/12 bg-white/[0.08] px-1 py-1.5 text-white"
                >
                  <Footprints className="h-3 w-3 shrink-0" aria-hidden />
                  <span className="text-[9px] font-bold leading-none">RUN</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Idle hint — desktop unchanged; mobile sits above FAB */}
        <AnimatePresence>
          {gameState.phase === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-[7.5rem] left-0 right-0 flex items-center justify-center gap-1.5 px-4 text-center text-xs tracking-wide text-white/25 pointer-events-none md:bottom-16 md:text-sm md:text-white/20"
            >
              Place a bet and tap START RUN
              <ArrowRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
