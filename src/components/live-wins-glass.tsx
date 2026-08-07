"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGlassWins } from "../lib/api";
import { GameType } from "../interfaces/interface";
import { getWsUrl } from "../lib/ws-url";

interface Win {
  game: string;
  user: string;
  time: string;
  bet: string;
  multiplier: string;
  payout: string;
}

export default function LiveGlassWins() {
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  const { data: liveWins = [] } = useQuery<Win[]>({
    queryKey: ["live-wins-glass"],
    queryFn: fetchGlassWins,
  });

  useEffect(() => {
    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "liveWin" && msg.data.game === GameType.GlassBridge) {
          const win: Win = {
            game: msg.data.game,
            user: msg.data.user,
            time: new Date(msg.data.time).toLocaleTimeString(),
            bet: String(msg.data.betAmount),
            multiplier: String(msg.data.multiplier),
            payout: String(msg.data.payout),
          };
          queryClient.setQueryData<Win[]>(["live-wins-glass"], (old = []) => {
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
            <th className="whitespace-nowrap px-5 py-3 text-left">Game</th>
            <th className="whitespace-nowrap px-5 py-3 text-left hidden md:table-cell">User</th>
            <th className="whitespace-nowrap px-5 py-3 text-left hidden md:table-cell">Time</th>
            <th className="whitespace-nowrap px-5 py-3 text-left hidden md:table-cell">Bet Amount</th>
            <th className="whitespace-nowrap px-5 py-3 text-left">Multiplier</th>
            <th className="whitespace-nowrap px-5 py-3 text-right">Payout</th>
          </tr>
        </thead>
        <tbody>
          {liveWins.map((win, index) => (
            <tr
              key={index}
              className={`border-t border-white/5 ${index % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#212121]"} text-[13px] font-medium`}
            >
              <td className="whitespace-nowrap px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                  <span>{win.game}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell text-white/80">{win.user}</td>
              <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell text-white/80">{win.time}</td>
              <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">
                <span className="text-white/90">${win.bet}</span>
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-white/80">{win.multiplier}</td>
              <td className="whitespace-nowrap px-5 py-3 text-right">
                <span className={Number(win.payout) >= Number(win.bet) ? "text-[#00ff5f]" : "text-white/80"}>
                  ${win.payout}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
