'use client'

import { Bitcoin } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import LiveWinsSection from '../../../../components/live-wins'

export default function CrashGame() {
  const [betAmount, setBetAmount] = useState<number>(0.025)
  const [autoCashout, setAutoCashout] = useState<number>(2)
  const [multiplier, setMultiplier] = useState<number>(1)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [crashPoint, setCrashPoint] = useState<number>(0)
  const [hasCrashed, setHasCrashed] = useState<boolean>(false)
  const [profit, setProfit] = useState<number>(0)
  const [isCashingOut, setIsCashingOut] = useState<boolean>(false)

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
      <div className="bg-[#212121] text-white rounded-xl flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Crash Graph */}
        <div className="relative w-full lg:w-[60%] h-[386px] overflow-hidden">
          {/* Y Axis */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between">
            {[5, 4, 3, 2, 1].map((y) => (
              <div key={y} className="flex items-center">
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
          <div className="absolute bottom-2 right-2 text-sm font-mono">
            {multiplier.toFixed(2)}x
          </div>

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
            <p className="text-sm text-gray-400">Bet Amount (BTC)</p>
            <div className="flex items-center bg-[#1A1A1A] rounded-lg mt-2 px-3 py-2">
              <Bitcoin className="w-5 h-5 text-yellow-400 mr-2" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bg-transparent border-none text-white text-lg font-semibold w-full focus:outline-none"
                step="0.001"
                min="0"
              />
            </div>
          </div>

          {/* Auto Cashout */}
          <div>
            <p className="text-sm text-gray-400">Auto Cashout (x)</p>
            <input
              type="number"
              value={autoCashout}
              onChange={(e) => setAutoCashout(Number(e.target.value))}
              className="bg-[#1A1A1A] border-none rounded-lg px-3 py-2 text-lg font-semibold text-white focus:outline-none w-full mt-2"
              step="0.1"
              min="1"
            />
          </div>

          {/* Profit */}
          <div>
            <p className="text-sm text-gray-400">Profit on Cashout</p>
            <div className="bg-[#1A1A1A] rounded-lg p-3">
              <span className="text-xl font-mono font-semibold">
                {profit.toFixed(6)} BTC
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto flex-col sm:flex-row">
            <button
              onClick={handleCashout}
              disabled={!isRunning || isCashingOut}
              className={`w-full sm:w-1/2 ${
                !isRunning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white font-semibold rounded-full py-3 transition`}
            >
              {isCashingOut ? 'Cashing Out...' : 'Cash Out'}
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={isRunning}
              className={`w-full sm:w-1/2 ${
                isRunning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#C8A2FF] hover:bg-[#D5B3FF]'
              } text-black font-semibold rounded-full py-3 transition`}
            >
              {isRunning ? 'In Progress...' : hasCrashed ? 'Next Round' : 'Place Bet'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Wins Section */}
      <div className="mt-10">
        <LiveWinsSection />
      </div>
    </div>
  )
}
