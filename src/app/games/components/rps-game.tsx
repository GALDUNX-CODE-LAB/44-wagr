"use client";

import { useEffect } from "react";
import { useRPSGame } from "../../../hooks/useRpsGame";
import RPSBoard from "./rps-board";
import RPSControls from "./rps-controls";
import { playGameWin, playGameLose } from "../../../lib/sound-player";

export default function RPSGame() {
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
    play,
    cashout,
    randomPick,
    resetGame,
  } = useRPSGame();

  useEffect(() => {
    if (gameState.phase === "won") playGameWin();
    else if (gameState.phase === "lost") playGameLose();
  }, [gameState.phase]);

  const handleBet = () => {
    if (gameState.phase === "won" || gameState.phase === "lost") {
      resetGame();
      setTimeout(startGame, 60);
    } else {
      startGame();
    }
  };

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] lg:mt-4 md:mt-10 mx-auto min-h-0 rounded-2xl border border-white/10 font-sans md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))] md:overflow-hidden"
      style={{ background: "#131212" }}
    >
      <div className="flex-1 min-h-0 md:flex-none md:h-full h-auto overflow-y-auto overflow-x-hidden flex flex-col w-full md:w-[220px] lg:w-[240px] border-t border-[rgba(200,162,255,0.12)] md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] pt-2 md:pt-0 md:overflow-hidden">
        <RPSControls
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
          currentRound={gameState.currentRound}
          currentMultiplier={gameState.currentMultiplier}
          profit={gameState.profit}
          betAmountUsed={gameState.betAmount}
          onBet={handleBet}
          onCashout={cashout}
          onRandomPick={randomPick}
        />
      </div>

      <div className="flex-shrink-0 min-h-[50vh] w-full md:h-full md:min-h-0 md:flex-1 min-w-0 relative overflow-hidden bg-[#1c1c1c]">
        <RPSBoard gameState={gameState} onPlay={play} />
      </div>
    </div>
  );
}
