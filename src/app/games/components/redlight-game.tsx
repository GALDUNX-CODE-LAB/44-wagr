"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useRLGLGame } from "../../../hooks/useRedlight";
import { playGameWin, playGameLose, playGameAction } from "../../../lib/sound-player";
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
    isLoading,
    error,
    gameTimeLeft,
    startGame,
    freeze,
    handleCashout,
    continueRun,
    resetGame,
  } = useRLGLGame();

  useEffect(() => {
    if (gameState.phase === "cashedout") playGameWin();
    else if (gameState.phase === "eliminated") playGameLose();
    else if (gameState.phase === "red" || gameState.phase === "frozen-red") playGameAction(); // red-light warning
  }, [gameState.phase]);

  const handleStartRun = () => {
    if (gameState.phase === "eliminated" || gameState.phase === "cashedout") {
      resetGame();
      setTimeout(startGame, 60);
    } else {
      startGame();
    }
  };

  const isRed = gameState.phase === "red" || gameState.phase === "frozen-red";
  const isEliminated = gameState.phase === "eliminated";
  const isPlaying = gameState.phase === "green" || gameState.phase === "red";
  const isFrozen = gameState.phase === "frozen" || gameState.phase === "frozen-red";
  const diffOption = REDLIGHT_DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)!;
  const stakeHud = gameState.phase === "idle" ? betAmount : gameState.betAmount;
  const payoutHud = stakeHud * gameState.currentMultiplier;

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] lg:mt-4 md:mt-10 mx-auto min-h-0 rounded-2xl border border-white/10 font-sans md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))] md:overflow-hidden"
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
          isLoading={isLoading}
          error={error}
          gameTimeLeft={gameTimeLeft}
        />
      </div>

      <div
        className="relative flex min-h-[50vh] w-full flex-shrink-0 flex-col overflow-hidden md:h-full md:min-h-0 md:flex-1"
        style={{ background: "#1c1c1c" }}
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
        <div className="flex min-h-0 flex-1 flex-col justify-center pt-14 pb-6 md:hidden">
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
            background: "linear-gradient(to top, #131212 0%, transparent 100%)",
          }}
        />

        {/* Idle hint — desktop unchanged */}
        <AnimatePresence>
          {gameState.phase === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 px-4 text-center text-xs tracking-wide text-white/25 pointer-events-none md:bottom-16 md:text-sm md:text-white/20"
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
