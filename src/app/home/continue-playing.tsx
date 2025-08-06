// components/ContinuePlaying.tsx
import React, { useRef } from "react";
import Image from "next/image";
import { FaClock } from "react-icons/fa";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";

interface Game {
  name: string;
  image: string;
}

const games: Game[] = [
  { name: "Roulette Royale", image: "/assets/games/crash.png" },
  { name: "Blackjack Pro", image: "/assets/games/coin-flip.png" },
  { name: "Slots Mania", image: "/assets/games/Dice.png" },
  { name: "Poker Stars", image: "/assets/games/glass-bridge.png" },
  { name: "Baccarat Elite", image: "/assets/games/mine.png" },
  { name: "Craps Champion", image: "/assets/games/Plinko.png" },
];

export const ContinuePlaying: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollOne = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.children[0] as HTMLElement;
    const style = getComputedStyle(container);
    const gap = parseInt(style.columnGap) || 0;
    const scrollAmount = firstCard.clientWidth + gap;

    container.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="flex items-center text-lg font-semibold text-white/70">
          <FaClock className="mr-2" />
          Continue Playing
        </h2>
        <div className="flex space-x-2">
          <button onClick={() => scrollOne("left")} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
            <HiArrowLeft size={20} />
          </button>
          <button onClick={() => scrollOne("right")} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
            <HiArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div ref={scrollRef} className="flex gap-x-4 overflow-x-auto px-4 scrollbar-hide">
        {games.map((g) => (
          <div key={g.name} className="w-[160px] flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden relative group">
            <div className="relative w-full h-40">
              <Image src={g.image} alt={g.name} layout="fill" objectFit="cover" />
            </div>
            <div className="p-2 absolute bottom-0 bg-black/50  right-0 left-0 h-full translate-y-[80%] group-hover:translate-y-[0%] transition-all duration-300">
              <h3 className="text-xs font-medium">{g.name}</h3>
              <h3 className=" font-medium text-white text-3xl mt-10">{g.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
