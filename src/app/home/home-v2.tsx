import React from "react";
import TrendingGames from "./trending-games";
import SliderEX from "./slider-card";
import TheOriginals from "./the-originals";
import FaqSection from "./faq";
import LiveWinsSection from "../../components/live-wins";
import ContinuePlaying from "./continue-playing";
import BannerSlider from "../../components/banner-slider";
import GameSearch from "./search-component";
import RandomMetaMarket from "./random-metamarket";
import RandomLottery from "./random-lottery";

export default function HomeV2() {
  return (
    <div className="text-white px-5 pb-2">
      <BannerSlider type="home" />
      <GameSearch />
      <ContinuePlaying />
      <TheOriginals />
      <TrendingGames />
      <RandomMetaMarket />
      <RandomLottery />
      <LiveWinsSection />
      <FaqSection />
    </div>
  );
}
