"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";

export default function LiveWinsSection() {
  const router = useRouter();

  const gameCategories = ["Casino", "Sports", "Race", "Dice"];
  const liveWins = [
    {
      event: "Roulette Spin",
      user: "Big boy",
      time: "2 mins ago",
      bet: "2,500.76854...",
      multiplier: "1.00x",
      payout: "2,500.76854...",
    },
    {
      event: "Blackjack",
      user: "Big boy",
      time: "4 mins ago",
      bet: "2,500.76854...",
      multiplier: "1.00x",
      payout: "2,500.76854...",
    },
    {
      event: "Slots",
      user: "Big boy",
      time: "6 mins ago",
      bet: "2,500.76854...",
      multiplier: "1.00x",
      payout: "2,500.76854...",
    },
    {
      event: "Dice Roll",
      user: "Big boy",
      time: "8 mins ago",
      bet: "2,500.76854...",
      multiplier: "1.00x",
      payout: "2,500.76854...",
    },
  ];

  const [activeCategory, setActiveCategory] = useState(gameCategories[0]);

  return (
    <section className="mb-20 w-full ">
      <div className="flex items-start gap-2 mb-4">
        <Award className="text-[#c8a2ff]" />
        <h2 className="text-xl font-bold text-white">Live Wins</h2>
      </div>

      <div className="flex gap-2 mb-6">
        {gameCategories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              router.push(`/games/${category.toLowerCase()}`);
            }}
            className={`w-[92px] h-[30px] rounded-full flex items-center justify-center text-sm transition
              ${
                activeCategory === category
                  ? "bg-[#C8A2FF] text-black"
                  : "bg-[#313131] text-white/70 hover:bg-[#2a2a2a]"
              }`}
            style={{
              padding: "5px 23px",
              gap: "10px",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="w-full rounded-lg overflow-x-auto">
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
                <td className="whitespace-nowrap px-5 py-3">{win.event}</td>
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">{win.user}</td>
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">{win.time}</td>
                <td className="whitespace-nowrap px-5 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <span>{win.bet}</span>
                    <div className="w-3 h-3 rounded-full bg-[#D9D9D9]" />
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3">{win.multiplier}</td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>{win.payout}</span>
                    <div className="w-3 h-3 rounded-full bg-[#D9D9D9]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
