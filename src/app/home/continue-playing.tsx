"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ContinuePlaying() {
  const [cachedGames, setCachedGames] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("continue-playing");
    if (stored) {
      try {
        setCachedGames(JSON.parse(stored));
      } catch {
        setCachedGames([]);
      }
    }
  }, []);

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
    if (startIndex < cachedGames.length - visibleCount) {
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

  if (cachedGames.length === 0) {
    return (
      <div className="bg-black/20 p-6 rounded-lg">
        <h2 className="text-white font-semibold text-lg mb-2">Continue Playing</h2>
        <p className="text-gray-400 text-sm">Select a game and start</p>
      </div>
    );
  }

  return (
    <div className="py-6 lg:p-6 rounded-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg">Continue Playing</h2>
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
            disabled={startIndex >= cachedGames.length - visibleCount}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative h-40">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={startIndex}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 right-0 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4"
          >
            {cachedGames.slice(startIndex, startIndex + visibleCount).map((game: any, index: number) => (
              <div
                key={index}
                className="h-40 relative bg-black rounded-md flex items-center justify-center text-white"
              >
                <Image src={game.image} fill alt={game.name} className="object-cover rounded-md" />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
