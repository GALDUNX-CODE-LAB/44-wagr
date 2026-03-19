"use client";

import { useState, useMemo } from "react";
import LotteryCard from "./lottery-card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface LotteryCardItem {
  _id: string;
  name: string;
  imgUrl: string;
  ticketPrice: number;
  totalBets: number;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

interface EndedGamesGridProps {
  cards: LotteryCardItem[];
  onCardClick: (cardId: string) => void;
  onBetNow?: (cardId: string) => void;
}

const PER_PAGE = 8;

export default function EndedGamesGrid({
  cards,
  onCardClick,
  onBetNow,
}: EndedGamesGridProps) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(cards.length / PER_PAGE)),
    [cards.length]
  );
  const start = (page - 1) * PER_PAGE;
  const pageCards = useMemo(
    () => cards.slice(start, start + PER_PAGE),
    [cards, start]
  );

  if (cards.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {pageCards.map((card) => (
          <LotteryCard
            key={card._id}
            card={card}
            onClick={onCardClick}
            onBetNow={onBetNow}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/70 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
