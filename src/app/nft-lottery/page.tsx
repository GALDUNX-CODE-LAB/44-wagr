"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Star, Trophy, Clock, Users } from "lucide-react"

export default function NFTLotteryPage() {
  const router = useRouter()

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
  })

  const lotteryCards = [
    {
      id: 1,
      amount: "20/30",
      exclusive: "Exclusive NFT Collection",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      amount: "15/25",
      exclusive: "Rare Digital Art",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      amount: "8/20",
      exclusive: "Premium Gaming Assets",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 4,
      amount: "12/18",
      exclusive: "Legendary Avatars",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 5,
      amount: "25/40",
      exclusive: "Cosmic Warriors NFT",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 6,
      amount: "5/10",
      exclusive: "Ultra Rare Collectibles",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 7,
      amount: "18/30",
      exclusive: "Metaverse Land Plots",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 8,
      amount: "22/35",
      exclusive: "Cyberpunk Collection",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  const handleCardClick = (cardId: number) => {
    router.push(`/nft-lottery/${cardId}`)
  }

  const recentWinners = [
    { username: "CryptoKing", price: "$2,500", avatar: "/assets/nft2.png" },
    { username: "NFTCollector", price: "$1,800", avatar: "/assets/nft3.png" },
    { username: "DigitalArt", price: "$3,200", avatar: "/assets/nft4.png" },
    { username: "MetaVerse", price: "$1,500", avatar: "/assets/nft5.png" },
  ]

  return (
    <div className=" text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <div className="w-[full] h-[223px] bg-[#212121] rounded-[20px] overflow-hidden relative border border-white/6 mb-8">
               <Image src={"/assets/banners/banner-lg.jpg"} fill className="object-cover hidden lg:block" alt="banner" />
               <Image src={"/assets/banners/banner-mb.jpg"} fill className="object-cover lg:hidden" alt="banner" />
             </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <h1 className="text-2xl text-white/50 font-medium text-left mb-4 lg:mb-0">Upcoming Draw</h1>

          {/* Search Bar */}
          <div className="relative w-full lg:w-[375px]">
            <input
              type="text"
              placeholder="Search lotteries..."
              className="w-full h-[40px] bg-[#212121] border border-white/[0.06] rounded-[8px] px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Lottery Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {lotteryCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
                 className="w-full max-w-[300px] min-h-[320px] max-h-[400px] bg-gradient-to-b from-[#4A3B5C] to-[#212121] border border-white/[0.06] rounded-[20px] p-4 relative mx-auto overflow-hidden flex flex-col cursor-pointer hover:border-white/20 hover:from-[#5A4B6C] hover:to-[#252525] transition-all duration-200"
            >
              {/* Profile Circle */}
              <div className="absolute -top-6 -left-5 w-[100px] h-[100px] bg-[#D9D9D9] border-[3px] border-[#1C1C1C] rounded-full overflow-hidden">
                <Image src={card.image || "/placeholder.svg"} fill className="object-cover" alt="NFT" />
              </div>

              {/* Icon and Star */}
              <div className="flex justify-end items-start mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 fill-current" />
                  <span className="text-sm">2k</span>
                </div>
              </div>

              {/* Exclusive Message */}
              <div className="mt-12 mb-4 flex-grow">
                <p className="text-left text-base text-white/65">{card.exclusive}</p>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg text-white">$500,000</span>
                <span className="text-lg font-medium text-white/50">{card.amount}</span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10 mb-4"></div>

              {/* Starts In */}
              <p className="text-left text-sm text-white/60 mb-3">Starts in</p>

              {/* Countdown */}
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

              {/* Bet Now Button */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[241px] h-[40px] bg-[#C8A2FF] text-black font-medium rounded-[10px] hover:bg-[#B891FF] transition-colors mx-auto"
              >
                Bet Now
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Winning Lotteries */}
          <div className="w-full max-w-[600px] min-h-[400px] max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-6 mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Top Winning Lotteries</h2>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center justify-between p-3 bg-[#1C1C1C]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#C8A2FF] text-black rounded-full flex items-center justify-center text-sm font-bold">
                      {rank}
                    </span>
                    <div>
                      <p className="font-medium">Premium NFT #{rank}</p>
                      <p className="text-sm text-gray-400">Collection Series</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${(5000 - rank * 500).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Total Won</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Winners */}
          <div className="w-full max-w-[600px] min-h-[400px] max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-6 mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Recent Winners</h2>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto">
              {recentWinners.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#1C1C1C]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={winner.avatar || "/placeholder.svg"}
                        width={40}
                        height={40}
                        className="object-cover"
                        alt={winner.username}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{winner.username}</p>
                      <p className="text-sm text-gray-400">Winner</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{winner.price}</p>
                    <p className="text-xs text-gray-400">Prize Won</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
