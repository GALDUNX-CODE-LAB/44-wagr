"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "./components/page-header";
import ActiveGamesSwiper from "./components/active-games-swiper";
import EndedGamesGrid from "./components/ended-games-grid";
import TopWinningLotteries from "./components/top-lotteries";
import RecentWinners from "./components/recent-winners";
import BannerSlider from "../../components/banner-slider";
import { fetchLotteries } from "../../lib/api";

export default function NFTLotteryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["lotteries"],
    queryFn: async () => {
      const response = await fetchLotteries();
      return response.lotteries || [];
    },
    refetchOnWindowFocus: false,
  });

  const lotteries = data ?? [];
  const { activeCards, endedCards } = useMemo(() => {
    const filtered = lotteries.filter((card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const active = filtered.filter((card) => !card.isCompleted);
    const ended = filtered.filter((card) => card.isCompleted);
    return { activeCards: active, endedCards: ended };
  }, [lotteries, searchQuery]);
  const hasAny = activeCards.length > 0 || endedCards.length > 0;

  const handleCardClick = (cardId: string | number) => {
    router.push(`/nft-lottery/${cardId}`);
  };

  const handleBetNow = (cardId: string | number) => {
    router.push(`/nft-lottery/${cardId}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="text-white px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        <BannerSlider type="game" />
        <div className="mb-4 sm:mb-6">
          <PageHeader title="Lottery Draw" onSearch={handleSearch} searchPlaceholder="Search" />
        </div>

        {isLoading ? (
          <div className="text-center py-10 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A2FF] mx-auto mb-3" />
            <p className="text-white/70 text-xs">Loading lotteries...</p>
          </div>
        ) : !hasAny ? (
          <div className="text-center py-10 sm:py-12">
            <p className="text-white/70 text-xs">
              {searchQuery ? "No lotteries found." : "No lotteries available."}
            </p>
          </div>
        ) : (
          <div className="mb-6 sm:mb-8 space-y-8">
            {activeCards.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 sm:mb-4">
                  Active games
                </h2>
                <div className="pb-6 border-b border-white/10">
                  <ActiveGamesSwiper
                    cards={activeCards}
                    onCardClick={handleCardClick}
                    onBetNow={handleBetNow}
                  />
                </div>
              </section>
            )}
            {endedCards.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 sm:mb-4">
                  Ended games
                </h2>
                <EndedGamesGrid
                  cards={endedCards}
                  onCardClick={handleCardClick}
                  onBetNow={handleBetNow}
                />
              </section>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <TopWinningLotteries />
          <RecentWinners />
        </div>
      </div>
    </div>
  );
}
