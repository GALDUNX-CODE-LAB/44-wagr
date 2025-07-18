'use client'

import { Bitcoin } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import LiveWinsSection from '../../../../components/live-wins'
import { ChevronUp, ChevronDown } from 'lucide-react' 

export default function CrashGame() {
  const [betAmount, setBetAmount] = useState<number>(0.025)
  const [autoCashout, setAutoCashout] = useState<number>(2.5)
  const [multiplier, setMultiplier] = useState<number>(3)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [crashPoint, setCrashPoint] = useState<number>(0)
  const [hasCrashed, setHasCrashed] = useState<boolean>(false)
  const [profit, setProfit] = useState<number>(0)
  const [isCashingOut, setIsCashingOut] = useState<boolean>(false)

  const oddsOptions = [2.5, 80.57, 50.57, 70.77]

  useEffect(() => {
    setProfit(+(betAmount * multiplier).toFixed(6))
  }, [multiplier, betAmount])

  useEffect(() => {
    if (isRunning && multiplier >= autoCashout && !isCashingOut) {
      handleCashout()
    }
  }, [multiplier, autoCashout, isRunning])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setMultiplier((prev) => {
          const growthRate = 1 + Math.random() * 0.015
          const newMultiplier = +(prev * growthRate).toFixed(2)

          if (newMultiplier >= crashPoint || isCashingOut) {
            clearInterval(interval)
            setIsRunning(false)
            setHasCrashed(!isCashingOut)
            if (isCashingOut) setIsCashingOut(false)
          }
          return newMultiplier
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isRunning, crashPoint, isCashingOut])

  const handlePlaceBet = () => {
    const randomCrash = +(Math.random() * 3.8 + 1.2).toFixed(2)
    setCrashPoint(randomCrash)
    setMultiplier(1)
    setIsRunning(true)
    setHasCrashed(false)
  }

  const handleCashout = () => {
    if (!isRunning) return
    setIsCashingOut(true)
  }

  const getLinePath = useCallback(() => {
    const maxMultiplier = 5
    const graphWidth = 300
    const graphHeight = 386

    const percent = Math.min(multiplier / maxMultiplier, 1)
    const x = percent * graphWidth
    const y = graphHeight - percent * graphHeight

    return `M0 ${graphHeight} Q${x * 0.5} ${graphHeight} ${x} ${y}`
  }, [multiplier])

  return (
    <div className="p-4">
      <div className="bg-[#212121] text-white rounded-xl flex flex-col lg:justify-between lg:flex-row gap-6 p-4 lg:p-6">
        {/* Crash Graph Section */}
        <div className="relative w-full lg:w-[60%] h-[386px] overflow-hidden">
          {/* Odds Options - Top Right */}
          <div className="absolute top-2 right-2 flex gap-2">
            {oddsOptions.map((odds) => (
              <button
                key={odds}
                onClick={() => setAutoCashout(odds)}
                className={`px-3 py-1 text-xs rounded-full border border-white/10 font-medium ${
                  autoCashout === odds ? 'bg-[#C8A2FF] text-black' : 'bg-[#1A1A1A] text-white'
                }`}
              >
                {odds}x
              </button>
            ))}
          </div>

          {/* Y Axis Labels */}
              {/* Y Axis with Connecting Black Line */}
<div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between items-center w-[60px]">
  {/* Vertical connecting line */}
  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[10px] bg-[#1c1c1c] z-0 rounded" />

  {/* Labels */}
  {[5, 4,3.5, 3, 2.5, 2, 1].map((y) => (
    <div key={y} className="relative z-10">
      <div className="w-[50px] h-[30px] rounded-lg bg-[#1C1C1C] border border-white/10 flex items-center justify-center text-xs">
        {y.toFixed(1)}x
      </div>
    </div>
  ))}
</div>


          {/* Line Graph */}
          <svg
            width="300"
            height="386"
            className="absolute left-[70px] bottom-4"
            viewBox="0 0 300 386"
          >
            <defs>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d={getLinePath()}
              stroke="#c8a2ff"
              strokeWidth="15"
              fill="none"
              filter="url(#glow)"
            />
          </svg>

          {/* Multiplier Label */}
          {/* <div className="absolute bottom-2 right-2 text-sm font-mono">
            {multiplier.toFixed(2)}x
          </div> */}

          {/* Crash Overlay */}
          {hasCrashed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-red-500/20 px-4 py-2 rounded-lg animate-pulse">
                <span className="font-bold text-red-400">
                  💥 CRASHED AT {crashPoint.toFixed(2)}x
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bet Controls */}
        <div className="w-full lg:w-[347px] bg-[#1C1C1C] p-4 rounded-xl flex flex-col gap-4">
          {/* Amount Input */}
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

          {/* Auto Cashout */}
           
                <div className="w-full">
  <p className="text-sm text-white/60 mb-2">Cashout At</p>
  <div className="flex items-center bg-[#212121] rounded-lg px-3 py-2 border border-white/10">
    <div className="flex items-center w-full">
      <input
        type="number"
        value={autoCashout}
        onChange={(e) => setAutoCashout(Number(e.target.value))}
        className="bg-transparent text-white text-sm font-medium w-full focus:outline-none"
        step="0.1"
        min="1"
      />
      
    </div>
    <div className="flex flex-row gap-1 ml-2">
      <button
        onClick={() => setAutoCashout(prev => +(prev + 0.1).toFixed(1))}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10"
      >
        <ChevronUp className="w-4 h-4 text-white" strokeWidth={2} />
      </button>
      <button
        onClick={() => setAutoCashout(prev => Math.max(1, +(prev - 0.1).toFixed(1)))}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10"
      >
        <ChevronDown className="w-4 h-4 text-white" strokeWidth={2} />
      </button>
    </div>
  </div>
</div>


          {/* Profit */}
          <div>
            <p className=" text-sm text-white/60">Proft On Win</p>
            <div className="bg-[#212121] rounded-lg p-3 mt-1">
              <div className=' flex justify-between '>
                <span className="text-sm text-white">{profit.toFixed(6)}</span>
              <div className=' bg-white rounded-[1000px] p-1'>
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
              </div>
                
            
            </div>
              
            </div>
          </div>

          {/* Action Buttons */}
              <div className="mt-auto">
  <button
    onClick={handlePlaceBet}
    disabled={isRunning}
    className={`w-full text-center ${
      isRunning ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#C8A2FF] hover:bg-[#D5B3FF]'
    } text-black font-semibold rounded-[12px] py-3 transition`}
  >
    Bet (Next Round)
  </button>
</div>

        </div>
      </div>

      {/* Live Wins Section */}
      <div className="mt-10 bg-[#212121] rounded-[20px] p-6">
        <LiveWinsSection />
      </div>
    </div>
  )
}
