"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "./components/page-header";
import LotteryGrid from "./components/lottery-grid";
import TopWinningLotteries from "./components/top-lotteries";
import RecentWinners from "./components/recent-winners";
import BannerSlider from "../../components/banner-slider";
import { fetchLotteries } from "../../lib/api";

export default function NFTLotteryPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadLotteries = async () => {
      try {
        const response = await fetchLotteries();
        console.log("API Response:", response);
        setLotteries(response.lotteries || []);
      } catch (error) {
        console.error("Failed to fetch lotteries:", error);
        setLotteries([]);
      } finally {
        setLoading(false);
      }
    };
    loadLotteries();
  }, []);

  const filteredCards = lotteries.filter((card) => card.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
    <div className="text-white px-4 md:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <BannerSlider type="game" />
        
        <div className="mb-8">
          <PageHeader title="Lottery Draw" onSearch={handleSearch} searchPlaceholder="    Search " />
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8A2FF] mx-auto mb-4"></div>
            <p className="text-white/70">Loading lotteries...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/70 text-lg">
              {searchQuery ? "No lotteries found matching your search." : "No lotteries available at the moment."}
            </p>
          </div>
        ) : (
          <div className="mb-12">
            <LotteryGrid cards={filteredCards} onCardClick={handleCardClick} onBetNow={handleBetNow} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
          <TopWinningLotteries />
          <RecentWinners />
        </div>
      </div>
    </div>
  );
}
