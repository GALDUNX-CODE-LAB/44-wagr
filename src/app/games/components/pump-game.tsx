"use client";

import { usePumpGame } from "../../../hooks/usePumpGame";
import PumpBalloon from "./pump-balloon";
import PumpControls from "./pump-controls";
import PumpResultOverlay from "./pump-result-overlay";
import MultiplierLadder from "./pump-multiple-ladder";

export default function PumpGame() {
  const {
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    difficulty,
    setDifficulty,
    gameState,
    results,
    ladder,
    startGame,
    pump,
    cashout,
    resetGame,
    isAutoRunning,
    autoPumpCount,
    setAutoPumpCount,
    startAuto,
    stopAuto,
  } = usePumpGame();

  const handleBet = () => {
    if (gameState.phase === "busted" || gameState.phase === "cashedout") {
      resetGame();
      setTimeout(startGame, 50);
    } else {
      startGame();
    }
  };

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] mt-4 md:mt-10 mx-auto min-h-0 overflow-hidden rounded-2xl border border-white/10 font-sans h-[calc(100svh-5.5rem)] max-h-[calc(100svh-4rem)] md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))]"
      style={{ background: "#131212" }}
    >
      <div className="flex-1 min-h-0 md:flex-none md:h-full h-auto overflow-y-auto overflow-x-hidden flex flex-col w-full md:w-[220px] lg:w-[240px] border-t border-[rgba(200,162,255,0.12)] md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] pt-2 md:pt-0 md:overflow-hidden">
        <PumpControls
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
          currentStep={gameState.currentStep}
          profit={gameState.profit}
          betAmountUsed={gameState.betAmount}
          onBet={handleBet}
          onPump={pump}
          onCashout={cashout}
          isAutoRunning={isAutoRunning}
          autoPumpCount={autoPumpCount}
          onAutoPumpCountChange={setAutoPumpCount}
          onStartAuto={startAuto}
          onStopAuto={stopAuto}
          results={results}
        />
      </div>

      <div className="flex-shrink-0 max-h-[40svh] h-[40svh] md:h-full md:max-h-none md:flex-1 min-w-0 relative flex flex-col overflow-hidden bg-[#1c1c1c]">
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: (i * 17) % 3 === 0 ? 2 : 1,
                  height: (i * 17) % 3 === 0 ? 2 : 1,
                  background: "rgba(255,255,255,0.3)",
                  left: `${(i * 137.5) % 100}%`,
                  top: `${(i * 97.3) % 70}%`,
                  opacity: 0.3 + (i % 5) * 0.1,
                }}
              />
            ))}
          </div>

          <PumpBalloon
            phase={gameState.phase}
            currentStep={gameState.currentStep}
            maxSteps={ladder.length}
            currentMultiplier={gameState.currentMultiplier}
            difficulty={difficulty}
          />
          <PumpResultOverlay
            phase={gameState.phase}
            multiplier={gameState.currentMultiplier}
            profit={gameState.profit}
            onPlayAgain={resetGame}
          />
        </div>

        <MultiplierLadder
          ladder={ladder}
          currentStep={gameState.currentStep}
          phase={gameState.phase}
          difficulty={difficulty}
        />
      </div>
    </div>
  );
}
