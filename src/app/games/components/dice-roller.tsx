'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Dice6 } from 'lucide-react';

export type DiceRollerRef = {
  rollDice: () => void;
  rollToValue: (value: number, isWin: boolean) => void;
  resetDice: () => void;
};

const DiceRollerComponent = (_: any, ref: React.Ref<DiceRollerRef>) => {
  const [result, setResult] = useState<number | null>(null);
  const [win, setWin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [resultText, setResultText] = useState('');
  const controls = useAnimation();

  // Calculate position based on track width and dice size
  const calculatePosition = (value: number) => {
    // The visible track is 850px - 32px padding (16px each side) = 818px
    const trackWidth = 818;
    const diceWidth = 30;
    
    // Calculate available space (track width minus dice width)
    const availableSpace = trackWidth - diceWidth;
    
    // Convert API value (0-99) to position (0-availableSpace)
    const position = (value / 99) * availableSpace;
    
    // Convert to percentage of container width (850px)
    // Add 16px initial padding and half dice width (15px) to center under label
    return ((position + 16 + 15) / 850) * 100;
  };

  const rollDice = async () => {
    setResult(null);
    setShowPopup(false);

    // More dramatic rolling animation
    await controls.start({
      x: [
        calculatePosition(0),
        calculatePosition(80),
        calculatePosition(20),
        calculatePosition(90),
        calculatePosition(10),
        calculatePosition(95),
        calculatePosition(5),
        calculatePosition(99),
        calculatePosition(1),
        calculatePosition(50)
      ].map(p => `${p}%`),
      rotate: [0, 180, 360, 540, 720, 900, 1080, 1260, 1440, 1620],
      transition: {
        duration: 2,
        ease: 'easeInOut'
      },
    });
  };

  const rollToValue = async (roll: number, isWin: boolean) => {
    console.log('🎲 Dice Roll API Response:', { roll, isWin });

    // First do the rolling animation
    await rollDice();
    
    // Calculate final position
    const position = calculatePosition(roll);
    setResult(roll);
    setWin(isWin);

    // Animate to the exact position
    await controls.start({
      x: `${position}%`,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 10
      },
    });

    setResultText(
      isWin ? `🎉 You WON! Rolled ${roll}` : `❌ You LOST! Rolled ${roll}`
    );
    setShowPopup(true);
  };

  const resetDice = () => {
    setResult(null);
    setShowPopup(false);
    controls.start({
      x: `${calculatePosition(50)}%`,
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
    <div className="flex flex-col items-center gap-8 w-full px-4 relative">
      <div className="relative w-full max-w-[850px]">
        <div className="relative h-[70px] rounded-full border-[12px] border-[#1C1C1C] flex items-center justify-center overflow-hidden">
          <div
            className="w-full h-0 border-t-[10px]"
            style={{
              borderImageSource: 'linear-gradient(90deg, #FF0000 50%, #C8A2FF 50%)',
              borderImageSlice: 1,
            }}
          ></div>

          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-[30px] h-[30px] flex items-center justify-center bg-black border border-white rounded-full shadow-[0_0_10px_2px_rgba(200,162,255,0.5)]"
            animate={controls}
            initial={{ x: `${calculatePosition(50)}%`, rotate: 0 }}
          >
            <Dice6 className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        <div
          className="absolute top-[-25px] left-0 w-full flex justify-between px-4"
          style={{
            paddingLeft: '16px',
            paddingRight: '16px',
            transform: 'translateX(15px)',
          }}
        >
          {[0, 25, 50, 75, 100].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <span className="text-gray-400 text-xs mb-1">{label}</span>
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
DiceRoller.displayName = 'DiceRoller';

export default DiceRoller;