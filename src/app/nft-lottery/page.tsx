'use client';

import Image from "next/image";
import { nftLotteryData } from "../../lib/dummy-data";

export default function NFTLotteryPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-10 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">NFT Lottery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftLotteryData.map((nft) => (
          <div
            key={nft.id}
            className="w-full min-h-[226px] rounded-[20px] bg-[#212121] border border-white/10 p-4 flex flex-col justify-between"
          >
            {/* Top Section: Name & Image */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-base sm:text-lg font-semibold">{nft.name}</h2>
              <Image
                src={nft.image}
                alt={nft.name}
                width={64}
                height={64}
                className="rounded-md object-contain"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 mt-2 flex-1 break-words">
              {nft.description}
            </p>

            {/* CTA Button */}
            <button
              className={`w-full sm:w-[120px] h-[40px] mt-4 rounded-[20px] border text-sm font-medium transition ${
                nft.status === "get-started"
                  ? "bg-[#C8A2FF] text-black border-[#C8A2FF] hover:bg-[#D5B3FF]"
                  : "bg-transparent text-white border-[#C8A2FF] opacity-60 cursor-default"
              }`}
            >
              {nft.status === "get-started" ? "Get Started" : "Completed"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
