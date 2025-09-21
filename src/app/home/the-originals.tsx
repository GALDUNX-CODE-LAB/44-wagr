"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TbNumber44Small } from "react-icons/tb";

export default function TheOriginals() {
  const availableGames = [
    { name: "Crash", players: 1248, image: "/assets/gamesV2/crash.png", link: "/games/crash" },
    { name: "Dice", players: 892, image: "/assets/gamesV2/dice.png", link: "/games/dice" },
    { name: "Coin", players: 1532, image: "/assets/gamesV2/coinflip.png", link: "/games/coin" },
    { name: "Wheel", players: 721, image: "/assets/gamesV2/wheels.png", link: "/games/wheel" },
  ];

  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

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

  const router = useRouter();

  const handleSelectGame = (game: any) => {
    try {
      const stored = localStorage.getItem("continue-playing");
      let parsed: any[] = stored ? JSON.parse(stored) : [];

      const exists = parsed.some((g) => g.name === game.name);
      if (!exists) {
        parsed.unshift(game);
        localStorage.setItem("continue-playing", JSON.stringify(parsed));
      }
      router.push(game.link);
    } catch (err) {
      console.error("Error updating localStorage:", err);
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
      if (walk > 0 && startIndex < availableGames.length - visibleCount) {
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
      if (walk > 0 && startIndex < availableGames.length - visibleCount) {
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
    if (e.deltaY > 0 && startIndex < availableGames.length - visibleCount) {
      setDirection(1);
      setStartIndex(startIndex + 1);
    } else if (e.deltaY < 0 && startIndex > 0) {
      setDirection(-1);
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <div className="py-6 rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg flex items-center gap-1">
          <TbNumber44Small className="text-primary bg-primary/20 rounded" />
          The Originals
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
            disabled={startIndex >= availableGames.length - visibleCount}
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
            {availableGames.slice(startIndex, startIndex + visibleCount).map((game: any, index: number) => (
              <div
                key={index}
                onClick={() => handleSelectGame(game)}
                className="h-40 relative bg-black rounded-md flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition select-none"
                draggable={false}
              >
                <Image
                  src={game.image}
                  fill
                  alt={game.name}
                  className="object-cover rounded-md pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
