import React from "react";
import TrendingGames from "./trending-games";
import SliderEX from "./slider-card";
import TheOriginals from "./the-originals";
import FaqSection from "./faq";
import LiveWinsSection from "../../components/live-wins";
import ContinuePlaying from "./continue-playing";
import BannerSlider from "../../components/banner-slider";
import GameSearch from "./search-component";

export default function HomeV2() {
  return (
    <div className="text-white px-2 lg:px-auto  bg-black/20 lg:bg-auto">
      <BannerSlider />
      <GameSearch />
      <ContinuePlaying />
      <TheOriginals />
      <TrendingGames />
      <LiveWinsSection />
      <FaqSection />
    </div>
  );
}
