"use client";
import { useEffect, useState } from "react";
import Graph from "./graph";
import type { Market } from "../../../interfaces/interface";
import { Bookmark } from "lucide-react";

export default function MarketHeader({ market }: { market: Market }) {
  const [bookmarked, setBookmarked] = useState(false);

  // Initialize bookmark state
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarkedMarkets") || "[]");
    setBookmarked(stored.includes(market._id));
  }, [market._id]);

  const handleBookmark = () => {
    const stored = JSON.parse(localStorage.getItem("bookmarkedMarkets") || "[]");
    let updated: string[];

    if (stored.includes(market._id)) {
      updated = stored.filter((id: string) => id !== market._id);
      setBookmarked(false);
    } else {
      updated = [...stored, market._id];
      setBookmarked(true);
    }

    localStorage.setItem("bookmarkedMarkets", JSON.stringify(updated));
  };

  const lastTrend = (market.trend ?? []).at(-1);
  const yesPrice = lastTrend?.yes ?? 0.5;
  const noPrice = lastTrend?.no ?? 0.5;

  const marketDate = new Date(market.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const graphData = (market.trend ?? []).map((point) => ({
    label: new Date(point.time).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    yes: point.yes,
    no: point.no,
  }));

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
      <h1 className="text-sm lg:text-base font-medium flex items-start gap-2 w-full min-w-0 max-w-full">
        {market.image && (
          <img 
            src={market.image} 
            alt={market.question}
            className="w-6 h-6 lg:w-9 lg:h-9 object-cover rounded-[8px] flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        {!market.image && (
          <div className="w-6 h-6 lg:w-9 lg:h-9 bg-white rounded-[8px] flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0 max-w-full overflow-hidden">
          <div className="flex w-full min-w-0 max-w-full items-start gap-2 justify-between">
            <span className="min-w-0 max-w-full flex-1 overflow-hidden line-clamp-4 break-words">
              {market.question}
            </span>
            <button
              type="button"
              onClick={handleBookmark}
              className="p-1 rounded-md hover:bg-white/10 transition shrink-0"
            >
              <Bookmark size={16} className={bookmarked ? "text-[#C8A2FF] fill-[#C8A2FF]" : "text-white/40"} />
            </button>
          </div>
          {market.summary && (
            <small className="text-[10px] text-white/70 block mt-1 min-w-0 max-w-full overflow-hidden line-clamp-6 break-words">
              {market.summary}
            </small>
          )}
        </div>
      </h1>

      <div className="flex flex-wrap gap-4 text-white/20 text-[10px] lg:text-xs">
        <p>{market.b?.toLocaleString()} vol</p>
        <p>{marketDate}</p>
        {market.isResolved && <p className="text-green-500">Resolved: {market.result}</p>}
      </div>

      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[10px] text-white/65">
          <span className="w-2 h-2 bg-[#C8A2FF] rounded-full" /> YES ${yesPrice.toFixed(2)}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-white/65">
          <span className="w-2 h-2 bg-red-500 rounded-full" /> NO ${noPrice.toFixed(2)}
        </span>
      </div>

      <Graph data={graphData} />
    </div>
  );
}
