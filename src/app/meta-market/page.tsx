"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, TrendingUp, TrendingDown, Bookmark, ChartPie } from "lucide-react";
import { fetchMarkets } from "../../lib/api";
import BookmarkMarketsModal from "./components/bookmark-market-modal";
import { useQuery } from "@tanstack/react-query";
import PortfolioModal from "./components/portfolio-modal";

const categories = ["All", "Politics", "Religion", "Sports"];
const PAGE_SIZE = 8;

export default function MarketPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [openBookmarks, setOpenBookmarks] = useState(false);
  const [openPortfolio, setOpenPortfolio] = useState(false);

  const {
    data: markets = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetchMarkets();
      return Array.isArray(res) ? res : res?.markets || [];
    },
    refetchOnWindowFocus: false,
  });

  const paginatedMarkets = markets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(markets.length / PAGE_SIZE);

  if (loading) return <MarketSkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen container mx-auto">
      <BookmarkMarketsModal open={openBookmarks} onClose={() => setOpenBookmarks(false)} />
      <PortfolioModal open={openPortfolio} onClose={() => setOpenPortfolio(false)} />

      <div className="flex justify-between">
        <div className="wrap">
          <h1 className="text-lg lg:text-2xl font-medium mb-1">Meta-Market</h1>
          <p className="text-xs lg:text-base font-normal text-white/70 mb-6 max-w-xl">
            Explore trending prediction markets.
          </p>
        </div>

        <div className="wrap text-sm flex gap-5">
          <span
            className="flex gap-1 items-center hover:text-primary transition-all"
            onClick={() => setOpenPortfolio(true)}
          >
            <span className="hidden lg:block">Portfolio </span>
            <ChartPie className="lg:w-3 lg:h-4" />
          </span>
          <span
            className="flex gap-1 items-center hover:text-primary transition-all"
            onClick={() => setOpenBookmarks(true)}
          >
            <span className="hidden lg:block">Bookmarks </span> <Bookmark className="lg:w-3 lg:h-4" />
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 bg-[#212121] border border-white/6 rounded-lg px-4 py-3"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            category={cat}
            active={activeCategory === cat}
            onClick={() => {
              setActiveCategory(cat);
              setPage(1);
            }}
          />
        ))}
      </div>

      <MarketGrid markets={paginatedMarkets} router={router} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-3 mb-20">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-[#C8A2FF] text-black" : "bg-[#333] text-white hover:bg-[#444]"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-components
function MarketSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="cursor-pointer bg-[#212121] rounded-[20px] border border-white/6 p-4 flex flex-col gap-3"
        >
          {/* Image placeholder */}
          <div className="flex gap-3 items-center lg:items-start">
            <div className="lg:w-10 lg:h-10 w-10 h-10 bg-white/10 rounded-[10px] mt-2 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 mt-2">
              <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
            </div>
          </div>
          {/* Summary placeholder */}
          <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
          {/* Buttons placeholder */}
          <div className="flex gap-3 items-center my-3">
            <div className="h-8 bg-white/10 rounded-lg animate-pulse flex-1" />
            <div className="h-8 bg-white/10 rounded-lg animate-pulse flex-1" />
          </div>
          {/* Stats placeholder */}
          <div className="flex justify-between items-center mt-2">
            <div className="h-4 bg-white/10 rounded animate-pulse w-20" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorDisplay({ error }) {
  return (
    <div className="text-center py-12">
      <div className="text-red-500 mb-4">Error: {error}</div>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500 rounded">
        Retry
      </button>
    </div>
  );
}

function CategoryButton({ category, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium relative pb-1 transition-colors ${
        active ? "text-[#C8A2FF]" : "text-white/70 hover:text-white"
      }`}
    >
      {category}
      {active && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C8A2FF] rounded-full" />}
    </button>
  );
}

function MarketGrid({ markets, router }) {
  if (markets.length === 0) {
    return <div className="text-center py-12 text-white/50">No markets found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
      {markets.map((market) => (
        <MarketCard key={market._id} market={market} router={router} />
      ))}
    </div>
  );
}

function MarketCard({ market, router }) {
  return (
    <div
      onClick={() => router.push(`/meta-market/${market._id}`)}
      className="cursor-pointer bg-[#212121] rounded-[20px] border border-white/6 p-4 flex flex-col gap-3 transition hover:border-[#C8A2FF]/30"
    >
      <div className="flex gap-3 items-center lg:items-start">
        {market.image ? (
          <img
            src={market.image}
            alt={market.question}
            className="lg:w-10 lg:h-10 w-10 h-10 rounded-[10px] mt-2 object-cover flex-shrink-0"
          />
        ) : (
          <div className="lg:w-10 lg:h-10 w-10 h-10 bg-white/10 rounded-[10px] mt-2 flex-shrink-0" />
        )}
        <h2 className="text-sm lg:text-base mt-2 font-medium overflow-hidden text-ellipsis line-clamp-2 flex-1">
          {market.question}
        </h2>
      </div>

      {market.summary && (
        <p className="text-xs lg:text-sm text-white/70 line-clamp-1 overflow-hidden">
          {market.summary}
        </p>
      )}

      <div className="flex gap-3 items-center my-3">
        <button className="p-2 rounded-lg text-xs font-medium lg:text-sm bg-primary text-black w-full">Yes</button>
        <button className="p-2 rounded-lg text-xs font-medium lg:text-sm bg-secondary w-full">No</button>
      </div>

      <MarketStats market={market} />
    </div>
  );
}

function MarketStats({ market }) {
  return (
    <div className="flex justify-between text-xs lg:text-sm font-medium mt-2">
      <div className="flex items-center gap-2">
        <span className="text-white/65">Vol: {market.b}</span>
        <TrendIndicator qYes={market.qYes} qNo={market.qNo} />
      </div>
      <div className="flex items-center gap-1 text-white/70">
        <MessageCircle className="lg:w-4 lg:h-4 w-3 h-3" />
        <span>{market.commentCount}</span>
      </div>
    </div>
  );
}

function TrendIndicator({ qYes, qNo }) {
  const isUp = qYes > qNo;
  return (
    <div className={`flex items-center gap-1 ${isUp ? "text-green-500" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="lg:w-4 lg:h-4 w-3 h-3" /> : <TrendingDown className="lg:w-4 lg:h-4 w-3 h-3" />}
      <span>{Math.abs(qYes - qNo).toFixed(2)}</span>
    </div>
  );
}
