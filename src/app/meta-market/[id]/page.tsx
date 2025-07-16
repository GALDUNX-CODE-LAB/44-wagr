"use client";

import { notFound, useParams } from "next/navigation";
import { marketData } from "../../../lib/dummy-data";
import { Market } from "../../../interfaces/interface";
import MarketDetails from "../components/market-details";

export default function MarketDetailsPage() {
  const params = useParams();
  const marketId = Number(params?.id);
  const market: Market | undefined = marketData.find((m) => m.id === marketId);

  if (!market) return notFound();

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <MarketDetails market={market} />
    </div>
  );
}
