"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { motion, useAnimation } from "framer-motion";
import { Dice6 } from "lucide-react";

export type DiceRollerRef = {
  rollDice: () => void;
  rollToValue: (value: number, isWin: boolean) => void;
  resetDice: () => void;
};

const DiceRollerComponent = (_: any, ref: React.Ref<DiceRollerRef>) => {
  const [result, setResult] = useState<number | null>(null);
  const [win, setWin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [resultText, setResultText] = useState("");
  const controls = useAnimation();

  // Fine-tuned positioning to match expected percentages exactly
  const calculatePosition = (value: number) => {
    // Clamp value to 0-99 range
    const clampedValue = Math.max(0, Math.min(99, value));

    // Direct percentage mapping with minimal adjustment
    // Target: 0→0%, 25→25%, 50→50%, 75→75%, 99→100%
    const basePercentage = (clampedValue / 99) * 100;

    // Apply very small padding to keep dice visible at extremes
    const padding = 0.5; // 0.5% padding
    const adjustedPercentage = padding + (basePercentage * (100 - padding * 2)) / 100;

    return adjustedPercentage;
  };

  const rollDice = async () => {
    setResult(null);
    setShowPopup(false);

    // More dramatic rolling animation with varied positions
    await controls.start({
      left: [
        `${calculatePosition(10)}%`,
        `${calculatePosition(85)}%`,
        `${calculatePosition(25)}%`,
        `${calculatePosition(95)}%`,
        `${calculatePosition(5)}%`,
        `${calculatePosition(70)}%`,
        `${calculatePosition(40)}%`,
        `${calculatePosition(90)}%`,
        `${calculatePosition(15)}%`,
        `${calculatePosition(60)}%`,
      ],
      rotate: [0, 180, 360, 540, 720, 900, 1080, 1260, 1440, 1620],
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    });
  };

  const rollToValue = async (roll: number, isWin: boolean) => {
    console.log("🎲 Dice Roll API Response:", { roll, isWin });

    // First do the rolling animation
    await rollDice();

    // Calculate final position based on the exact roll value
    const position = calculatePosition(roll);
    setResult(roll);
    setWin(isWin);

    // Animate to the exact position
    await controls.start({
      left: `${position}%`,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    });

    // Show result after animation completes
    setTimeout(() => {
      setResultText(isWin ? `🎉 You WON! Rolled ${roll.toFixed(2)}` : `❌ You LOST! Rolled ${roll.toFixed(2)}`);
      setShowPopup(true);
    }, 100);
  };

  const resetDice = () => {
    setResult(null);
    setShowPopup(false);
    controls.start({
      left: `50%`,
      rotate: 0,
      transition: { duration: 0.3 },
    });
  };

  useImperativeHandle(ref, () => ({
    rollDice,
    rollToValue,
    resetDice,
  }));

  return (
    <div className="flex flex-col items-center gap-8 w-full lg:px-4 relative">
      <div className="relative w-full max-w-[850px] mx-auto">
        <div className="relative h-[70px] rounded-full border-[12px] border-[#1C1C1C] flex items-center justify-center overflow-hidden bg-transparent">
          <div
            className="w-full h-0 border-t-[10px]"
            style={{
              borderImageSource: "linear-gradient(90deg, #FF0000 50%, #C8A2FF 50%)",
              borderImageSlice: 1,
            }}
          ></div>

          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-[30px] h-[30px] flex items-center justify-center bg-black border border-white rounded-full shadow-[0_0_10px_2px_rgba(200,162,255,0.5)] z-10"
            animate={controls}
            initial={{ left: `50%`, rotate: 0 }}
            style={{ left: `50%` }}
          >
            <Dice6 className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Labels positioned using justify-between */}
        <div className="absolute top-[-25px] left-0 w-full flex justify-between px-4 ml-1">
          {[0, 25, 50, 75, 99].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <span className="text-gray-400 text-xs mb-1 ml-2 ">{label}</span>
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#1C1C1C]" />
            </div>
          ))}
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl text-white text-center max-w-xs w-full">
            <p className="text-lg font-semibold mb-4">{resultText}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DiceRoller = forwardRef(DiceRollerComponent);
DiceRoller.displayName = "DiceRoller";

export default DiceRoller;
