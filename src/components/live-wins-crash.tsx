"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCrashWins } from "../lib/api";
import { GameType } from "../interfaces/interface";

interface WinRow {
  game: string;
  user: string;
  time: string;
  bet: number;
  target: number;
  payout: number;
  won: boolean;
}

interface LiveCrashProp {
  roundId: string | null;
  multiplier: number;
  betEnd: boolean; // true = lock; false = flying
}

export default function LiveCrashWns({ roundId, multiplier, betEnd }: LiveCrashProp) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const prevRoundRef = useRef<string | null>(null);

  const { data: liveWins = [] } = useQuery<WinRow[]>({
    queryKey: ["live-wins-crash"],
    queryFn: async () => {
      const seed = await fetchCrashWins();
      return (seed || []).map((w: any) => ({
        game: w.game,
        user: String(w.user),
        time: new Date(w.time).toLocaleTimeString(),
        bet: Number(w.betAmount) || 0,
        target: Number(w.multiplier) || 1,
        payout: Number(w.payout) || 0,
        won: false,
      }));
    },
    staleTime: 15_000,
  });

  // Clear ONLY when the round actually changes (start of next lock window)
  useEffect(() => {
    if (!roundId) return;
    if (prevRoundRef.current !== roundId) {
      prevRoundRef.current = roundId;
      queryClient.setQueryData<WinRow[]>(["live-wins-crash"], () => []);
    }
  }, [roundId, queryClient]);

  // Mark winners live during flight
  useEffect(() => {
    queryClient.setQueryData<WinRow[]>(["live-wins-crash"], (old = []) =>
      old.map((row) => ({ ...row, won: !betEnd && multiplier >= row.target }))
    );
  }, [multiplier, betEnd, queryClient]);

  // WebSocket: ingest per-bet broadcasts
  useEffect(() => {
    const raw = process.env.NEXT_PUBLIC_WS || "";
    if (!raw) return;
    const url = raw.startsWith("http") ? raw.replace(/^http/, "ws") : raw;
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.event === "liveWin" && msg?.data?.game === GameType.Crash) {
          const entry: WinRow = {
            game: msg.data.game,
            user: String(msg.data.user),
            time: new Date(msg.data.time).toLocaleTimeString(),
            bet: Number(msg.data.betAmount) || 0,
            target: Number(msg.data.multiplier) || 1,
            payout: Number(msg.data.payout) || 0,
            won: !betEnd && multiplier >= (Number(msg.data.multiplier) || 1),
          };
          queryClient.setQueryData<WinRow[]>(["live-wins-crash"], (old = []) => [entry, ...old].slice(0, 20));
        }
      } catch {}
    };

    return () => socket.close();
  }, [multiplier, betEnd, queryClient]);

  return (
    <section className="w-full">
      <div className="flex items-start gap-2 mb-4">
        <Award className="text-[#c8a2ff]" />
        <h2 className="text-xl font-bold text-white">Live Wins</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => router.push(`/games/crash`)}
          className="w-[92px] h-[30px] rounded-full flex items-center justify-center text-sm transition bg-[#C8A2FF] text-black"
        >
          Crash
        </button>
      </div>

      <div className="w-full rounded-lg overflow-x-auto h-[40vh] overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#212121]">
            <tr className="text-[#ffffff]/60 text-[12px]">
              <th className="whitespace-nowrap px-5 py-3 text-left hidden md:table-cell">User</th>
              <th className="whitespace-nowrap px-5 py-3 text-left">Target</th>
              <th className="whitespace-nowrap px-5 py-3 text-right">Payout</th>
            </tr>
          </thead>
          <tbody>
            {liveWins.map((row, idx) => (
              <tr
                key={`${row.user}-${row.time}-${idx}`}
                className={`${idx % 2 === 0 ? "bg-[#1C1C1C]" : "bg-[#212121]"} text-white text-[13px] font-medium`}
              >
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell truncate max-w-[140px]">{row.user}</td>
                <td className={`whitespace-nowrap px-5 py-3 ${row.won ? "text-green-400" : ""}`}>
                  {row.target.toFixed(2)}x
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 ${row.won ? "text-green-400" : ""}`}>
                    <span>{row.payout.toFixed(3)}</span>
                    <div className="w-3 h-3 rounded-full bg-[#D9D9D9]" />
                  </div>
                </td>
              </tr>
            ))}
            {liveWins.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-center text-white/50" colSpan={3}>
                  Waiting for bets…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
