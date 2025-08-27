"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";

export default function LotteryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const lotteryId = params?.id as string;

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawAmount, setDrawAmount] = useState("");
  const [betAmount, setBetAmount] = useState("");

  const lotteryData = {
    id: lotteryId,
    title: `Exclusive NFT Collection #${lotteryId}`,
    image: "/assets/nft1.png",
    winningPrice: "$20,000",
    nextDrawTime: "8/12/2025, 9:08:00 PM",
  };

  const isLoggedIn = useIsLoggedIn();

  const numbers = Array.from({ length: 49 }, (_, i) => i + 1);

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const calculatePotentialReturn = () => {
    const bet = Number.parseFloat(betAmount) || 0;
    return (bet * 2.5).toFixed(2); // Example multiplier
  };

  useEffect(() => {
    if (!lotteryId) {
      router.push("/");
    }
  }, [lotteryId, router]);

  if (!lotteryId) {
    return (
      <div className=" text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading lottery details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="  text-white p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Lotteries
          </button>
        </div> */}

        <div className="flex flex-col gap-6 mb-8">
          {/* Top row: Image + Title */}
          <div className="flex items-center gap-4">
            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden relative flex-shrink-0">
              <Image
                src={lotteryData.image || "/placeholder.svg"}
                fill
                className="object-cover"
                alt={lotteryData.title}
              />
            </div>
            <h1 className="text-lg md:text-xl font-medium break-words">{lotteryData.title}</h1>
          </div>

          {/* Next Draw Time */}
          <div className="w-full max-w-[400px] font-medium flex items-center justify-between px-2">
            <span className="md:text-sm text-xs text-white/60">Next Draw Time</span>
            <span className="md:text-base text-sm text-[#c8a2ff] md:text-white whitespace-nowrap">
              {lotteryData.nextDrawTime}
            </span>
          </div>

          {/* Next Draw Starts In */}
          <div className="w-full max-w-[400px] font-medium flex items-center justify-between px-2">
            <span className="md:text-sm text-xs text-white/60 ">Next Draw Time Starts In</span>
            <span className="md:text-base text-sm text-[#c8a2ff] md:text-white whitespace-nowrap">
              {lotteryData.nextDrawTime}
            </span>
          </div>

          {/* Winning Price */}
          <div className="w-full h-[44px] max-w-[400px] bg-[#212121] border border-white/[0.1] rounded-[12px] flex items-center justify-between px-4">
            <span className="text-sm text-gray-300">Winning Price</span>
            <span className="text-lg font-bold text-[#c8a2ff]">{lotteryData.winningPrice}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Card - Number Selection */}
          <div className="w-full max-w-[556px] min-h-[433px] bg-[#212121] border border-white/[0.1] rounded-[20px]  p-4 lg:p-6">
            <h3 className="text-base font-medium mb-6">Top Winning Lotteries</h3>

            {/* Inner card for number selection */}
            <div className="w-full max-w-[516px] min-h-[353px] bg-[#1C1C1C] border border-white/[0.1] rounded-[16px] p-5">
              <h4 className="text-xs font-medium mb-6">Choose your balls</h4>

              {/* Number grid */}
              <div className="grid grid-cols-7 gap-2 ">
                {numbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleNumberSelect(number)}
                    className={`md:w-[41px] w-[36px] h-[36px] md:h-[41px] rounded-full border text-sm font-medium transition-colors ${
                      selectedNumbers.includes(number)
                        ? "bg-[#C8A2FF] border-[#C8A2FF] text-black"
                        : "bg-[#212121] border-white/[0.1] text-white hover:border-white/20"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-sm text-white/60">{selectedNumbers.join(", ")}</div>
            </div>
          </div>

          {/* Right Card - Betting */}
          <div className="w-full max-w-[556px] min-h-[433px] lg:bg-[#212121] border border-white/[0.1] rounded-[20px] pb-16 p-4 lg:p-6">
            <h3 className="text-base font-medium mb-4">Bet</h3>
            <div className="w-full h-[1px] bg-white/10 mb-8"></div>

            <div className="space-y-4 flex lg:block gap-3">
              {/* Draw input */}
              <div>
                <label className="block text-xs lg:text-sm text-white mb-4">Draw</label>
                <input
                  type="text"
                  value={drawAmount}
                  onChange={(e) => setDrawAmount(e.target.value)}
                  className="w-full text-xs lg:text-sm max-w-[516px] h-[45px] bg-[#1C1C1C] border border-white/[0.1] rounded-[10px] px-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                  placeholder="Draw"
                />
              </div>

              {/* Bet amount input */}
              <div>
                <label className="block text-xs lg:text-sm text-white mb-4">Bet Amount</label>
                <div className="relative w-full max-w-[516px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">$</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full text-xs lg:text-sm h-[45px] bg-[#1C1C1C] border border-white/[0.1] rounded-[10px] pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    placeholder="Enter bet amount"
                  />
                </div>
              </div>
            </div>

            {/* Line separator */}
            <div className="w-full h-[1px] bg-white/10 my-8"></div>

            {/* Betting summary */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-white/65">Potential Return</span>
                <span className="text-white font-medium">${calculatePotentialReturn()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/65">Total Bet Amount</span>
                <span className="font-medium text-white">${betAmount || "0.00"}</span>
              </div>
            </div>

            {/* Bet button */}
            <button
              className="w-full  p-3 lg:h-[50px] bg-[#C8A2FF] mt-2 text-black font-bold text-sm lg:text-base rounded-[10px] hover:bg-[#B891FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedNumbers.length === 0 || !betAmount || !isLoggedIn}
            >
              {!isLoggedIn ? "Login to play" : "Play"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
