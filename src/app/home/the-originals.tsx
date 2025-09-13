"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function TheOriginals() {
  const availableGames = [
    { name: "Crash", players: 1248, image: "/assets/gamesV2/crash.png", link: "/games/crash" },
    { name: "Dice", players: 892, image: "/assets/gamesV2/dice.png", link: "/games/dice" },
    { name: "Coin", players: 1532, image: "/assets/gamesV2/coinflip.png", link: "/games/coin" },
    { name: "Wheel", players: 721, image: "/assets/gamesV2/wheels.png", link: "/games/wheel" },
  ];

  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) setVisibleCount(3);
      else if (window.innerWidth < 1024) setVisibleCount(5);
      else setVisibleCount(8);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const handleNext = () => {
    if (startIndex < availableGames.length - visibleCount) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const router = useRouter();

  const handleSelectGame = (game: any) => {
    try {
      const stored = localStorage.getItem("continue-playing");
      let parsed: any[] = stored ? JSON.parse(stored) : [];

      const exists = parsed.some((g) => g.name === game.name);
      if (!exists) {
        parsed.unshift(game); // put the latest at the start
        localStorage.setItem("continue-playing", JSON.stringify(parsed));
      }
      router.push(game.link);
    } catch (err) {
      console.error("Error updating localStorage:", err);
    }
  };

  return (
    <div className="py-6  rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg">The Originals</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="lg:w-8 lg:h-8 w-6 h-6 flex items-center justify-center bg-[#243441] rounded-md text-white disabled:opacity-40"
            disabled={startIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="lg:w-8 lg:h-8 w-6 h-6 flex items-center justify-center bg-[#243441] rounded-md text-white disabled:opacity-40"
            disabled={startIndex >= availableGames.length - visibleCount}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
        {availableGames.slice(startIndex, startIndex + visibleCount).map((game: any, index: number) => (
          <div
            key={index}
            onClick={() => handleSelectGame(game)}
            className="h-40 relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white"
          >
            <Image src={game.image} fill alt={game.name} className="rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
