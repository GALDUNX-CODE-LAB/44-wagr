"use client";

import { useEffect } from "react";
import { useMinesGame } from "../../../hooks/useMinesGame";
import MinesGrid from "./mines-grid";
import MinesControls from "./mines-controls";
import MinesResultOverlay from "./mines-result-overlay";
import { playMinesWin, playMinesLose } from "../../../lib/sound-player";

export default function MinesGame() {
  const {
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    mineCount,
    setMineCount,
    gameState,
    results,
    isLoading,
    error,
    startGame,
    revealCell,
    cashout,
    randomPick,
    resetGame,
  } = useMinesGame();

  useEffect(() => {
    if (gameState.phase === "won") playMinesWin();
    else if (gameState.phase === "lost") playMinesLose();
  }, [gameState.phase]);

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] lg:mt-4 md:mt-10 mx-auto min-h-0 rounded-2xl border border-white/10 font-sans md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))] md:overflow-hidden"
      style={{ background: "#131212" }}
    >
      <div className="flex-1 min-h-0 md:flex-none md:h-full h-auto overflow-y-auto overflow-x-hidden flex flex-col w-full md:w-[220px] lg:w-[240px] border-t border-[rgba(200,162,255,0.12)] md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] pt-2 md:pt-0 md:overflow-hidden">
        <MinesControls
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          mineCount={mineCount}
          onMineCountChange={setMineCount}
          phase={gameState.phase}
          gemsFound={gameState.gemsFound}
          currentMultiplier={gameState.currentMultiplier}
          profit={gameState.profit}
          betAmountUsed={gameState.betAmount}
          onBet={startGame}
          onCashout={cashout}
          onRandomPick={randomPick}
          results={results}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div className="flex-shrink-0 min-h-[50vh] w-full md:h-full md:min-h-0 md:flex-1 min-w-0 relative overflow-hidden bg-[#1c1c1c]">
        <MinesGrid cells={gameState.cells} phase={gameState.phase} onCellClick={revealCell} />

        <MinesResultOverlay
          phase={gameState.phase}
          multiplier={gameState.currentMultiplier}
          payout={gameState.betAmount * gameState.currentMultiplier}
          betAmount={gameState.betAmount}
          onPlayAgain={resetGame}
        />
      </div>
    </div>
  );
}
