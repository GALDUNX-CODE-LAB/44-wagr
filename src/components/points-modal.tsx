"use client";
import { useEffect, useState } from "react";
import { X, ArrowRight, Coins, LoaderCircle, History } from "lucide-react";
import { claimDailyStreak, fetchUserPoints, redeemPoints, fetchRedemptionHistory } from "../lib/api";
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUserData";
import { useQuery } from "@tanstack/react-query";

interface PointsModalProps {
  open: boolean;
  onClose: () => void;
}

interface PointEntry {
  day: number;
  points: number;
  status: "claim" | "claimed" | "date";
  date?: string;
}

interface SocialEntry {
  action: string;
  points: number;
  status: "claim" | "claimed";
  link: string;
  visited: boolean;
}

interface RedeemHistory {
  id: string;
  amount: number;
  date: string;
  status: string;
}

export default function PointsModal({ open, onClose }: PointsModalProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "social" | "redeem">("daily");
  const [claiming, setClaiming] = useState(false);
  const [streakData, setStreakData] = useState<PointEntry[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [socialPoints, setSocialPoints] = useState<SocialEntry[]>([
    {
      action: "Follow us on Instagram",
      points: 300,
      status: "claim",
      link: "https://www.instagram.com/vercel",
      visited: false,
    },
    { action: "Join our Telegram", points: 300, status: "claim", link: "https://t.me/vercel", visited: false },
    { action: "Share on Twitter", points: 300, status: "claim", link: "https://twitter.com/vercel", visited: false },
  ]);

  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  // const [redeemHistory, setRedeemHistory] = useState<RedeemHistory[]>([]);

  const initializeStreakData = (streakPoints: number, hasClaimedToday: boolean) => {
    const daysClaimed = Math.floor(streakPoints / 20);
    const result: PointEntry[] = [];
    for (let i = 1; i <= 7; i++) {
      let status: PointEntry["status"] = "date";
      if (i <= daysClaimed) status = "claimed";
      else if (i === daysClaimed + 1) status = hasClaimedToday ? "claimed" : "claim";
      result.push({ day: i, points: i === 8 ? 50 : i >= 6 ? 30 : i === 5 ? 25 : 20, status });
    }
    setStreakData(result);
  };

  const loadUserPoints = async () => {
    try {
      const res = await fetchUserPoints();
      if (res.success) {
        console.log(res);
        setUserPoints(res.userPoint);
        const daysClaimed = Math.floor(res.breakdown.streakPoints / 20);
        const claimedToday = daysClaimed > 0 && res.breakdown.streakPoints % 20 === 0;
        setHasClaimedToday(claimedToday);
        initializeStreakData(res.breakdown.streakPoints, claimedToday);
      }
    } catch (err) {
      console.error("Failed to load user points", err);
    }
  };

  const { data: redeemHistory } = useQuery({ queryKey: ["Redemsion history"], queryFn: fetchRedemptionHistory });

  const loadRedeemHistory = async () => {
    try {
      const res = await fetchRedemptionHistory();
      // if (res.success) setRedeemHistory(res.data);
    } catch (err) {
      console.error("Failed to load redeem history", err);
    }
  };

  console.log(redeemHistory);

  useEffect(() => {
    if (open) {
      loadUserPoints();
      loadRedeemHistory();
    }
  }, [open]);

  const handleDailyClaim = async () => {
    try {
      setClaiming(true);
      const res = await claimDailyStreak();
      if (res.success) {
        const newStreakPoints = userPoints + res.points;
        setUserPoints(newStreakPoints);
        setHasClaimedToday(true);
        initializeStreakData(newStreakPoints, true);
      }
    } catch (err) {
      console.error("Claim failed", err);
    } finally {
      setClaiming(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemAmount || Number(redeemAmount) <= 0) {
      setRedeemError("Enter a valid amount");
      return;
    }
    setRedeemError(null);
    setRedeemLoading(true);
    try {
      const res = await redeemPoints(Number(redeemAmount));
      if (res.success) {
        setUserPoints(userPoints - Number(redeemAmount));
        setRedeemAmount("");
        loadRedeemHistory();
      } else {
        setRedeemError(res.message || "Redeem failed");
      }
    } catch {
      setRedeemError("Unable to redeem points");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleSocialArrowClick = (index: number) => {
    setSocialPoints((prev) => prev.map((entry, i) => (i === index ? { ...entry, visited: true } : entry)));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex lg:items-center items-end justify-center px-0"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1C] text-white rounded-t-xl lg:rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto p-6 border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Points System</h2>
          <button className="bg-[#C8A2FF]/10 text-[#C8A2FF] text-xs flex items-center gap-2 rounded-full px-4 py-2">
            <Coins size={10} className="text-yellow-300" /> {userPoints} Points
          </button>
        </div>

        <div className="w-full h-[40px] bg-[#212121] border border-white/10 rounded-full flex mb-6 overflow-hidden">
          <button
            onClick={() => setActiveTab("daily")}
            className={`w-1/3 rounded-full text-xs sm:text-sm font-medium transition ${
              activeTab === "daily" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Daily Points
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`w-1/3 rounded-full text-xs sm:text-sm font-medium transition ${
              activeTab === "social" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Social Points
          </button>
          <button
            onClick={() => setActiveTab("redeem")}
            className={`w-1/3 rounded-full text-xs sm:text-sm font-medium transition ${
              activeTab === "redeem" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Redeem Points
          </button>
        </div>

        {activeTab === "daily" && (
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {streakData.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="w-full relative overflow-clip bg-[#212121] border-white/10 rounded-md px-6 py-4 flex flex-col justify-between items-center text-center"
              >
                <span className="text-xs text-white/50 font-medium mb-2">Day {entry.day}</span>
                <span className="text-base lg:text-xl font-medium mb-4">+{entry.points}</span>
                {entry.status === "claimed" ? (
                  <button
                    className="w-full bg-[#1c1c1c] text-white rounded-lg py-2 text-xs font-semibold cursor-not-allowed"
                    disabled
                  >
                    Claimed
                  </button>
                ) : entry.status === "claim" &&
                  !hasClaimedToday &&
                  index === streakData.findIndex((e) => e.status === "claim") ? (
                  <button
                    onClick={handleDailyClaim}
                    disabled={claiming}
                    className={`w-full rounded-lg py-1.5 text-xs font-semibold ${
                      claiming ? "bg-[#1c1c1c] text-white cursor-not-allowed" : "bg-white hover:bg-[#D5B3FF] text-black"
                    }`}
                  >
                    {claiming ? "Claiming..." : "Claim"}
                  </button>
                ) : (
                  <div className="w-full bg-[#1c1c1c] text-white rounded-lg py-1.5 text-xs font-semibold">
                    {entry.date || "Locked"}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "social" && (
          <div className="flex flex-col gap-3">
            {socialPoints.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`w-full flex justify-between items-center px-6 py-4 rounded-[20px] border border-white/10 ${
                  entry.status === "claimed" ? "bg-[#1C1C1C] text-white/40" : "bg-[#212121]"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">{entry.action}</span>
                  <span className="font-medium text-sm">+{entry.points}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialArrowClick(i)}
                    className={`p-2 rounded-full ${
                      entry.status === "claimed" ? "cursor-not-allowed" : "hover:bg-white/10"
                    }`}
                    aria-label={`Go to ${entry.action}`}
                  >
                    <ArrowRight className={`w-5 h-5 ${entry.status === "claimed" ? "text-white/40" : "text-white"}`} />
                  </a>
                  <button
                    className={`min-w-[80px] sm:w-[100px] px-4 py-2 rounded-full text-xs font-semibold ${
                      !entry.visited
                        ? "bg-black text-white/40 cursor-not-allowed"
                        : "bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black"
                    }`}
                    disabled={!entry.visited}
                  >
                    Claim
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "redeem" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4">
              <p className="text-sm text-gray-400">Available Points</p>
              <p className="text-2xl font-bold text-white">{userPoints.toLocaleString()} pts</p>
              <p className="text-xs text-gray-500 mt-2">Redeemed credits expire after 72 hours</p>
            </div>

            <form onSubmit={handleRedeem} className="space-y-3">
              <label className="block text-xs text-gray-400">Amount to Redeem</label>
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (Number(val) > userPoints) {
                    setRedeemError("You cannot redeem more than your available points");
                  } else {
                    setRedeemError(null);
                  }
                  setRedeemAmount(val);
                }}
                placeholder="Enter amount"
                max={userPoints}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {redeemAmount && !redeemError && (
                <p className="text-xs text-gray-400">
                  Approximate Value: <span className="text-primary">${(Number(redeemAmount) * 0.01).toFixed(2)}</span>
                </p>
              )}

              {redeemError && <p className="text-xs text-red-400">{redeemError}</p>}

              <button
                type="submit"
                disabled={redeemLoading || !!redeemError}
                className="w-full bg-primary text-secondary py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition flex justify-center items-center"
              >
                {redeemLoading ? <LoaderCircle size={16} className="animate-spin" /> : "Redeem Points"}
              </button>
            </form>

            <div className="mt-5">
              <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <History size={14} /> Redemption History
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-2 text-xs">
                {redeemHistory?.transactions?.length === 0 ? (
                  <p className="text-gray-500">No redemption history yet.</p>
                ) : (
                  redeemHistory?.transactions?.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between bg-[#1a1a1a] border border-white/5 rounded-md px-3 py-2 text-gray-300"
                    >
                      <span>${r.amount}</span>
                      <span className="text-gray-400">{r.status}</span>
                      <span className="text-gray-500">{r.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
