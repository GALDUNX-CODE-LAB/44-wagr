"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { MdOutlineCasino } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export default function TrendingGames() {
  const trendingGames = [
    { name: "Roulette Royale", players: 1248, image: "/assets/gamesV2/crash2.png" },
    { name: "Blackjack Pro", players: 1248, image: "/assets/gamesV2/coinflip2.png" },
    { name: "Slots Mania", players: 1248, image: "/assets/gamesV2/dice2.png" },
    { name: "Poker Stars", players: 1248, image: "/assets/gamesV2/glass-bridge2.png" },
    { name: "Baccarat Elite", players: 1248, image: "/assets/gamesV2/mines2.png" },
    { name: "Craps Champion", players: 1248, image: "/assets/gamesV2/plinko2.png" },
    { name: "Texas Holdem", players: 1248, image: "/assets/gamesV2/pump2.png" },
    { name: "Dice Master", players: 1248, image: "/assets/gamesV2/red-light2.png" },
    { name: "Virtual Sports", players: 1248, image: "/assets/gamesV2/rps2.png" },
    { name: "Wheel of Fortune", players: 1248, image: "/assets/gamesV2/wheels2.png" },
  ];

  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <div className="py-3 rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg flex gap-1 items-center">
          <MdOutlineCasino className="text-primary" />
          Trending Games
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
          {trendingGames.map((game: any, index: number) => (
            <SwiperSlide key={index} style={{ width: 'auto' }}>
              <div className="w-[100px] md:w-[120px] lg:w-[140px] aspect-square relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform duration-200">
                <Image
                  src={game.image}
                  fill
                  alt={game.name}
                  className="object-contain"
                  draggable={false}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
