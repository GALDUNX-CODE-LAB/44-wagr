"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchBanners } from "../lib/api";

interface Banner {
  _id: string;
  imageUrl: string;
  type: "home" | "game";
  size: "desktop" | "mobile";
  isActive: boolean;
}

interface BannerSliderProps {
  type?: "home" | "game";
}

export default function BannerSlider({ type = "home" }: BannerSliderProps) {
  const [current, setCurrent] = useState(0);

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["banners", type],
    queryFn: () => fetchBanners(type),
    refetchInterval: 60000, // Refetch every minute
  });

  // Group banners by size (desktop/mobile)
  const desktopBanners = banners.filter((b) => b.size === "desktop");
  const mobileBanners = banners.filter((b) => b.size === "mobile");
  
  // Use desktop count for navigation, or mobile if no desktop
  const maxBanners = Math.max(desktopBanners.length, mobileBanners.length);

  useEffect(() => {
    if (maxBanners === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % maxBanners);
    }, 5000); // 5s auto-slide
    return () => clearInterval(interval);
  }, [maxBanners]);

  // Fallback to default banners if no banners from API
  if (isLoading) {
    return (
      <div className="wrap py-5">
        <div className="w-full h-[223px] pt-4 rounded overflow-hidden relative border border-white/10 py-6 bg-[#212121] animate-pulse" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't show banner slider if no banners
  }

  const currentDesktopBanner = desktopBanners[current % desktopBanners.length] || desktopBanners[0];
  const currentMobileBanner = mobileBanners[current % mobileBanners.length] || mobileBanners[0] || currentDesktopBanner;

  return (
    <div className="wrap py-5">
      <div className="w-full h-[223px] pt-4 rounded overflow-hidden relative border border-white/10 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {currentDesktopBanner && (
              <Image
                src={currentDesktopBanner.imageUrl}
                fill
                className="object-cover hidden lg:block"
                alt={`Banner ${current + 1}`}
              />
            )}
            {currentMobileBanner && (
              <Image
                src={currentMobileBanner.imageUrl}
                fill
                className="object-cover lg:hidden"
                alt={`Banner ${current + 1}`}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {maxBanners > 1 && (
          <div className="absolute bottom-4 w-full flex justify-center gap-2">
            {Array.from({ length: maxBanners }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition ${index === current ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
