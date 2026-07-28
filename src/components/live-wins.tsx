"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLiveWins } from "../lib/api";

interface Win {
  game: string;
  user: string;
  time: string;
  bet: string;
  multiplier: string;
  payout: string;
}

export default function LiveWinsSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  // const [liveWins , setLiveWins ] = useState(second)

  const gameCategories = ["Casino", "Sports", "Race", "Dice"];
  const [activeCategory, setActiveCategory] = useState(gameCategories[0]);
  const { data: liveWins = [] } = useQuery<Win[]>({
    queryKey: ["live-wins"],
    queryFn: fetchLiveWins,
  });

  useEffect(() => {
    let wsUrl = (process.env.NEXT_PUBLIC_WS || "").trim();
    if (!wsUrl) return;

    // Upgrade ws:// → wss:// on HTTPS pages (browser blocks mixed content)
    if (window.location.protocol === "https:") {
      wsUrl = wsUrl.replace(/^ws:\/\//, "wss://");
    }

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected to", wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log(msg);
        if (msg.event === "liveWin") {
          const win: Win = {
            game: msg.data.game,
            user: msg.data.user,
            time: new Date(msg.data.time).toLocaleTimeString(),
            bet: String(msg.data.betAmount),
            multiplier: String(msg.data.multiplier),
            payout: String(msg.data.payout),
          };
          queryClient.setQueryData<Win[]>(["live-wins"], (old = []) => {
            return [win, ...old].slice(0, 7);
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
    <section className="mb-10 w-full py-3">
      <div className="flex items-start gap-2 mb-3">
        <Award className="text-[#c8a2ff]" />
        <h2 className="text-xl font-bold text-white">Live Wins</h2>
      </div>

      <div className="flex gap-2 mb-3">
        {/* {gameCategories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              router.push(`/games/${category.toLowerCase()}`);
            }}
            className={`w-[92px] h-[30px] rounded-full flex items-center justify-center text-sm transition ${
              activeCategory === category ? "bg-[#C8A2FF] text-black" : "bg-[#313131] text-white/70 hover:bg-[#2a2a2a]"
            }`}
            style={{ padding: "5px 23px", gap: "10px" }}
          >
            {category}
          </button>
        ))} */}
      </div>

      <div className="w-full rounded-lg overflow-x-auto   overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-[#212121]">
            <tr className="text-[#ffffff]/60 text-[12px]">
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
                className={`${index % 2 === 0 ? "bg-[#1C1C1C]" : "bg-[#212121]"} text-white text-[13px] font-medium`}
              >
                <td className="whitespace-nowrap px-5 py-3">{win.game}</td>
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">{win.user}</td>
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">{win.time}</td>
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">
                  <span className="text-white/90">${win.bet}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3">{win.multiplier}</td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <span>${win.payout}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
