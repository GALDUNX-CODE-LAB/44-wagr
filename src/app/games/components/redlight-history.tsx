"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { fetchRedlightHistory } from "../../../lib/api";

interface GameHistoryItem {
  id: string;
  game: string;
  createdAt: string;
  betAmount: number;
  multiplier: number;
  payout: number;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatAmount(amount: number) {
  return amount.toFixed(3);
}

export default function RedlightHistoryTable() {
  const { data: history } = useQuery({
    queryKey: ["redlight-history"],
    queryFn: () => fetchRedlightHistory(1),
    refetchInterval: 5000,
  });

  const betsData = history?.data || [];
  const latestBets = betsData.slice(0, 10).map((bet: any) => ({
    ...bet,
    id: bet._id || bet.id,
    game: bet.game || "RedLight",
  }));

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[#212121] border border-white/5">
      <table className="min-w-full text-sm text-white">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-white/60">
            <th className="px-6 py-4 text-left font-medium">Game</th>
            <th className="px-6 py-4 text-left font-medium">Time</th>
            <th className="px-6 py-4 text-left font-medium">Bet Amount</th>
            <th className="px-6 py-4 text-left font-medium">Multiplier</th>
            <th className="px-6 py-4 text-left font-medium">Payout</th>
          </tr>
        </thead>
        <tbody>
          {latestBets.map((row: GameHistoryItem, idx: number) => (
            <tr key={row.id} className={`border-t border-white/5 ${idx % 2 === 0 ? "bg-[#1C1C1C]" : "bg-[#212121]"}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-black/5">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                  </span>
                  <span className="font-medium">{row.game}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-white/80">{formatTime(row.createdAt)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span>{formatAmount(row.betAmount)}</span>
                  <div className="relative rounded-lg w-4 h-4 flex items-center justify-center ml-2">
                    <Image src="/assets/usdt.png" alt="USDT" fill className="object-contain" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-white/80">{(row.multiplier ?? 0).toFixed(2)}×</td>
              <td className="px-6 py-4">
                <span className={`${row.payout >= row.betAmount ? "text-[#00ff5f]" : "text-white/80"}`}>
                  {formatAmount(row.payout)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
