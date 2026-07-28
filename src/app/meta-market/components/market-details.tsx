"use client";

import { useState } from "react";
import type { Market } from "../../../interfaces/interface";
import MarketHeader from "./market-header";
import TradePanel from "./trade-panel";
import Comments from "./comments";

interface MarketDetailsProps {
  market: Market;
  commentCount?: number;
}

export default function MarketDetails({ market }: MarketDetailsProps) {
  const [selectedOption, setSelectedOption] = useState<"Yes" | "No" | "">("");
  const [betAmount, setBetAmount] = useState(10);

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen flex flex-col gap-6 lg:max-w-6xl mx-auto text-sm min-w-0 max-w-full overflow-x-hidden">
      <div className="lg:bg-[#212121] rounded-xl sm:p-6 flex flex-col lg:flex-row gap-6 min-w-0">
        <MarketHeader market={market} />
        <TradePanel
          market={market}
          // betAmount={betAmount}
          // setBetAmount={setBetAmount}
          // selectedOption={selectedOption}
          // setSelectedOption={setSelectedOption}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Comments market={market} />
        {/* <LivePlaysWrapper plays={market.plays || []} /> */}
      </div>
    </div>
  );
}
