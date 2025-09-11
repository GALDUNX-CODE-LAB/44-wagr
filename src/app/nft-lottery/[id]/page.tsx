"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import NumberSelection from "../components/number-selection";
import BettingPanel from "../components/betting-panel";
import {
  fetchLotteryNumbers,
  placeLotteryBet,
  fetchLotteries,
} from "../../../lib/api";
import {
  LotteryNumbersResponse,
  LotteryBetResponse,
  Lottery,
} from "../../../interfaces/interface";

const MAX_SELECTIONS = 5;

export default function LotteryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const lotteryId = params?.id as string;

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawAmount, setDrawAmount] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lotteryData, setLotteryData] = useState<Lottery | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference <= 0) return "Draw has ended";

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const calculatePotentialReturn = () => {
    const bet = Number.parseFloat(betAmount) || 0;
    return (bet * 2.5).toFixed(2);
  };

  useEffect(() => {
    if (!lotteryData?.endTime || lotteryData.isCompleted) return;

    const updateCountdown = () => {
      const formatted = formatTimeRemaining(lotteryData.endTime);
      setTimeRemaining(formatted);

      if (formatted === "Draw has ended") {
        setLotteryData((prev) =>
          prev ? { ...prev, isCompleted: true } : null
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lotteryData?.endTime, lotteryData?.isCompleted]);

  useEffect(() => {
    const loadLotteryData = async () => {
      if (!lotteryId) return;

      try {
        setLoading(true);
        setError(null);

        const lotteriesResponse = await fetchLotteries();
        const lottery = lotteriesResponse.lotteries?.find(
          (l: Lottery) => l._id === lotteryId
        );

        if (lottery) {
          setLotteryData(lottery);
          setBetAmount(lottery.ticketPrice.toString());
        }

        const numbersResponse: LotteryNumbersResponse =
          await fetchLotteryNumbers(lotteryId);
        setAvailableNumbers(numbersResponse.availableNumbers || []);
      } catch (error) {
        setError("Failed to load lottery data");
        setAvailableNumbers(Array.from({ length: 49 }, (_, i) => i + 1));
      } finally {
        setLoading(false);
      }
    };

    loadLotteryData();
  }, [lotteryId]);

  useEffect(() => {
    if (!lotteryId) {
      router.push("/nft-lottery");
    }
  }, [lotteryId, router]);

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < MAX_SELECTIONS) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handlePlaceBet = async () => {
    if (selectedNumbers.length !== MAX_SELECTIONS || !lotteryData) {
      return;
    }

    try {
      setBetting(true);
      setError(null);

      const betData = {
        pickedNumbers: selectedNumbers.sort((a, b) => a - b),
      };

      const response: LotteryBetResponse = await placeLotteryBet(
        lotteryId,
        betData
      );

      setError(null);
      setSuccess("Bet placed successfully! 🎉");
      setSelectedNumbers([]);
      setTimeout(() => {
        router.push("/nft-lottery");
      }, 1000);
    } catch (error) {
      console.error("Betting error:", error);
      setError("Failed to place bet. Please try again.");
    } finally {
      setBetting(false);
    }
  };

  if (!lotteryId || loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading lottery details...</p>
        </div>
      </div>
    );
  }

  if (!lotteryData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Lottery not found</p>
          <button
            onClick={() => router.push("/nft-lottery")}
            className="mt-4 px-4 py-2 bg-[#C8A2FF] text-black rounded-lg hover:bg-[#B891FF] transition-colors"
          >
            Back to Lotteries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lotteries
        </button>

        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden relative flex-shrink-0">
              <Image
                src={lotteryData.imgUrl || "/assets/user.png"}
                fill
                className="object-cover"
                alt={lotteryData.name}
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/user.png";
                }}
              />
            </div>
            <h1 className="text-lg md:text-xl font-medium break-words">
              {lotteryData.name}
            </h1>
          </div>

          <div className="w-full max-w-[400px] font-medium flex items-center justify-between px-2">
            <span className="md:text-sm text-xs text-white/60">
              Next Draw Time
            </span>
            <span className="md:text-base text-sm text-[#c8a2ff] md:text-white whitespace-nowrap">
              {new Date(lotteryData.endTime).toLocaleString()}
            </span>
          </div>

          <div className="w-full max-w-[400px] font-medium flex items-center justify-between px-2">
            <span className="md:text-sm text-xs text-white/60">
              Next Draw Time Starts In
            </span>
            <span className="md:text-base text-sm text-[#c8a2ff] md:text-white whitespace-nowrap">
              {lotteryData.isCompleted ? "Completed" : timeRemaining}
            </span>
          </div>

          <div className="w-full h-[44px] max-w-[400px] bg-[#212121] border border-white/[0.1] rounded-[12px] flex items-center justify-between px-4">
            <span className="text-sm text-gray-300">Ticket Price</span>
            <span className="text-lg font-bold text-[#c8a2ff]">
              ${lotteryData.ticketPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {lotteryData.isCompleted ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-4">This lottery has ended</h2>
            {lotteryData.winningNumbers && (
              <div className="mb-6">
                <p className="text-white/60 mb-2">Winning Numbers:</p>
                <div className="flex justify-center gap-2">
                  {lotteryData.winningNumbers.map((number) => (
                    <div
                      key={number}
                      className="w-10 h-10 bg-[#C8A2FF] text-black rounded-full flex items-center justify-center font-bold"
                    >
                      {number}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => router.push("/nft-lottery")}
              className="px-6 py-3 bg-[#C8A2FF] text-black cursor-pointer rounded-lg hover:bg-[#B891FF] transition-colors"
            >
              View Other Lotteries
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <NumberSelection
              selectedNumbers={selectedNumbers}
              availableNumbers={availableNumbers}
              onNumberSelect={handleNumberSelect}
              maxSelections={MAX_SELECTIONS}
            />

            <BettingPanel
              drawAmount={drawAmount}
              setDrawAmount={setDrawAmount}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              selectedNumbers={selectedNumbers}
              lotteryData={lotteryData}
              onPlaceBet={handlePlaceBet}
              betting={betting}
              maxSelections={MAX_SELECTIONS}
              calculatePotentialReturn={calculatePotentialReturn}
            />
          </div>
        )}
      </div>
    </div>
  );
}
