// app/market/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import MarketDetails from "../components/market-details";
import { fetchMarketById } from "../../../lib/api";

export default function MarketDetailsPage() {
  const params = useParams();
  const marketId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) return;

    setLoading(true);
    setError(null);

    fetchMarketById(marketId)
      .then((res) => {
        setData(res);
        console.log(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching market:", err);
        setError(err.message || "Failed to load market");
        setLoading(false);
      });
  }, [marketId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return notFound();

  console.log("Page received market data:", data);

  return <MarketDetails market={data?.market} commentCount={data?.commentCount} />;
}
