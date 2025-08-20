"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, TrendingUp, TrendingDown } from "lucide-react";
import { fetchMarkets } from "../../lib/api";

const categories = ["All", "Politics", "Religion", "Sports"];
const PAGE_SIZE = 8;

export default function MarketPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchMarkets()
      .then((res) => {
        const marketList = Array.isArray(res) ? res : res?.markets || [];
        setMarkets(marketList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching markets:", err);
        setError(err.message || "Failed to load markets");
        setLoading(false);
      });
  }, []);

  const paginatedMarkets = markets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(markets.length / PAGE_SIZE);

  if (loading) return <MarketSkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen lg:max-w-6xl mx-auto">
      <h1 className="text-lg lg:text-2xl font-medium mb-1">Meta-Market</h1>
      <p className="text-xs lg:text-base font-normal text-white/70 mb-6 max-w-xl">
        Explore trending prediction markets.
      </p>

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
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 p-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-[232px] bg-[#212121] rounded-[20px] animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
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
      <div className="flex  gap-3 items-center lg:items-start">
        <div className="lg:min-w-10 lg:min-h-10 min-w-10 min-h-10 bg-white rounded-[10px] mt-2" />
        <h2 className="text-sm lg:text-base mt-2 font-medium overflow-hidden text-ellipsis line-clamp-2">
          {market.question}
        </h2>
      </div>

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
