"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Trophy, Clock, Users, Bitcoin } from "lucide-react";

export default function NFTLotteryPage() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
  });

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
  ];

  const handleCardClick = (cardId: number) => {
    router.push(`/nft-lottery/${cardId}`);
  };

  const recentWinners = [
    { username: "CryptoKing", price: "$2,500", avatar: "/assets/nft2.png" },
    { username: "NFTCollector", price: "$1,800", avatar: "/assets/nft3.png" },
    { username: "DigitalArt", price: "$3,200", avatar: "/assets/nft4.png" },
    { username: "MetaVerse", price: "$1,500", avatar: "/assets/nft5.png" },
  ];

  return (
    <div className=" text-white p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <div className="w-[full] h-[223px] bg-[#212121] rounded-[20px] overflow-hidden relative border border-white/6 mb-8">
          <Image src={"/assets/banners/banner-lg.jpg"} fill className="object-cover hidden lg:block" alt="banner" />
          <Image src={"/assets/banners/banner-mb.jpg"} fill className="object-cover lg:hidden" alt="banner" />
        </div>

        {/* Header Section */}
        <div className="flex flex-row items-center justify-between mb-8 gap-2">
          <h1 className="lg:text-xl text-base  text-white font-medium text-left whitespace-nowrap">44 Lottery</h1>

          {/* Search Bar */}
          <div className="relative flex-shrink-0 w-[160px] sm:w-[220px] md:w-[300px] lg:w-[375px]">
            <input
              type="text"
              placeholder="Search "
              className="w-full h-[40px] bg-[#212121] border border-white/[0.06] text-sm rounded-[8px] px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Lottery Cards */}
        {/* Mobile: Horizontal Scroll */}
        <div className="w-full max-w-xl overflow-hidden mb-12 md:hidden">
          <div className="flex overflow-x-auto gap-4 no-scrollbar px-6 -mx-6">
            {lotteryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="w-[280px] min-w-[280px] min-h-[320px] max-h-[400px] bg-gradient-to-b from-[#4A3B5C] to-[#212121] border border-white/[0.06] rounded-[20px] p-4 relative overflow-hidden flex flex-col cursor-pointer hover:border-white/20 hover:from-[#5A4B6C] hover:to-[#252525] transition-all duration-200 flex-shrink-0"
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
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-12">
          {lotteryCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="w-full max-w-[300px] max-h-[400px] bg-gradient-to-b from-[#4A3B5C] to-[#212121] border border-white/[0.06] rounded-[20px] p-4 relative mx-auto overflow-hidden flex flex-col cursor-pointer hover:border-white/20 hover:from-[#5A4B6C] hover:to-[#252525] transition-all duration-200"
            >
              {/* Profile Circle */}
              <div className="absolute -top-6 -left-5 w-[100px] h-[100px] bg-[#D9D9D9] border-[3px] border-[#1C1C1C] rounded-full overflow-hidden">
                <Image src={card.image || "/placeholder.svg"} fill className="object-cover" alt="NFT" />
              </div>

              {/* Icon and Star */}
              <div className="flex justify-end items-start mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 fill-current" />
                  <span className="text-xs">2k</span>
                </div>
              </div>

              {/* Exclusive Message */}
              <div className="mt-12 mb-4 flex-grow">
                <p className="text-left text-sm text-white/65">{card.exclusive}</p>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-base text-white font-bold">$500,000</span>
                <span className="text-base font-medium text-white/50">{card.amount}</span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10 mb-4"></div>

              {/* Starts In */}
              <p className="text-left text-xs text-white/60 mb-3">Starts in</p>

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
                className="w-full max-w-[241px] h-[40px] bg-[#C8A2FF] text-black text-sm font-medium rounded-[10px] hover:bg-[#B891FF] transition-colors mx-auto"
              >
                Bet Now
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Winning Lotteries */}
          <div className="w-full max-w-[600px] max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-6 mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold">Top Winning Lotteries</h2>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex justify-between py-4 rounded-lg">
                  {/* Left: Rank as big plain text */}
                  <span className="text-xl lg:text-2xl md:text-[45px] font-bold text-white w-10 md:w-12 text-left">
                    {rank}
                  </span>

                  {/* Middle: Image + Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full mt-1 overflow-hidden flex-shrink-0">
                      <Image
                        src="/assets/nft4.png"
                        width={24}
                        height={24}
                        className="object-cover"
                        alt={`NFT ${rank}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate lg:text-sm text-xs. text-white/70">Premium NFT #{rank}</p>
                      {/* Mobile next draw */}
                      <p className="text-[10px] md:hidden text-white/65 whitespace-nowrap">Next Draw: 00h-00m-00s</p>
                      <p className="font-bold text-base md:text-lg text-white mt-1">$500,000</p>
                    </div>
                  </div>

                  {/* Right: Next Draw + Button */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                    <p className="text-xs hidden md:block text-white whitespace-nowrap">Next Draw: 00h-00m-00s</p>
                    <button className="px-3 py-1.5 text-xs lg:text-sm font-medium bg-[#C8A2FF] text-black rounded-[8px] hover:bg-[#B891FF] transition-colors">
                      Bet Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Winners */}
          <div className="w-full max-w-[600px]  max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] mb-16 lg:mb-0 p-4 lg:p-6 mx-auto flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="lg:text-lg font-bold">Recent Winners</h2>
            </div>

            <div className=" bg-[#c8a2ff]/50 rounded-[5px] h-[20px] lg:h-[40px] w-full mb-5 " />

            <div className="space-y-4 flex-grow overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-2 py-1  ">
                <span className="text-sm font-medium text-white/65">Player</span>
                <span className="text-sm font-medium text-white/65">Price</span>
              </div>

              {/* Winners List */}
              {recentWinners.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#1C1C1C]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="lg:w-8 lg:h-8 w-5 h-5  rounded-full overflow-hidden">
                      <Image
                        src={winner.avatar || "/placeholder.svg"}
                        width={32}
                        height={32}
                        className="object-cover"
                        alt={winner.username}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm lg:text-base">{winner.username}</p>
                    </div>
                  </div>

                  <div className="text-right flex gap-2 ">
                    <p className="font-bold text-white">{winner.price}</p>
                    <div className="bg-yellow-400 rounded-full w-5 h-5 flex mt-0.5 items-center justify-center">
                      <Bitcoin className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
