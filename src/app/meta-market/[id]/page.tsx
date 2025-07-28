// app/market/[id]/page.tsx
'use client';

import { notFound, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import MarketDetails from "../components/market-details";
import { fetchMarketById } from "../../../lib/api/markets-api";

export default function MarketDetailsPage() {
  const params = useParams();
  const marketId = params?.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['market', marketId],
    queryFn: () => fetchMarketById(marketId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return notFound();

  // Debug log to verify the data structure
  console.log('Page received market data:', data);

  return <MarketDetails market={data} />;
}