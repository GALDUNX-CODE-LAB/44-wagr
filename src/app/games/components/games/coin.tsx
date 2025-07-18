'use client'

import { Bitcoin, Star, Circle } from 'lucide-react'
import { useState } from 'react'
import LiveWinsSection from '../../../../components/live-wins'

export default function CoinTossGame() {
  const [betAmount, setBetAmount] = useState(0.025)
  const [selectedSide, setSelectedSide] = useState<'Heads' | 'Tails' | ''>('')
  const [activeOdds, setActiveOdds] = useState(2)
  const [coinSide, setCoinSide] = useState<'Heads' | 'Tails'>('Heads')
  const [isFlipping, setIsFlipping] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultText, setResultText] = useState('')
  const [coinRotation, setCoinRotation] = useState(0)

  const oddsOptions = [2, 4, 6, 8]
  const winnableAmount = betAmount * activeOdds

  const handleRandomPick = () => {
    const sides = ['Heads', 'Tails']
    const randomSide = sides[Math.floor(Math.random() * sides.length)]
    setSelectedSide(randomSide as 'Heads' | 'Tails')
  }

  const handlePlaceBet = () => {
    if (!selectedSide) {
      setResultText('Please select a side before betting!')
      setShowResult(true)
      return
    }

    const result = Math.random() < 0.5 ? 'Heads' : 'Tails'
    const baseRotation = 1080
    const targetRotation = result === 'Heads' ? baseRotation : baseRotation + 180

    setIsFlipping(true)
    setCoinRotation((prev) => prev + targetRotation)
    setCoinSide(result as 'Heads' | 'Tails')

    setTimeout(() => {
      setIsFlipping(false)
      setResultText(result === selectedSide
        ? `🎉 You WON! Coin landed on ${result}`
        : `❌ You LOST! Coin landed on ${result}`
      )
      setShowResult(true)
    }, 2000)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="bg-[#212121] text-white rounded-xl p-4 md:p-6 flex flex-col lg:flex-row justify-between gap-6">
        {/* Coin Animation and Odds */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Coin Animation */}
          <div className="w-full flex justify-center">
            <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
              <div
                className="w-full h-full transition-transform duration-[2s] ease-in-out"
                style={{
                  transform: `rotateY(${coinRotation}deg)`,
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                }}
              >
                {/* Heads */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-red-500 backface-hidden">
                  <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-black" />
                </div>

                {/* Tails */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center rotate-y-180 bg-[#C8A2FF] backface-hidden">
                  <Star className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] text-black fill-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Odds Buttons pinned bottom-left */}
          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            {oddsOptions.map((odds) => (
              <button
                key={odds}
                onClick={() => setActiveOdds(odds)}
                className={`w-[72px] h-[30px] rounded-full text-sm font-medium transition ${
                  activeOdds === odds
                    ? 'bg-[#C8A2FF] text-black'
                    : 'bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]'
                }`}
              >
                {odds}x
              </button>
            ))}
          </div>
        </div>

        {/* Bet Card */}
        <div className="w-full lg:w-[347px] flex-shrink-0 bg-[#1C1C1C] border border-white/10 p-4 rounded-[16px] flex flex-col gap-4">
          {/* Bet Amount */}
          <div>
            <p className=" text-sm text-white/60">Bet Amount</p>
            
            <div className="flex justify-between bg-[#212121] rounded-lg mt-2 px-3 py-2">
                 <div className="flex items-center gap-2">
              
              
              <span className=' text-sm text-white'>{betAmount} </span>
              
            </div>
                  <div className="flex items-center gap-2">
  <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
    <Bitcoin className="w-4 h-4 text-yellow-400" />
  </div>
  <div className="bg-black px-3 py-1 rounded-lg">
    <p className="text-white font-medium leading-none">2x</p>
  </div>
</div>

            </div>
          </div>

          {/* Random Side Button */}
          <button
            onClick={handleRandomPick}
            className=" text-white text-sm font-medium rounded-[10px] bg-[#212121] p-3 transition"
          >
            Pick Random Side
          </button>

          {/* Side Selection */}
                <div className="flex gap-4">
  {['Heads', 'Tails'].map((side) => (
    <button
      key={side}
      onClick={() => setSelectedSide(side as 'Heads' | 'Tails')}
      className={`flex-1 py-2 rounded-full text-sm font-semibold border flex items-center justify-center gap-2 ${
        selectedSide === side
          ? 'bg-[#C8A2FF] text-black'
          : 'bg-[#212121] border-white/10 text-white hover:bg-[#2A2A2A]'
      }`}
    >
      {side}
      {side === 'Heads' ? (
        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-black" />
        </div>
      ) : (
        <div className="w-4 h-4 rounded-full bg-[#C8A2FF] flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-black fill-black" />
        </div>
      )}
    </button>
  ))}
</div>

          {/* Winnable Amount */}
          <div>
            <p className=" text-sm text-white/60">Proft On Win</p>
            <div className="bg-[#212121] rounded-lg p-3 mt-1">
              <div className=' flex justify-between '>
                <span className="text-sm text-white">{winnableAmount.toFixed(6)}</span>
              <div className=' bg-white rounded-[1000px] p-1'>
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
              </div>
                
            
            </div>
              
            </div>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[12px] py-2 transition"
          >
             Bet
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl text-white text-center max-w-xs w-full">
            <p className="text-lg font-semibold mb-4">{resultText}</p>
            <button
              onClick={() => setShowResult(false)}
              className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Wins Section */}
      <div className="mt-10 bg-[#212121] rounded-[20px] p-6">
              <LiveWinsSection />
            </div>
    </div>
  )
}
