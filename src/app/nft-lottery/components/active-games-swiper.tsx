"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, FreeMode, Mousewheel } from "swiper/modules";
import LotteryCard from "./lottery-card";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";

export interface LotteryCardItem {
  _id: string;
  name: string;
  imgUrl: string;
  ticketPrice: number;
  totalBets: number;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

interface ActiveGamesSwiperProps {
  cards: LotteryCardItem[];
  onCardClick: (cardId: string) => void;
  onBetNow?: (cardId: string) => void;
}

export default function ActiveGamesSwiper({
  cards,
  onCardClick,
  onBetNow,
}: ActiveGamesSwiperProps) {
  if (cards.length === 0) return null;

  return (
    <div className="active-games-swiper relative pb-8">
      <Swiper
        modules={[Pagination, FreeMode, Mousewheel]}
        spaceBetween={12}
        slidesPerView={2}
        slidesPerGroup={1}
        freeMode={{ enabled: true, momentum: true }}
        mousewheel={{ forceToAxis: true, sensitivity: 1, releaseOnEdges: true }}
        breakpoints={{
          320: { spaceBetween: 12, slidesPerView: 2 },
          768: { spaceBetween: 14, slidesPerView: 3 },
          1024: { spaceBetween: 16, slidesPerView: "auto" },
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet lottery-bullet",
          bulletActiveClass: "lottery-bullet-active",
        }}
        className="!overflow-visible"
        style={{ paddingBottom: 28 }}
      >
        {cards.map((card) => (
          <SwiperSlide
            key={card._id}
            className="active-game-slide !h-auto !w-[calc(50%-6px)] md:!w-[calc(33.333%-10px)] lg:!w-[300px]"
          >
            <LotteryCard card={card} onClick={onCardClick} onBetNow={onBetNow} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
