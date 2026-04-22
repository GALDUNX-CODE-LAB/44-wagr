"use client";

import { useEffect, useRef } from "react";
import { useGlassGame } from "../../../hooks/useGlassGame";
import GlassBridge from "./glass-bridge";
import GlassControls from "./glass-control";
import { TILES_PER_ROW } from "../../../interfaces/interface";

export default function GlassGame() {
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
    pickTile,
    cashout,
    resetGame,
  } = useGlassGame();

  const pickTileRef = useRef(pickTile);
  pickTileRef.current = pickTile;

  useEffect(() => {
    if (gameMode !== "auto" || gameState.phase !== "playing") return;
    const row = gameState.currentRow;
    const n = TILES_PER_ROW[difficulty];
    const delay = 480;
    const id = window.setTimeout(() => {
      const pick = Math.floor(Math.random() * n);
      pickTileRef.current(row, pick);
    }, delay);
    return () => window.clearTimeout(id);
  }, [gameMode, gameState.phase, gameState.currentRow, difficulty]);

  const handleBet = () => {
    if (gameState.phase === "won" || gameState.phase === "lost") {
      resetGame();
      setTimeout(startGame, 60);
    } else {
      startGame();
    }
  };

  const boardLocked = gameMode === "auto" && gameState.phase === "playing";

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] lg:mt-4 md:mt-10 mx-auto rounded-2xl border border-white/10 font-sans md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))] md:overflow-hidden overflow-x-hidden"
      style={{ background: "#131212" }}
    >
      {/* Controls — capped scrollable panel at bottom on mobile */}
      <div className="w-full shrink-0 overflow-y-auto overflow-x-hidden overscroll-contain border-t border-[rgba(200,162,255,0.12)] md:h-full md:w-[220px] md:flex-none md:overflow-hidden md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] lg:w-[240px]">
        <GlassControls
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          difficulty={difficulty}
          onDifficultyChange={(d) => {
            setDifficulty(d);
            resetGame();
          }}
          autoPicking={boardLocked}
          phase={gameState.phase}
          currentRow={gameState.currentRow}
          currentMultiplier={gameState.currentMultiplier}
          profit={gameState.profit}
          betAmountUsed={gameState.betAmount}
          onBet={handleBet}
          onCashout={cashout}
          results={results}
        />
      </div>

      {/* Board — explicit height on mobile so GlassBridge h-full resolves correctly */}
      <div className="relative h-[min(56vh,520px)] w-full min-w-0 overflow-hidden bg-[#1c1c1c] md:h-full md:flex-1 md:min-h-0">
        <GlassBridge gameState={gameState} difficulty={difficulty} onPickTile={pickTile} boardLocked={boardLocked} />
      </div>
    </div>
  );
}
