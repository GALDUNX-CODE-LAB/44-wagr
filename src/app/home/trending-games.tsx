"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function TrendingGames() {
  const items = Array.from({ length: 20 }).map((_, i) => i + 1);
  const trendingGames = [
    { name: "Roulette Royale", players: 1248, image: "/assets/gamesV2/crash.png" },
    { name: "Blackjack Pro", players: 1248, image: "/assets/gamesV2/coinflip.png" },
    { name: "Slots Mania", players: 1248, image: "/assets/gamesV2/Dice.png" },
    { name: "Poker Stars", players: 1248, image: "/assets/gamesV2/glass-bridge.png" },
    { name: "Baccarat Elite", players: 1248, image: "/assets/gamesV2/mines.png" },
    { name: "Craps Champion", players: 1248, image: "/assets/gamesV2/plinko.png" },
    { name: "Texas Holdem", players: 1248, image: "/assets/gamesV2/pump.png" },
    { name: "Dice Master", players: 1248, image: "/assets/gamesV2/red-light.png" },
    { name: "Virtual Sports", players: 1248, image: "/assets/gamesV2/rps.png" },
    { name: "Wheel of Fortune", players: 1248, image: "/assets/gamesV2/wheels.png" },
  ];

  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [direction, setDirection] = useState(0);

  const updateVisibleCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) setVisibleCount(3);
      else if (window.innerWidth < 1024) setVisibleCount(5);
      else setVisibleCount(8);
    }
  };

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const handleNext = () => {
    if (startIndex < trendingGames.length - visibleCount) {
      setDirection(1);
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setDirection(-1);
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <div className="py-6 rounded-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg">Trending Games</h2>
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
            disabled={startIndex >= trendingGames.length - visibleCount}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative h-40">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={startIndex}
            className="absolute top-0 left-0 right-0 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2"
          >
            {trendingGames.slice(startIndex, startIndex + visibleCount).map((game: any, index: number) => (
              <div
                key={index}
                className="h-40 relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white"
              >
                <Image src={game.image} fill alt={game.name} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
