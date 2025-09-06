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
  cards: Lottery[] // use proper type
  onCardClick: (cardId: string) => void
  onBetNow?: (cardId: string) => void
}

export default function LotteryGrid({ cards, onCardClick, onBetNow }: LotteryGridProps) {
  return (
    <>
      {/* Mobile: Horizontal Scroll */}
      <div className="w-full max-w-xl overflow-hidden mb-12 md:hidden">
        <div className="flex overflow-x-auto gap-4 no-scrollbar px-6 -mx-6">
          {cards.map((card) => (
            <div key={card._id} className="w-[280px] min-w-[280px]">
              <LotteryCard card={card} onClick={onCardClick} onBetNow={onBetNow} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => (
          <LotteryCard key={card._id} card={card} onClick={onCardClick} onBetNow={onBetNow} />
        ))}
      </div>
    </>
  )
}
