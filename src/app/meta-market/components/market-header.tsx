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

  const totalShares = (market.qYes ?? 0) + (market.qNo ?? 0);
  const yesProbability = totalShares > 0 ? (market.qYes! / totalShares) * 100 : 50;
  const noProbability = 100 - yesProbability;

  const marketDate = new Date(market.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const graphData = market.trend.map((point) => ({
    label: new Date(point.time).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    yes: point.yes,
    no: point.no,
  }));

  return (
    <div className="flex-1 flex flex-col gap-4">
      <h1 className="text-lg lg:text-2xl font-medium flex items-center gap-3">
        <div className="lg:min-w-[60px] lg:min-h-[60px] min-w-[30px] min-h-[30px] bg-white rounded-[10px]" />
        <div className="wrap">
          <div className="flex w-full items-center gap-2 justify-between">
            {market.question}
            <button onClick={handleBookmark} className="p-1 rounded-md hover:bg-white/10 transition">
              <Bookmark size={20} className={bookmarked ? "text-[#C8A2FF] fill-[#C8A2FF]" : "text-white/40"} />
            </button>
          </div>
          <small className="text-xs">
            {market.summary ?? "Market will be true if the question is true at the end of the event"}
          </small>
        </div>
      </h1>

      <div className="flex flex-wrap gap-4 text-white/20 text-xs lg:text-sm">
        <p>{market.b?.toLocaleString()} vol</p>
        <p>{marketDate}</p>
        {market.isResolved && <p className="text-green-500">Resolved: {market.result}</p>}
      </div>

      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-2 text-xs text-white/65">
          <span className="w-3 h-3 bg-[#C8A2FF] rounded-full" /> YES {yesProbability.toFixed(1)}%
        </span>
        <span className="flex items-center gap-2 text-xs text-white/65">
          <span className="w-3 h-3 bg-red-500 rounded-full" /> NO {noProbability.toFixed(1)}%
        </span>
      </div>

      <Graph data={graphData} />
    </div>
  );
}
