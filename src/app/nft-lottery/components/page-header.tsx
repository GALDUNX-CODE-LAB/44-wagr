"use client"

import { Search } from "lucide-react"

interface PageHeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function PageHeader({ 
  title, 
  onSearch, 
  searchPlaceholder = "Search" 
}: PageHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between mb-8 gap-2">
      <h1 className="text-lg md:text-2xl text-white/50 font-medium text-left whitespace-nowrap">
        {title}
      </h1>

      {/* Search Bar */}
      <div className="relative flex-shrink-0 w-[160px] sm:w-[220px] md:w-[300px] lg:w-[375px]">
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full h-[40px] bg-[#212121] border border-white/[0.06] rounded-[8px] px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}