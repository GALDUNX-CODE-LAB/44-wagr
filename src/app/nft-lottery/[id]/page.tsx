"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import NumberSelection from "../components/number-selection";
import BettingPanel from "../components/betting-panel";
import EndedLotteryDisplay from "../components/ended-lottery-display";
import { fetchLotteryNumbers, placeLotteryBet, fetchLotteries, fetchLotteryById } from "../../../lib/api";
import { LotteryNumbersResponse, LotteryBetResponse, Lottery } from "../../../interfaces/interface";

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
        setLotteryData((prev) => (prev ? { ...prev, isCompleted: true } : null));
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

        let loadedLottery: Lottery | null = null;

        // Try to fetch full lottery details first (includes pool and winners)
        try {
          const fullLotteryResponse = await fetchLotteryById(lotteryId);
          if (fullLotteryResponse) {
            // fetchLotteryById already extracts the data, so fullLotteryResponse is the lottery object
            loadedLottery = {
              ...fullLotteryResponse,
              isCompleted: fullLotteryResponse.isEnded || fullLotteryResponse.isCompleted,
            };
          }
        } catch (err) {
          // Fallback to fetching from list if detailed fetch fails
          console.log("Detailed fetch failed, trying list:", err);
        }

        // If we don't have lottery data yet, try fetching from list
        if (!loadedLottery) {
          const lotteriesResponse = await fetchLotteries();
          const lottery = lotteriesResponse.lotteries?.find((l: Lottery) => l._id === lotteryId);
          if (lottery) {
            loadedLottery = lottery;
          }
        }

        if (loadedLottery) {
          setLotteryData(loadedLottery);
          setBetAmount(loadedLottery.ticketPrice.toString());

          // Only fetch available numbers if lottery is not completed
          if (!loadedLottery.isCompleted && !loadedLottery.isEnded) {
            try {
              const numbersResponse: LotteryNumbersResponse = await fetchLotteryNumbers(lotteryId);
              setAvailableNumbers(numbersResponse.availableNumbers || []);
            } catch (err) {
              console.error("Error fetching numbers:", err);
              setAvailableNumbers(Array.from({ length: 49 }, (_, i) => i + 1));
            }
          } else {
            setAvailableNumbers([]);
          }
        } else {
          setError("Lottery not found");
        }
      } catch (error) {
        console.error("Error loading lottery:", error);
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
      setError(`Please select exactly ${MAX_SELECTIONS} numbers`);
      return;
    }

    if (lotteryData.isCompleted || lotteryData.isEnded) {
      setError("This lottery has already ended");
      return;
    }

    try {
      setBetting(true);
      setError(null);
      setSuccess(null);

      const betData = {
        pickedNumbers: selectedNumbers.sort((a, b) => a - b),
      };

      const response: LotteryBetResponse = await placeLotteryBet(lotteryId, betData);

      setError(null);
      setSuccess("Bet placed successfully! 🎉");
      setSelectedNumbers([]);
      
      // Refresh lottery data to update available numbers
      const numbersResponse: LotteryNumbersResponse = await fetchLotteryNumbers(lotteryId);
      setAvailableNumbers(numbersResponse.availableNumbers || []);
      
      setTimeout(() => {
        router.push("/nft-lottery");
      }, 2000);
    } catch (error: any) {
      console.error("Betting error:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to place bet. Please try again.";
      setError(errorMessage);
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
            <h1 className="text-lg md:text-xl font-medium break-words">{lotteryData.name}</h1>
          </div>

          <div className="w-full max-w-[400px] font-medium flex items-center justify-between px-2">
            <span className="md:text-sm text-xs text-white/60">Next Draw Time</span>
            <span className="md:text-base text-sm text-[#c8a2ff] md:text-white whitespace-nowrap">
              {new Date(lotteryData.endTime).toLocaleString()}
            </span>
          </div>

          <div className="w-full max-w-[400px] font-medium flex items-center justify-between px-2">
            <span className="md:text-sm text-xs text-white/60">Next Draw Time Starts In</span>
            <span className="md:text-base text-sm text-[#c8a2ff] md:text-white whitespace-nowrap">
              {lotteryData.isCompleted || lotteryData.isEnded ? "Completed" : timeRemaining}
            </span>
          </div>

          <div className="w-full h-[44px] max-w-[400px] bg-[#212121] border border-white/[0.1] rounded-[12px] flex items-center justify-between px-4">
            <span className="text-sm text-gray-300">Ticket Price</span>
            <span className="text-lg font-bold text-[#c8a2ff]">${lotteryData.ticketPrice.toLocaleString()}</span>
          </div>
          {lotteryData.prizePool !== undefined && (
            <div className="w-full h-[44px] max-w-[400px] bg-[#212121] border border-white/[0.1] rounded-[12px] flex items-center justify-between px-4">
              <span className="text-sm text-gray-300">Prize Pool</span>
              <span className="text-lg font-bold text-[#c8a2ff]">
                ${lotteryData.prizePool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">{error}</div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">{success}</div>
        )}

        {lotteryData.isCompleted || lotteryData.isEnded ? (
          <EndedLotteryDisplay lottery={lotteryData} />
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
