'use client'

import { Bitcoin } from 'lucide-react'
import DiceRoller from '../dice-roller'
import { useState, useRef } from 'react'
import LiveWinsSection from '../../../../components/live-wins'

export default function DiceGame() {
  const [activeOdds, setActiveOdds] = useState(2)
  const [betAmount, setBetAmount] = useState(0.025)
  const oddsOptions = [2, 4, 6, 8]
  const diceRef = useRef<any>(null)

  const winnableAmount = betAmount * activeOdds

  const handlePlaceBet = () => {
    if (diceRef.current) {
      diceRef.current.rollDice()
    }
  }

  return (
    <div className="p-4">
      <div className="bg-[#212121] rounded-xl text-white flex flex-col lg:flex-row justify-between gap-6 p-4 min-h-[500px]">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Bet Settings */}
          <div className="w-full flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] p-4 bg-[#1c1c1c] border border-white/10 rounded-[20px]">
              <span className="text-sm text-gray-400">Multiplier</span>
              <p className="mt-1 bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-lg font-semibold">
                {activeOdds}x
              </p>
            </div>
            <div className="flex-1 min-w-[200px] p-4 bg-[#1c1c1c] border border-white/10 rounded-[20px]">
              <span className="text-sm text-gray-400">Bet Amount (BTC)</span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                className="mt-1 bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-lg font-semibold text-white w-full focus:outline-none"
                step="0.001"
                min="0"
              />
            </div>
            <div className="flex-1 min-w-[200px] p-4 bg-[#1c1c1c] border border-white/10 rounded-[20px]">
              <span className="text-sm text-gray-400">Win Chance</span>
              <p className="mt-1 bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-lg font-semibold">
                65%
              </p>
            </div>
          </div>

          {/* Dice Animation */}
          <div className="flex justify-center items-center mt-4">
            <DiceRoller ref={diceRef} />
          </div>

          {/* Odds Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {oddsOptions.map((odds) => (
              <button
                key={odds}
                className={`w-[72px] h-[32px] rounded-full px-4 py-1 text-sm font-medium transition ${
                  activeOdds === odds
                    ? 'bg-[#C8A2FF] text-black'
                    : 'bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]'
                }`}
                onClick={() => setActiveOdds(odds)}
              >
                {odds}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Section (Bet Summary) */}
        <div className="w-full lg:w-[375px] flex flex-col p-4 gap-4 bg-[#1c1c1c] border border-white/10 rounded-[20px]">
          {/* Bet Details */}
          <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-yellow-400" />
              <span>{betAmount} BTC</span>
            </div>
            <span className="text-green-400 font-semibold">{activeOdds}x</span>
          </div>

          {/* Amount to Win */}
          <div>
            <p className="text-sm text-gray-400">Amount to Win</p>
            <div className="bg-[#1A1A1A] rounded-lg p-4 mt-1">
              <span className="text-xl font-semibold">{winnableAmount.toFixed(6)} BTC</span>
            </div>
          </div>

          {/* Bet Button */}
          <button
            onClick={handlePlaceBet}
            className="mt-auto bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full py-3 transition"
          >
            Place Bet
          </button>
        </div>
      </div>

      {/* Live Wins Section */}
      <div className="mt-10">
        <LiveWinsSection />
      </div>
    </div>
  )
}
