"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCrashWins } from "../lib/api";
import { GameType } from "../interfaces/interface";

interface Win {
  game: string;
  user: string;
  time: string;
  bet: string;
  multiplier: string;
  payout: string;
}

interface LiveCrashProp {
  roundId: string | null;
  multiplier: number;
  betEnd: boolean; // true = lock; false = flying
}

export default function LiveCrashWns({ roundId, multiplier, betEnd }: LiveCrashProp) {
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const prevBetEndRef = useRef<boolean>(false);

  const { data: liveWins = [] } = useQuery<Win[]>({
    queryKey: ["live-wins-crash"],
    queryFn: async () => {
      const seed = await fetchCrashWins();
      return (seed || []).map((w: any) => ({
        game: w.game,
        user: String(w.user),
        time: new Date(w.time).toLocaleTimeString(),
        bet: String(w.betAmount || 0),
        multiplier: String(w.multiplier || 1),
        payout: String(w.payout || 0),
      }));
    },
    staleTime: 15_000,
  });

  // Clear ONLY when transitioning into the lock bet window (not during countdown/flying)
  useEffect(() => {
    if (betEnd && !prevBetEndRef.current) {
      prevBetEndRef.current = true;
      queryClient.setQueryData<Win[]>(["live-wins-crash"], () => []);
    }
    if (!betEnd) prevBetEndRef.current = false;
  }, [betEnd, queryClient]);

  // WebSocket: ingest per-bet broadcasts
  useEffect(() => {
    let wsUrl = process.env.NEXT_PUBLIC_WS;
    if (!wsUrl && process.env.NEXT_PUBLIC_API_BASE_URL) {
      wsUrl = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/^http/, "ws");
    }
    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected to", wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.event === "liveWin" && msg?.data?.game === GameType.Crash) {
          const win: Win = {
            game: msg.data.game,
            user: msg.data.user,
            time: new Date(msg.data.time).toLocaleTimeString(),
            bet: String(msg.data.betAmount),
            multiplier: String(msg.data.multiplier),
            payout: String(msg.data.payout),
          };
          queryClient.setQueryData<Win[]>(["live-wins-crash"], (old = []) => {
            return [win, ...old].slice(0, 10);
          });
        }
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, [queryClient]);

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[#212121] border border-white/5">
      <table className="min-w-full table-auto text-sm text-white">
        <thead>
          <tr className="text-[11px] md:text-xs uppercase tracking-wide text-white/60">
            <th className="whitespace-nowrap px-5 py-3 text-left">User</th>
            <th className="whitespace-nowrap px-5 py-3 text-left">Bet Amount</th>
            <th className="whitespace-nowrap px-5 py-3 text-left">Multiplier</th>
            <th className="whitespace-nowrap px-5 py-3 text-right">Payout</th>
          </tr>
        </thead>

        <tbody>
          {liveWins.map((win, index) => (
            <tr
              key={index}
              className={`border-t border-white/5 ${
                index % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#212121]"
              } text-[13px] font-medium`}
            >
              <td className="whitespace-nowrap px-5 py-3 text-white/80">{win.user}</td>
              <td className="whitespace-nowrap px-5 py-3 text-white/90">{win.bet}</td>
              <td className="whitespace-nowrap px-5 py-3">
                <span
                  className={
                    !betEnd && multiplier >= Number(win.multiplier)
                      ? "text-[#00ff5f] font-semibold"
                      : "text-white/80"
                  }
                >
                  {win.multiplier}x
                </span>
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-right">
                <span className={Number(win.payout) > 0 ? "text-[#00ff5f]" : "text-white/80"}>{win.payout}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
