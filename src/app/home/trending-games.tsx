"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MdOutlineCasino } from "react-icons/md";

export default function TrendingGames() {
  const items = Array.from({ length: 20 }).map((_, i) => i + 1);
  const trendingGames = [
    { name: "Roulette Royale", players: 1248, image: "/assets/gamesV2/crash.png" },
    { name: "Blackjack Pro", players: 1248, image: "/assets/gamesV2/coinflip.png" },
    { name: "Slots Mania", players: 1248, image: "/assets/gamesV2/dice.png" },
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = startX - x;

    if (Math.abs(walk) > 50) {
      if (walk > 0 && startIndex < trendingGames.length - visibleCount) {
        setDirection(1);
        setStartIndex(startIndex + 1);
        setIsDragging(false);
      } else if (walk < 0 && startIndex > 0) {
        setDirection(-1);
        setStartIndex(startIndex - 1);
        setIsDragging(false);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    const walk = startX - x;

    if (Math.abs(walk) > 50) {
      if (walk > 0 && startIndex < trendingGames.length - visibleCount) {
        setDirection(1);
        setStartIndex(startIndex + 1);
        setIsDragging(false);
      } else if (walk < 0 && startIndex > 0) {
        setDirection(-1);
        setStartIndex(startIndex - 1);
        setIsDragging(false);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 && startIndex < trendingGames.length - visibleCount) {
      setDirection(1);
      setStartIndex(startIndex + 1);
    } else if (e.deltaY < 0 && startIndex > 0) {
      setDirection(-1);
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <div className="py-6 rounded-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg flex gap-1 items-center">
          <MdOutlineCasino className="text-primary" />
          Trending Games
        </h2>
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
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{
              userSelect: "none",
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            {trendingGames.slice(startIndex, startIndex + visibleCount).map((game: any, index: number) => (
              <div
                key={index}
                className="h-40 relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white"
                draggable={false}
              >
                <Image src={game.image} fill alt={game.name} draggable={false} />
              </div>

              // <div
              //   key={index}
              //   className="h-40 relative bg-black rounded-md flex items-center justify-center text-white select-none"
              //   draggable={false}
              // >
              //   <Image
              //     src={game.image}
              //     fill
              //     alt={game.name}
              //     className="object-cover rounded-md pointer-events-none"
              //     draggable={false}
              //   />
              // </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
