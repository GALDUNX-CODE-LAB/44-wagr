"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const banners = [
  {
    desktop: "/assets/banners/banner-lg.png",
    mobile: "/assets/banners/banner-mb.jpg",
    alt: "Banner 1",
  },
  {
    desktop: "/assets/banners/banner-lg.png",
    mobile: "/assets/banners/banner-mb.jpg",
    alt: "Banner 2",
  },
  {
    desktop: "/assets/banners/banner-lg.png",
    mobile: "/assets/banners/banner-mb.jpg",
    alt: "Banner 3",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000); // 5s auto-slide
    return () => clearInterval(interval);
  }, []);

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
            <Image
              src={banners[current].desktop}
              fill
              className="object-cover hidden lg:block"
              alt={banners[current].alt}
            />
            <Image src={banners[current].mobile} fill className="object-cover lg:hidden" alt={banners[current].alt} />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition ${index === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
