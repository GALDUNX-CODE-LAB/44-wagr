import Graph from "./graph";
import type { Market } from "../../../interfaces/interface";

export default function MarketHeader({ market }: { market: Market }) {
  const totalShares = (market.qYes ?? 0) + (market.qNo ?? 0);
  const yesProbability = totalShares > 0 ? (market.qYes! / totalShares) * 100 : 50;
  const noProbability = 100 - yesProbability;

  const marketDate = new Date(market.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col gap-4">
      <h1 className=" text-lg lg:text-2xl font-medium flex items-center gap-3">
        <div className="lg:min-w-[60px] lg:min-h-[60px] min-w-[30px] min-h-[30px] bg-white rounded-[10px]" />
        {market.question}
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

      <Graph yesProbability={yesProbability} noProbability={noProbability} />
    </div>
  );
}
