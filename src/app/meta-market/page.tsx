"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, TrendingUp, TrendingDown } from "lucide-react";
import { marketData } from "../../lib/dummy-data";

const categories = ["All", "Politics", "Religion", "Sports"];

export default function MarketPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 text-white bg-black min-h-screen">
      {/* Title & Subtext */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Poly Market</h1>
      <p className="text-sm text-gray-400 mb-6 max-w-xl">
        Explore trending prediction markets. Bet on real-world events and see what others think.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          placeholder="Search markets..."
          className="w-full pl-10 bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm font-medium relative pb-1 transition-colors ${
              activeCategory === cat
                ? "text-[#C8A2FF]"
                : "text-white/70 hover:text-white"
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C8A2FF] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {marketData.map((market) => (
          <div
            key={market.id}
            onClick={() => router.push(`/meta-market/${market.id}`)}
            className="cursor-pointer w-full bg-[#212121] rounded-[20px] border border-white/10 p-4 flex flex-col gap-3 hover:border-[#C8A2FF] transition"
          >
            {/* Image Placeholder */}
            <div className="w-12 h-12 bg-gray-500 rounded-md" />

            {/* Market Question */}
            <h2 className="text-base sm:text-lg font-semibold">{market.question}</h2>

            {/* Yes / No Buttons */}
            <div className="flex gap-4 mt-1">
              {["Yes", "No"].map((ans) => (
                <div
                  key={ans}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold text-center border ${
                    ans === "Yes"
                      ? "bg-[#C8A2FF] text-black border-[#C8A2FF]"
                      : "bg-[#1A1A1A] text-white border-white/10"
                  }`}
                >
                  {ans}
                </div>
              ))}
            </div>

            {/* Market Stats */}
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-300 mt-2">
              <div className="flex items-center gap-2">
                <p>{market.volume} vol</p>
                <div
                  className={`flex items-center gap-1 ${
                    market.positive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {market.positive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{market.change}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/70">
                <MessageCircle className="w-4 h-4" />
                <span className="mt-0.5">{market.comments.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
