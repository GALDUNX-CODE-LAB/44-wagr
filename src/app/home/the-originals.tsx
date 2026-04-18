"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TbNumber44Small } from "react-icons/tb";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import { fetchOriginalsPlayerCounts } from "../../lib/api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const ORIGINALS_GAMES = [
  { name: "Crash", key: "crash" as const, image: "/assets/gamesV2/crash2.png", link: "/games/crash" },
  { name: "Dice", key: "dice" as const, image: "/assets/gamesV2/dice2.png", link: "/games/dice" },
  { name: "Coin", key: "coin" as const, image: "/assets/gamesV2/coinflip2.png", link: "/games/coin" },
  { name: "Wheel", key: "wheel" as const, image: "/assets/gamesV2/wheels2.png", link: "/games/wheel" },
];

export default function TheOriginals() {
  const { data: playerCounts } = useQuery({
    queryKey: ["originals-player-counts"],
    queryFn: fetchOriginalsPlayerCounts,
    refetchInterval: 30000,
  });

  const availableGames = ORIGINALS_GAMES.map((g) => ({
    ...g,
    players: playerCounts ? playerCounts[g.key] : 0,
  }));

  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const handleSelectGame = (game: any) => {
    try {
      const stored = localStorage.getItem("continue-playing");
      let parsed: any[] = stored ? JSON.parse(stored) : [];

      parsed = parsed.filter((g) => g.link !== game.link);
      parsed.unshift(game);
      localStorage.setItem("continue-playing", JSON.stringify(parsed));
      router.push(game.link);
    } catch (err) {
      console.error("Error updating localStorage:", err);
    }
  };

  return (
    <div className="py-3 rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg flex items-center gap-1">
          <TbNumber44Small className="text-primary bg-primary/20 rounded" />
          44-wagr Original
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            className="lg:w-8 lg:h-8 w-6 h-6 flex items-center justify-center bg-[#243441] rounded-md text-white hover:bg-[#2a3f4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (swiperRef.current && !swiperRef.current.isEnd) {
                swiperRef.current.slideNext();
              }
            }}
            disabled={isEnd}
            className="lg:w-8 lg:h-8 w-6 h-6 flex items-center justify-center bg-[#243441] rounded-md text-white hover:bg-[#2a3f4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden -mx-2 px-2">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // Update state after a brief delay to ensure Swiper has calculated properly
            setTimeout(() => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }, 100);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onReachBeginning={(swiper) => {
            setIsBeginning(true);
            setIsEnd(false);
          }}
          onReachEnd={(swiper) => {
            setIsBeginning(false);
            setIsEnd(true);
          }}
          onUpdate={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          modules={[Navigation, FreeMode, Mousewheel]}
          spaceBetween={8}
          slidesPerView="auto"
          freeMode={false}
          watchOverflow={true}
          watchSlidesProgress={true}
          resistance={true}
          resistanceRatio={0.5}
          allowSlideNext={!isEnd}
          allowSlidePrev={!isBeginning}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
        >
          {availableGames.map((game: (typeof availableGames)[0], index: number) => (
            <SwiperSlide key={index} style={{ width: "auto" }}>
              <div
                onClick={() => handleSelectGame(game)}
                className="w-[100px] md:w-[120px] lg:w-[140px] flex flex-col gap-1 cursor-pointer group"
              >
                <div className="aspect-square relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src={game.image}
                    fill
                    alt={game.name}
                    className="object-contain"
                    draggable={false}
                    unoptimized
                  />
                </div>
                <p className="text-white/70 text-xs text-center">{game.players.toLocaleString()} playing</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
