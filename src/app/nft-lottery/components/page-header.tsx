"use client";

import { BadgeQuestionMark, Search } from "lucide-react";
import { useState } from "react";
import InfoModal from "../../../components/info-modal";

interface PageHeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function PageHeader({ title, onSearch, searchPlaceholder = "Search" }: PageHeaderProps) {
  const [openInfoModal, setOpenInfoModal] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <InfoModal open={openInfoModal} onClose={() => setOpenInfoModal(false)} />
      <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight shrink-0 min-w-0 pr-2">
        {title}
      </h1>
      <div className="flex gap-1.5 sm:gap-2 items-center min-w-0">
        <div className="relative flex-shrink min-w-0 w-[110px] sm:w-[140px] md:w-[180px] lg:w-[220px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full h-8 sm:h-9 bg-[#212121] border border-white/[0.06] rounded-lg pl-8 pr-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
          />
        </div>
        <button className="bg-primary p-1.5 sm:p-2 rounded-lg text-xs text-black shrink-0" onClick={() => setOpenInfoModal(true)}>
          <span className="lg:hidden">
            <BadgeQuestionMark size={14} />
          </span>
          <span className="hidden lg:inline">How to play?</span>
        </button>
      </div>
    </div>
  );
}
