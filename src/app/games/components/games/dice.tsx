'use client'

import { Bitcoin } from 'lucide-react'
import DiceRoller from '../dice-roller'
import { useState, useRef } from 'react'
import LiveWinsSection from '../../../../components/live-wins'

export default function DiceGame() {
  const [activeOdds, setActiveOdds] = useState(60.57)
  const [betAmount, setBetAmount] = useState(0.025)
  const oddsOptions = [60.57, 30.57, 70.57, 60.70]
  const diceRef = useRef<any>(null)

  const winnableAmount = betAmount * activeOdds

  const handlePlaceBet = () => {
    if (diceRef.current) {
      diceRef.current.rollDice()
    }
  }

  return (
    <div className="p-4">
      <div className="bg-[#212121] rounded-[20px] text-white flex flex-col lg:flex-row justify-between gap-8 p-4 min-h-[400px]">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Bet Settings */}
          <div className="w-full flex flex-wrap font-medium gap-4 bg-[#1c1c1c]">
            <div className="flex-1 min-w-[200px] p-4  rounded-[20px]">
              <span className="text-sm text-white/60 ">Multiplier</span>
               <p className="mt-1 bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-lg font-semibold">
                2.65000
              </p>
            </div>
            <div className="flex-1 min-w-[200px] p-4  rounded-[20px]">
              <span className="text-sm text-white/60">Roll Over</span>
                 <p className="mt-1 bg-[#212121] border border-white/10 rounded-[12px] px-3 py-2 text-lg font-semibold">
                2.65000
              </p>
            </div>
            <div className="flex-1 min-w-[200px] p-4  rounded-[20px]">
              <span className="text-sm text-white/60">Win Chance</span>
              <p className="mt-1 bg-[#212121] border border-white/10 rounded-[12px] px-3 py-2 text-lg font-semibold">
                2.65000
              </p>
            </div>
          </div>

          {/* Dice Animation centered in left section */}
          <div className="flex-grow flex justify-center items-center mt-5">
            <DiceRoller ref={diceRef} />
          </div>

          {/* Odds Buttons at the Bottom */}
          <div className="flex flex-wrap gap-2 mt-5">
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
        <div className="w-full lg:w-[375px] flex flex-col p-4 gap-8 bg-[#1c1c1c] border border-white/10 rounded-[20px]">
          {/* Bet Details */}
          <p className=" text-sm text-white/60">Bet Amount</p>
          <div className="flex items-center justify-between bg-[#212121] rounded-lg p-4">
            
            <div className="flex items-center gap-2">
              
              
              <span className=' text-sm text-white'>{betAmount} </span>
              
            </div>
            <div className=' flex gap-2'>
              <div className=' bg-white rounded-[1000px] p-1'>
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
              </div>
                
            <span className="text-green-400 font-semibold">2x</span>
            </div>
          </div>

          {/* Amount to Win */}
          <div>
            <p className=" text-sm text-white/60">Proft On Win</p>
            <div className="bg-[#212121] rounded-lg p-4 mt-1">
              <div className=' flex justify-between '>
                <span className="text-sm text-white">{winnableAmount.toFixed(6)} BTC</span>
              <div className=' bg-white rounded-[1000px] p-1'>
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
              </div>
                
            
            </div>
              
            </div>
          </div>

          {/* Bet Button */}
          <button
            onClick={handlePlaceBet}
            className="mt-auto bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[12px] py-3 transition"
          >
             Bet
          </button>
        </div>
      </div>

      {/* Live Wins Section */}
      <div className="mt-12 bg-[#212121] rounded-[20px] p-6">
        <LiveWinsSection />
      </div>
    </div>
  )
}
