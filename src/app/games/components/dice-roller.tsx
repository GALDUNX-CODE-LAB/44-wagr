'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Dice6 } from 'lucide-react'

const DiceRollerComponent = (_, ref) => {
  const [result, setResult] = useState<number | null>(null)
  const [win, setWin] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const controls = useAnimation()

  const rollDice = async () => {
    const randomResult = Math.floor(Math.random() * 100) + 1
    setResult(null)
    setShowPopup(false)

    await controls.start({
      x: `${randomResult}%`,
      transition: { duration: 2, ease: 'easeInOut' },
    })

    setResult(randomResult)
    setWin(randomResult > 50)
    setShowPopup(true)
  }

  useImperativeHandle(ref, () => ({
    rollDice,
  }))

  return (
    <div className="flex flex-col items-center gap-8 w-full px-4 relative">
      {/* Progress Bar Container */}
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
            initial={{ x: '0%' }}
          >
            <Dice6 className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Labels and Arrows */}
        <div className="absolute top-[-25px] left-0 w-full flex justify-between px-[16px]">
          {[0, 25, 50, 75, 100].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <span className="text-gray-400 text-xs mb-1">{label}</span>
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#1C1C1C]" />
            </div>
          ))}
        </div>
      </div>

      {/* Result Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1c1c1c] rounded-xl border border-white/10 p-6 text-center w-full max-w-[90%] sm:max-w-sm text-white">
            <p className="text-lg font-semibold mb-4">
              {win ? `🎉 You WON! Rolled: ${result}` : `❌ You LOST! Rolled: ${result}`}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const DiceRoller = forwardRef(DiceRollerComponent)
export default DiceRoller
