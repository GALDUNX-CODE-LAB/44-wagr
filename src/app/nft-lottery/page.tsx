"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PageHeader from "./components/page-header"
import LotteryGrid from "./components/lottery-grid"
import TopWinningLotteries from "./components/top-lotteries"
import RecentWinners from "./components/recent-winners"
import BannerSlider from "../../components/banner-slider"
import { fetchLotteries } from "../../lib/api"

export default function NFTLotteryPage() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [lotteries, setLotteries] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // ✅ Fetch lotteries from API
  useEffect(() => {
    const loadLotteries = async () => {
      try {
        const response = await fetchLotteries()
        setLotteries(response || [])
      } catch (error) {
        console.error("Failed to fetch lotteries:", error)
      } finally {
        setLoading(false)
      }
    }
    loadLotteries()
  }, [])

  // ✅ Filter by search query
  const filteredCards = lotteries.filter((card) =>
    card.lotteryName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCardClick = (cardId: string | number) => {
    router.push(`/nft-lottery/${cardId}`)
  }

  const handleBetNow = (cardId: string | number) => {
    console.log(`Betting on lottery ${cardId}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTopLotteryBet = (rank: number) => {
    console.log(`Betting on top lottery rank ${rank}`)
  }

  return (
    <div className="text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <BannerSlider />

        {/* Header Section */}
        <PageHeader 
          title="Upcoming Draw" 
          onSearch={handleSearch}
          searchPlaceholder="Search lotteries..."
        />

        {/* Lottery Cards */}
        {loading ? (
          <p className="text-center text-white/70">Loading lotteries...</p>
        ) : (
          <LotteryGrid
            cards={filteredCards}
            onCardClick={handleCardClick}
            onBetNow={handleBetNow}
          />
        )}

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopWinningLotteries onBetNow={handleTopLotteryBet} />
          <RecentWinners />
        </div>
      </div>
    </div>
  )
}
