"use client"

import LotteryCard from "./lottery-card"

interface LotteryGridProps {
  cards: any[]; // API response objects
  onCardClick: (cardId: string | number) => void;
  onBetNow?: (cardId: string | number) => void;
}

export default function LotteryGrid({ cards, onCardClick, onBetNow }: LotteryGridProps) {
  return (
    <>
      {/* Mobile: Horizontal Scroll */}
      <div className="w-full max-w-xl overflow-hidden mb-12 md:hidden">
        <div className="flex overflow-x-auto gap-4 no-scrollbar px-6 -mx-6">
          {cards.map((card) => (
            <div key={card.lotteryName} className="w-[280px] min-w-[280px]">
              <LotteryCard
                card={card}
                onClick={onCardClick}
                onBetNow={onBetNow}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => (
          <LotteryCard
            key={card.lotteryName}
            card={card}
            onClick={onCardClick}
            onBetNow={onBetNow}
          />
        ))}
      </div>
    </>
  )
}
