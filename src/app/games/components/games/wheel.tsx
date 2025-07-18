'use client'

import { Bitcoin } from 'lucide-react'
import { useState, useEffect } from 'react'
import LiveWinsSection from '../../../../components/live-wins'

export default function StakeRingWheelGame() {
  const [betAmount, setBetAmount] = useState(0.025)
  const [activeOdds, setActiveOdds] = useState(2)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultText, setResultText] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('medium')
  const [selectedSegments, setSelectedSegments] = useState(18)

  const winnableAmount = betAmount * activeOdds

  const segmentColors = ['#C8A2FF', '#4DFF00B5', '#FF0000B5', '#FFC107', '#1976D2', '#FFFFFFB5']
  const backgroundColor = '#1C1C1C'
  const segmentAngle = 360 / selectedSegments
  const oddsOptions = [2, 4, 6, 8]
  const [segments, setSegments] = useState<number[]>([])

  useEffect(() => {
    const generatedSegments = Array.from({ length: selectedSegments }, () =>
      Math.floor(Math.random() * 10) + 2
    )
    setSegments(generatedSegments)
  }, [selectedSegments])

  const generateGradient = () => {
    const gradientParts = segments.map((_, i) => {
      const color = segmentColors[i % segmentColors.length]
      const startAngle = i * segmentAngle
      const endAngle = startAngle + segmentAngle
      return `${color} ${startAngle}deg ${endAngle}deg`
    })
    return `conic-gradient(${gradientParts.join(', ')})`
  }

  const handleSpin = () => {
    if (isSpinning) return
    const randomIndex = Math.floor(Math.random() * segments.length)
    const resultMultiplier = segments[randomIndex]
    const extraSpins = 6
    const targetRotation =
      wheelRotation + extraSpins * 360 + randomIndex * segmentAngle + segmentAngle / 2

    setIsSpinning(true)
    setWheelRotation(targetRotation)

    setTimeout(() => {
      setIsSpinning(false)
      const winAmount = betAmount * resultMultiplier
      setResultText(`🎉 Wheel landed on ${resultMultiplier}x! You won ${winAmount.toFixed(6)} BTC`)
      setShowResult(true)
    }, 4500)
  }

  return (
    <div className="px-4 py-6">
      {/* Wheel Section */}
      <div className="bg-[#212121] text-white rounded-xl flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-start p-6">
        {/* Segment Colors + Odds */}
        <div className="flex lg:flex-col flex-wrap gap-2 justify-center">
          {segmentColors.map((color, idx) => (
            <div
              key={idx}
              className="w-[60px] h-[50px] rounded-[10px] border border-white/10 flex flex-col"
            >
              <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                {oddsOptions[idx % oddsOptions.length]}x
              </div>
              <div style={{ backgroundColor: color, height: '20%' }} />
            </div>
          ))}
        </div>

        {/* Wheel */}
        <div className="flex flex-col justify-center items-center w-full max-w-[360px] relative">
          <div
            className="relative w-full aspect-square max-w-[340px] rounded-full flex items-center justify-center"
            style={{ backgroundColor }}
          >
            <div
              className="absolute inset-6 rounded-full transition-transform duration-[4.5s] ease-out"
              style={{
                background: generateGradient(),
                transform: `rotate(${wheelRotation}deg)`,
              }}
            />
            <div className="w-[70%] aspect-square rounded-full bg-[#1C1C1C] z-10" />
            <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 z-20">
              <div className="w-4 h-4 border-l-8 border-r-8 border-b-8 border-transparent border-b-yellow-400" />
            </div>
          </div>

          {/* Odds Buttons */}
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            {oddsOptions.map((odds) => (
              <button
                key={odds}
                className={`w-[72px] h-[30px] rounded-full px-[18px] py-[5px] text-sm font-medium transition ${
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

        {/* Bet Panel */}
        <div className="w-full lg:w-[347px] bg-[#1C1C1C] rounded-[16px] border border-white/10 p-4 flex flex-col gap-4">
          {/* Amount */}
          <div>
            <p className="text-sm text-gray-400">Bet Amount (BTC)</p>
            <div className="flex items-center bg-[#1A1A1A] rounded-lg mt-2 px-3">
              <Bitcoin className="w-5 h-5 text-yellow-400 mr-2" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                className="bg-transparent border-none text-white text-lg font-semibold w-full focus:outline-none py-2"
                step="0.001"
                min="0"
              />
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <p className="text-sm text-gray-400">Select Risk</p>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="mt-2 bg-[#1A1A1A] text-white rounded-lg p-2 w-full"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* Segment Selector */}
          <div>
            <p className="text-sm text-gray-400">Select Segments</p>
            <select
              value={selectedSegments}
              onChange={(e) => setSelectedSegments(parseInt(e.target.value))}
              className="mt-2 bg-[#1A1A1A] text-white rounded-lg p-2 w-full"
            >
              {Array.from({ length: 15 }, (_, i) => i + 6).map((num) => (
                <option key={num} value={num}>
                  {num} Segments
                </option>
              ))}
            </select>
          </div>

          {/* Win Amount */}
          <div>
            <p className="text-sm text-gray-400 mt-2 mb-1">Amount to Win</p>
            <div className="bg-[#1A1A1A] rounded-lg px-4 py-3">
              <span className="text-xl font-semibold">
                {winnableAmount.toFixed(6)} BTC
              </span>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`${
              isSpinning ? 'opacity-50 cursor-not-allowed' : ''
            } bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full py-3 mt-auto transition`}
          >
            {isSpinning ? 'Spinning...' : 'Spin Wheel'}
          </button>
        </div>
      </div>

      {/* Result Popup */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] rounded-xl border border-white/10 p-6 text-center max-w-sm w-full text-white">
            <p className="text-lg font-semibold mb-4">{resultText}</p>
            <button
              onClick={() => setShowResult(false)}
              className="mt-2 bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Wins */}
      <div className="mt-8">
        <LiveWinsSection />
      </div>
    </div>
  )
}
