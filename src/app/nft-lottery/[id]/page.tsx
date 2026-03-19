"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import NumberSelection from "../components/number-selection";
import {
  fetchLotteryNumbers,
  placeLotteryBet,
  fetchLotteries,
  fetchLotteryById,
  fetchMyLotteryBet,
} from "../../../lib/api";
import { LotteryNumbersResponse, Lottery } from "../../../interfaces/interface";

const MAX_SELECTIONS = 5;

function getRandomFromPool(pool: number[], count: number): number[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function LotteryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const lotteryId = params?.id as string;

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lotteryData, setLotteryData] = useState<Lottery | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [myBet, setMyBet] = useState<{ pickedNumbers: number[] } | null>(null);

  const formatTimeRemaining = useCallback((endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return "Draw has ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, []);

  useEffect(() => {
    if (!lotteryData?.endTime || lotteryData.isCompleted) return;
    const update = () => {
      const formatted = formatTimeRemaining(lotteryData.endTime);
      setTimeRemaining(formatted);
      if (formatted === "Draw has ended") {
        setLotteryData((prev) => (prev ? { ...prev, isCompleted: true } : null));
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lotteryData?.endTime, lotteryData?.isCompleted, formatTimeRemaining]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!lotteryId) return;
      try {
        setLoading(true);
        setError(null);
        let loaded: Lottery | null = null;
        try {
          const res = await fetchLotteryById(lotteryId);
          if (res) loaded = { ...res, isCompleted: res.isEnded || res.isCompleted };
        } catch {
          /* ignore */
        }
        if (!loaded) {
          const list = await fetchLotteries();
          loaded = list.lotteries?.find((l: Lottery) => l._id === lotteryId) ?? null;
        }
        if (cancelled) return;
        if (loaded) {
          setLotteryData(loaded);
          if (!loaded.isCompleted && !loaded.isEnded) {
            try {
              const numRes: LotteryNumbersResponse = await fetchLotteryNumbers(lotteryId);
              setAvailableNumbers(numRes.availableNumbers ?? []);
            } catch {
              setAvailableNumbers(Array.from({ length: 49 }, (_, i) => i + 1));
            }
            try {
              const bet = await fetchMyLotteryBet(lotteryId);
              if (!cancelled && bet) setMyBet(bet);
            } catch {
              /* ignore */
            }
          } else {
            setAvailableNumbers([]);
          }
        } else {
          setError("Lottery not found");
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load lottery data");
        setAvailableNumbers(Array.from({ length: 49 }, (_, i) => i + 1));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [lotteryId]);

  useEffect(() => {
    if (!lotteryId) router.push("/nft-lottery");
  }, [lotteryId, router]);

  const handleNumberSelect = useCallback((number: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(number)) return prev.filter((n) => n !== number);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, number];
    });
  }, []);

  const quickPick = useCallback(
    (count: number) => {
      const pool = availableNumbers.length ? availableNumbers : Array.from({ length: 49 }, (_, i) => i + 1);
      const picks = getRandomFromPool(pool, Math.min(count, MAX_SELECTIONS));
      setSelectedNumbers(picks);
      setPickerOpen(false);
    },
    [availableNumbers],
  );

  const handlePlaceBet = async () => {
    if (selectedNumbers.length !== MAX_SELECTIONS || !lotteryData) {
      setError(`Please select exactly ${MAX_SELECTIONS} numbers`);
      return;
    }
    if (lotteryData.isCompleted || lotteryData.isEnded) {
      setError("This lottery has already ended");
      return;
    }
    setError(null);
    setOrderSuccess(false);
    const picked = selectedNumbers.slice().sort((a, b) => a - b);
    try {
      setBetting(true);
      await placeLotteryBet(lotteryId, { pickedNumbers: picked });
      setSelectedNumbers([]);
      setOrderSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to place bet. Please try again.";
      setError(msg);
    } finally {
      setBetting(false);
    }
  };

  if (!lotteryId || loading) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#c8a2ff] border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-white/80">Loading lottery...</p>
        </div>
      </div>
    );
  }

  if (!lotteryData) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-4">Lottery not found</p>
          <button
            onClick={() => router.push("/nft-lottery")}
            className="text-sm px-5 py-2.5 bg-[#c8a2ff] text-black font-semibold rounded-xl"
          >
            Back to Lotteries
          </button>
        </div>
      </div>
    );
  }

  const jackpotAmount = lotteryData.prizePool ?? 0;
  const isEnded = lotteryData.isCompleted || lotteryData.isEnded;
  const hasPlayed = myBet !== null;
  const displayedNumbers = hasPlayed
    ? (myBet?.pickedNumbers ?? []).sort((a, b) => a - b)
    : [...selectedNumbers].sort((a, b) => a - b);
  const winningNumbers = lotteryData.winningNumbers ?? [];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-[#ededed] pb-8">
      <div className="max-w-6xl mx-auto px-4 pt-4 lg:pt-6">
        {/* Header: back + cart placeholder */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium"
          >
            <span className="text-sm leading-none">←</span>
            Back
          </button>
          <div className="w-10 h-10 rounded-full bg-[#212121] border border-white/10 flex items-center justify-center">
            <span className="text-sm">🛒</span>
          </div>
        </div>

        {/* Grid: left = my picks + prize pool, right = 3 rows (winning numbers, draw status, extra) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ——— LEFT COLUMN: My Picked Games + Prize Pool ——— */}
          <div className="space-y-4">
            {/* My Picked Games */}
            <div className="bg-[#252525] rounded-2xl p-4 lg:p-5 border border-white/10">
              <h2 className="text-sm font-bold text-white mb-3">My Picked Games</h2>
              {isEnded ? (
                <p className="text-sm text-white/70">Draw has ended. See winning numbers on the right.</p>
              ) : hasPlayed ? (
                <>
                  <p className="text-sm text-white/70 mb-3">You&apos;ve already played this round.</p>
                  <div className="flex flex-wrap items-center gap-2 min-h-[44px]">
                    {displayedNumbers.map((num, i) => (
                      <span
                        key={`${num}-${i}`}
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === displayedNumbers.length - 1 ? "bg-[#c8a2ff] text-black" : "bg-white/10 text-white"
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-block px-3 py-1.5 bg-[#c8a2ff] text-black text-sm font-semibold rounded-full mb-4">
                    Play #1 – ${lotteryData.ticketPrice.toFixed(2)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[44px]">
                    {displayedNumbers.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="w-11 h-11 rounded-full border-2 border-dashed border-[#c8a2ff] text-[#c8a2ff] flex items-center justify-center text-sm font-bold hover:bg-[#c8a2ff]/10"
                      >
                        +
                      </button>
                    ) : (
                      <>
                        {displayedNumbers.map((num, i) => (
                          <span
                            key={`${num}-${i}`}
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                              i === displayedNumbers.length - 1 ? "bg-[#c8a2ff] text-black" : "bg-white/10 text-white"
                            }`}
                          >
                            {num}
                          </span>
                        ))}
                        {displayedNumbers.length < MAX_SELECTIONS && (
                          <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            className="w-11 h-11 rounded-full border-2 border-dashed border-[#c8a2ff] text-[#c8a2ff] flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <button
                      type="button"
                      onClick={() => setSelectedNumbers([])}
                      className="p-2 rounded-lg hover:bg-white/5"
                      aria-label="Clear"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="w-full mt-3 py-3 rounded-xl border-2 border-white/30 text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <span>+</span> Add New Play
                  </button>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-white/70 mb-2">Quick Pick</p>
                    <div className="flex gap-2">
                      {[1, 3, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => quickPick(n)}
                          className="flex-1 py-2.5 rounded-xl bg-[#c8a2ff] text-black font-bold text-sm hover:bg-[#b891ff] transition-colors"
                        >
                          +{n}
                        </button>
                      ))}
                    </div>
                  </div>
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handlePlaceBet}
                    disabled={selectedNumbers.length !== MAX_SELECTIONS || betting}
                    className="w-full mt-4 py-4 rounded-2xl bg-[#c8a2ff] text-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b891ff] transition-colors"
                  >
                    {betting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Placing bet...
                      </span>
                    ) : selectedNumbers.length !== MAX_SELECTIONS ? (
                      `Select ${MAX_SELECTIONS - selectedNumbers.length} more number${MAX_SELECTIONS - selectedNumbers.length !== 1 ? "s" : ""}`
                    ) : (
                      "Place Bet"
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Prize Pool Details */}
            <div className="bg-[#252525] rounded-2xl border-0 border-t-4 border-t-[#c8a2ff] shadow-sm overflow-hidden">
              <div className="p-4 lg:p-5">
                <h2 className="text-sm font-bold text-white mb-2">Prize Pool Details</h2>
                <h1 className="text-base font-bold text-white mb-1">{lotteryData.name}</h1>
                <p className="text-sm text-white/70">
                  {jackpotAmount >= 1_000_000
                    ? `$${(jackpotAmount / 1_000_000).toFixed(0)} Million`
                    : `$${jackpotAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}{" "}
                  <span className="text-xs text-red-600 font-semibold">ESTIMATED JACKPOT</span>
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Ticket price</span>
                    <span className="font-semibold">{formatCurrency(lotteryData.ticketPrice)}</span>
                  </div>
                  {isEnded && (
                    <div className="flex justify-between">
                      <span>Total participants</span>
                      <span className="font-semibold">{lotteryData.totalBets ?? 0}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => router.push("/nft-lottery")}
                  className="text-sm font-medium text-white/80 mt-3 hover:underline"
                >
                  Change Lottery →
                </button>
              </div>
            </div>
          </div>

          {/* ——— RIGHT COLUMN: 3 rows ——— */}
          <div className="space-y-4">
            {/* Row 1: Winning Numbers */}
            <div className="bg-[#252525] rounded-2xl p-4 lg:p-5 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-3">Winning Numbers</h3>
              {isEnded && winningNumbers.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {winningNumbers.map((num) => (
                    <div
                      key={num}
                      className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#C8A2FF] to-[#B891FF] text-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">
                  {isEnded ? "No winning numbers for this draw." : "Draw pending. Numbers will appear after the draw."}
                </p>
              )}
            </div>

            {/* Row 2: Draw Status */}
            <div className="bg-[#252525] rounded-2xl p-4 lg:p-5 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-3">Draw Status</h3>
              {isEnded ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-400">Draw ended</span>
                </div>
              ) : (
                <p className="text-lg font-semibold text-white/80">{timeRemaining || "—"}</p>
              )}
            </div>

            {/* Row 3: Extra details (Top winners when ended, or CTA when active) */}
            <div className="bg-[#252525] rounded-2xl p-4 lg:p-5 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-3">{isEnded ? "Top Winners" : "Details"}</h3>
              {isEnded && lotteryData.winners && lotteryData.winners.length > 0 ? (
                <div className="space-y-2">
                  {lotteryData.winners.slice(0, 3).map((w, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-white/10 last:border-0"
                    >
                      <span className="text-sm text-[#171717] lg:text-white truncate max-w-[60%]">
                        {typeof w.user === "string" ? "Winner" : (w.user?.username ?? "Winner")}
                      </span>
                      <span className="text-sm font-semibold text-[#c8a2ff]">{formatCurrency(w.amountWon)}</span>
                    </div>
                  ))}
                </div>
              ) : isEnded ? (
                <p className="text-sm text-white/60">No winners for this draw.</p>
              ) : (
                <p className="text-sm text-white/70">
                  Select 5 numbers, place your bet, and check back after the draw to see if you won.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#c8a2ff]/90 mt-6">Boost and Subscribe your Ticket.</p>

        {/* Success overlay */}
        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-black/50">
            <div className="bg-[#252525] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-white">Game played successfully</h3>
                <button
                  type="button"
                  onClick={() => setOrderSuccess(false)}
                  className="text-white/60 hover:text-white text-sm leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                onClick={() => setOrderSuccess(false)}
                className="w-full py-3 rounded-xl bg-[#171717] text-white font-semibold text-sm"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <NumberSelection
        selectedNumbers={selectedNumbers}
        availableNumbers={availableNumbers}
        onNumberSelect={handleNumberSelect}
        maxSelections={MAX_SELECTIONS}
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        lotteryName={lotteryData.name}
        onQuickPick={quickPick}
        onClear={() => setSelectedNumbers([])}
      />
    </div>
  );
}
