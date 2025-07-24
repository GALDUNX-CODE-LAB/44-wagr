'use client'

import { Bitcoin } from 'lucide-react'
import { useState, useEffect } from 'react'
import LiveWinsSection from '../../../../components/live-wins'
import { TfiLocationPin } from "react-icons/tfi";
import { useWheelBet } from '../../../../lib/hooks/useWheel';

export default function StakeRingWheelGame() {
  const [betAmount, setBetAmount] = useState(0.01)
  const [activeOdds, setActiveOdds] = useState(2)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultText, setResultText] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('medium')
  const [selectedSegments, setSelectedSegments] = useState(18)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null)

 type WheelSegment = {
  value: number;
  color: string;
  multiplier: number;
};
 

const COLOR_MAPPING: Record<string, string> = {
  purple: '#C8A2FF',
  green: '#4DFF00B5',
  red: '#FF0000B5',
  yellow: '#FFC107',
  blue: '#1976D2',
  lightgray: '#FFFFFFB5'
};

const COLOR_NAMES = Object.keys(COLOR_MAPPING);

  const { mutate: placeBet, isPending: isBetting } = useWheelBet()

  const winnableAmount = betAmount * activeOdds

  const segmentColors = ['#C8A2FF', '#4DFF00B5', '#FF0000B5', '#FFC107', '#1976D2', '#FFFFFFB5']
  const backgroundColor = '#1C1C1C'
  const segmentAngle = 360 / selectedSegments
  const oddsOptions = [2, 4, 6, 8]
  const [segments, setSegments] = useState<WheelSegment[]>([]);

  useEffect(() => {
  const generatedSegments = Array.from({ length: selectedSegments }, (_, i) => ({
    value: Math.floor(Math.random() * 10) + 2,
    color: COLOR_MAPPING[COLOR_NAMES[i % COLOR_NAMES.length]],
    multiplier: 2 + (i % 4) * 2
  }));
  setSegments(generatedSegments);
}, [selectedSegments]);

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
  if (isSpinning || selectedColorIndex === null) return;

  setIsSpinning(true);
  setShowResult(false);

  placeBet(
  {
    betAmount,
    selectedColorIndex,
    segments: segments.map(s => ({
      color: Object.keys(COLOR_MAPPING).find(k => COLOR_MAPPING[k] === s.color) || 'lightgray',
      multiplier: s.multiplier
    }))
  },
  {
    onSuccess: (data) => {
      const resultColor = data.data.resultColor;

      const resultIndex = segments.findIndex(
        seg => Object.keys(COLOR_MAPPING).find(key => COLOR_MAPPING[key] === seg.color) === resultColor
      );

      if (resultIndex === -1) {
        console.error('Could not find matching segment for color:', resultColor);
        setIsSpinning(false);
        setResultText('Invalid result from server');
        setShowResult(true);
        return;
      }

      const extraSpins = 6;
      const targetRotation =
        wheelRotation + extraSpins * 360 + resultIndex * segmentAngle + segmentAngle / 2;

      setWheelRotation(targetRotation);

      setTimeout(() => {
        setIsSpinning(false);
        const winAmount = betAmount * data.data.multiplier;
        setResultText(
          data.data.payout > 0
            ? `🎉 Wheel landed on ${resultColor}! You won ${winAmount.toFixed(6)} BTC`
            : `❌ Wheel landed on ${resultColor}, better luck next time!`
        );
        setShowResult(true);
      }, 4500);
    },
    onError: (error: any) => {
      console.error('Bet Error:', error);
      setIsSpinning(false);
      setResultText(error.message);
      setShowResult(true);
    }
  }
);

      
      
 
};

  return (
    <div className="px-4 py-6">
      <div className="bg-[#212121] text-white rounded-xl flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-start p-6">
        
        {/* Segment Colors - large screens only */}
        <div className="hidden lg:flex lg:flex-col flex-wrap gap-2 justify-center">
          {segmentColors.map((color, idx) => (
            <div
              key={idx}
              className={`w-[60px] h-[50px] rounded-[10px] border ${
                selectedColorIndex === idx 
                  ? 'border-[#C8A2FF] border-2' 
                  : 'border-white/10'
              } flex flex-col cursor-pointer`}
              onClick={() => {
                setSelectedColorIndex(idx)
                setActiveOdds(oddsOptions[idx % oddsOptions.length])
              }}
            >
              <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                {oddsOptions[idx % oddsOptions.length]}x
              </div>
              <div style={{ backgroundColor: color, height: '20%' }} />
            </div>
          ))}
        </div>

        {/* Wheel + Odds */}
        <div className="flex flex-col justify-center items-center w-full max-w-[360px] relative">
          {/* Wheel */}
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
              <TfiLocationPin className="w-[30px] h-[25px] -mt-2 text-[#c8a2ff]" />
            </div>
          </div>

          {/* Odds - large screens only */}
          <div className="hidden lg:flex gap-3 mt-6 flex-wrap justify-start self-start -ml-[100px]">
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

          {/* Segment colors - visible only on small screens under the wheel */}
          <div className="flex lg:hidden flex-wrap gap-2 justify-center mt-6">
            {segmentColors.map((color, idx) => (
              <div
                key={idx}
                className={`w-[60px] h-[50px] rounded-[10px] border ${
                  selectedColorIndex === idx 
                    ? 'border-[#C8A2FF] border-2' 
                    : 'border-white/10'
                } flex flex-col cursor-pointer`}
                onClick={() => {
                  setSelectedColorIndex(idx)
                  setActiveOdds(oddsOptions[idx % oddsOptions.length])
                }}
              >
                <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                  {oddsOptions[idx % oddsOptions.length]}x
                </div>
                <div style={{ backgroundColor: color, height: '20%' }} />
                </div>
            ))}
          </div>
        </div>

        {/* Bet Panel */}
        <div className="w-full lg:w-[347px] bg-[#1C1C1C] rounded-[16px] border border-white/10 p-4 flex flex-col gap-4">
          {/* Amount */}
          <div>
            <p className="text-sm text-white/60">Bet Amount</p>
            <div className="flex justify-between bg-[#212121] rounded-lg mt-2 px-3 py-3.5">
              <span className="text-sm text-white">{betAmount}</span>
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

          {/* Risk Level */}
          <div>
            <p className="text-sm text-white/60">Risk</p>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="mt-2 bg-[#212121] text-white rounded-[12px] p-4 w-full"
            >
              <option value="low">Low </option>
              <option value="medium">Medium </option>
              <option value="high">High </option>
            </select>
          </div>

          {/* Segment Selector */}
          <div>
            <p className="text-sm text-white/60">Segments</p>
            <select
              value={selectedSegments}
              onChange={(e) => setSelectedSegments(parseInt(e.target.value))}
              className="mt-2 bg-[#212121] text-white rounded-lg p-4 w-full"
            >
              {Array.from({ length: 15 }, (_, i) => i + 6).map((num) => (
                <option key={num} value={num}>
                  {num} 
                </option>
              ))}
            </select>
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || isBetting || selectedColorIndex === null}
            className={`${
              isSpinning || isBetting || selectedColorIndex === null
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[12px] py-3.5 mt-auto transition`}
          >
            {isSpinning || isBetting ? 'Processing...' : 
             selectedColorIndex === null ? 'Select a color first' : 'Bet'}
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

      {/* Live Wins Section */}
      <div className="mt-10 bg-[#212121] rounded-[20px] p-6">
        <LiveWinsSection />
      </div>
    </div>
  )
}