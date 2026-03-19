"use client"

import LotteryCard from "./lottery-card"

interface Lottery {
  _id: string
  name: string
  imgUrl: string
  ticketPrice: number
  totalBets: number
  startTime: string
  endTime: string
  isCompleted: boolean
}

interface LotteryGridProps {
  cards: Lottery[]
  onCardClick: (cardId: string) => void
  onBetNow?: (cardId: string) => void
}

export default function LotteryGrid({ cards, onCardClick, onBetNow }: LotteryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <LotteryCard key={card._id} card={card} onClick={onCardClick} onBetNow={onBetNow} />
      ))}
    </div>
  )
}
