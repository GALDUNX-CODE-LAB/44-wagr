"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { FaCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export default function ContinuePlaying() {
  const [cachedGames, setCachedGames] = useState<any[]>([]);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("continue-playing");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCachedGames(parsed);
      } catch {
        setCachedGames([]);
      }
    }
  }, []);

  const handleGameClick = (game: any) => {
    if (game.link) {
      router.push(game.link);
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
    <div className="py-6 rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold lg:text-lg">Continue Playing</h2>
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
          {cachedGames.map((game: any, index: number) => (
            <SwiperSlide key={index} style={{ width: 'auto' }}>
              <div 
                onClick={() => handleGameClick(game)}
                className="cursor-pointer"
              >
                <div className="w-[100px] md:w-[120px] lg:w-[140px] aspect-square relative bg-black rounded-lg overflow-hidden flex items-center justify-center text-white hover:scale-105 transition-transform duration-200">
                  <Image 
                    src={game.image} 
                    fill 
                    alt={game.name} 
                    className="object-contain" 
                    draggable={false}
                    unoptimized
                  />
                </div>
                <div className="text-xs flex items-center gap-2 text-white/70 mt-1 justify-center">
                  <FaCircle size={8} className="text-green-600" />
                  <span className="truncate max-w-[100px] md:max-w-[120px] lg:max-w-[140px]">{game.name}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
