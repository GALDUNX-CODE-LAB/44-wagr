"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdOutlineCasino } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import { GAMES } from "../../lib/games";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const TRENDING_GAMES = GAMES;

export default function TrendingGames() {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSelectGame = (game: (typeof TRENDING_GAMES)[number]) => {
    try {
      const stored = localStorage.getItem("continue-playing");
      let parsed: { name: string; image: string; link: string }[] = stored ? JSON.parse(stored) : [];

      parsed = parsed.filter((g) => g.link !== game.link);
      parsed.unshift({ name: game.name, image: game.image, link: game.link });
      localStorage.setItem("continue-playing", JSON.stringify(parsed));
      router.push(game.link);
    } catch (err) {
      console.error("Error updating localStorage:", err);
      router.push(game.link);
    }
  };

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
          {TRENDING_GAMES.map((game, index) => (
            <SwiperSlide key={index} style={{ width: 'auto' }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectGame(game)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectGame(game);
                  }
                }}
                className="w-[100px] md:w-[120px] lg:w-[140px] aspect-square relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform duration-200"
              >
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
