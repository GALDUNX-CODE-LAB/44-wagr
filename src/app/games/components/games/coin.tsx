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
        <div className="flex-1 flex flex-col items-center justify-between gap-6">
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

          {/* Odds Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
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
            <p className="text-sm text-gray-400">Bet Amount (BTC)</p>
            <div className="flex items-center bg-[#1A1A1A] rounded-lg mt-2 px-3 py-2">
              <Bitcoin className="w-5 h-5 text-yellow-400 mr-2" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                className="bg-transparent text-white text-lg font-semibold w-full focus:outline-none"
                step="0.001"
                min="0"
              />
            </div>
          </div>

          {/* Random Side Button */}
          <button
            onClick={handleRandomPick}
            className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full py-2 transition"
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
                {side} {side === 'Heads' ? <Circle className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Winnable Amount */}
          <div>
            <p className="text-sm text-gray-400 mb-1">Amount to Win</p>
            <div className="bg-[#1A1A1A] rounded-lg p-2 text-xl font-semibold">
              {winnableAmount.toFixed(6)} BTC
            </div>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full py-2 transition"
          >
            Place Bet
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
      <div className="mt-10">
        <LiveWinsSection />
      </div>
    </div>
  )
}
