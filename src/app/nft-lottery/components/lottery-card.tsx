"use client"

import Image from "next/image"
import { Users } from "lucide-react"
import { useEffect, useState } from "react"

interface LotteryCardProps {
  card: {
    imageUrl: string
    lotteryName: string
    totalBetPlaced: string
    startTime: string
    endTime: string
    isEnded: boolean
    lotteryPrice: number
  }
  onClick: (cardId: string | number) => void
  onBetNow?: (cardId: string | number) => void
}

export default function LotteryCard({ card, onClick, onBetNow }: LotteryCardProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(card.endTime).getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000)
    return () => clearInterval(timer)
  }, [card.endTime])

  const handleBetClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBetNow?.(card.lotteryName) // using lotteryName as unique key
  }

  return (
    <div
      onClick={() => onClick(card.lotteryName)}
      className="w-full max-w-[300px] min-h-[320px] max-h-[400px] bg-gradient-to-b from-[#4A3B5C] to-[#212121] border border-white/[0.06] rounded-[20px] p-4 relative mx-auto overflow-hidden flex flex-col cursor-pointer hover:border-white/20 hover:from-[#5A4B6C] hover:to-[#252525] transition-all duration-200"
    >
      {/* Profile Circle */}
      <div className="absolute -top-6 -left-5 w-[100px] h-[100px] bg-[#D9D9D9] border-[3px] border-[#1C1C1C] rounded-full overflow-hidden">
        <Image 
          src={card.imageUrl || "/placeholder.svg"} 
          fill 
          className="object-cover" 
          alt={card.lotteryName} 
        />
      </div>

      {/* Participants */}
      <div className="flex justify-end items-start mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 fill-current" />
          <span className="text-sm">{card.totalBetPlaced}</span>
        </div>
      </div>

      {/* Lottery Name */}
      <div className="mt-12 mb-4 flex-grow">
        <p className="text-left text-base text-white/65">{card.lotteryName}</p>
      </div>

      {/* Price & Bet Ratio */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg text-white">${card.lotteryPrice.toLocaleString()}</span>
        <span className="text-lg font-medium text-white/50">{card.totalBetPlaced}</span>
      </div>

      <div className="w-full h-px bg-white/10 mb-4"></div>

      <p className="text-left text-sm text-white/60 mb-3">
        {card.isEnded ? "Ended" : "Ends in"}
      </p>

      {!card.isEnded ? (
        <div className="flex gap-1 mb-6 justify-between">
          <div className="w-[49px] h-[30px] bg-[#1C1C1C]/50 border border-white/[0.06] rounded-[10px] flex items-center justify-center">
            <span className="text-xs">{timeLeft.days}d</span>
          </div>
          <span className="text-xs self-center">:</span>
          <div className="w-[49px] h-[30px] bg-[#1C1C1C]/50 border border-white/[0.06] rounded-[10px] flex items-center justify-center">
            <span className="text-xs">{timeLeft.hours}h</span>
          </div>
          <span className="text-xs self-center">:</span>
          <div className="w-[49px] h-[30px] bg-[#1C1C1C]/50 border border-white/[0.06] rounded-[10px] flex items-center justify-center">
            <span className="text-xs">{timeLeft.minutes}m</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-red-400 mb-6">This lottery has ended</div>
      )}

      {!card.isEnded && (
        <button
          onClick={handleBetClick}
          className="w-full max-w-[241px] h-[40px] bg-[#C8A2FF] text-black font-medium rounded-[10px] hover:bg-[#B891FF] transition-colors mx-auto"
        >
          Bet Now
        </button>
      )}
    </div>
  )
}
