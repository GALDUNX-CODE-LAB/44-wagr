"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SliderEX() {
  const items = Array.from({ length: 20 }).map((_, i) => i + 1);
  const [startIndex, setStartIndex] = useState(0);

  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 3;
      if (window.innerWidth < 1024) return 5;
    }
    return 8;
  };

  const visibleCount = getVisibleCount();

  const handleNext = () => {
    if (startIndex < items.length - visibleCount) setStartIndex(startIndex + 1);
  };

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  return (
    <div className="bg-[#1c2a35] p-6 rounded-lg relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">Trending Games</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 flex items-center justify-center bg-[#243441] rounded-md text-white disabled:opacity-40"
            disabled={startIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 flex items-center justify-center bg-[#243441] rounded-md text-white disabled:opacity-40"
            disabled={startIndex >= items.length - visibleCount}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
        {items.slice(startIndex, startIndex + visibleCount).map((num) => (
          <div key={num} className="h-40 bg-black rounded-md flex items-center justify-center text-white">
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
