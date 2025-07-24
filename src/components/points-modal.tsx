"use client";

import { useState } from "react";
import { X, ArrowRight, Coins } from "lucide-react";

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
}

export default function PointsModal({ open, onClose }: PointsModalProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "social">("daily");

  const dailyPoints: PointEntry[] = [
    { day: 1, points: 20, status: "claim" },
    { day: 2, points: 20, status: "claimed" },
    { day: 3, points: 20, status: "claim" },
    { day: 4, points: 20, status: "date", date: "23/04/2025" },
    { day: 5, points: 25, status: "claimed" },
    { day: 6, points: 30, status: "claim" },
    { day: 7, points: 20, status: "date", date: "24/04/2025" },
    { day: 8, points: 50, status: "claim" },
  ];

  const socialPoints: SocialEntry[] = [
    { action: "Follow us on Instagram", points: 300, status: "claim" },
    { action: "Join our Telegram", points: 300, status: "claimed" },
    { action: "Share on Twitter", points: 300, status: "claim" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[800px] p-6 border border-white/10 relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Points System</h2>
          <button className="bg-[#C8A2FF]/10 text-[#C8A2FF] text-xs flex items-center gap-2 rounded-full px-4 py-2">
            <Coins size={10} className="text-yellow-300" /> 1,250 Points
          </button>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-[781px] h-[40px] bg-[#212121] border border-white/10 rounded-full flex mb-6 overflow-hidden">
          <button
            onClick={() => setActiveTab("daily")}
            className={`w-1/2 rounded-full text-sm font-medium transition ${
              activeTab === "daily" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Daily Points
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`w-1/2 rounded-full text-sm font-medium transition ${
              activeTab === "social" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Social Points
          </button>
        </div>

        {/* Daily Points */}
        {activeTab === "daily" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyPoints.map((entry) => (
              <div
                key={entry.day}
                className="w-full h-auto relative overflow-clip bg-[#212121]  border-white/10 rounded-[20px] px-6 py-4 flex flex-col justify-between items-center text-center"
              >
                <img
                  src={"/assets/blurs/point-blur.png"}
                  alt={"blur"}
                  className="object-contain absolute right-0 top-0 bottom-0 "
                />

                <span className="text-sm text-white/50 font-medium mb-2">Day {entry.day}</span>
                <span className="text-[30px] font-medium mb-4">+{entry.points}</span>

                {entry.status === "claimed" ? (
                  <button
                    className="w-full bg-[#1c1c1c] text-white rounded-lg py-2 text-sm font-semibold cursor-not-allowed"
                    disabled
                  >
                    Claimed
                  </button>
                ) : entry.status === "claim" ? (
                  <button
                    onClick={() => {}}
                    className="w-full bg-white hover:bg-[#D5B3FF] text-black rounded-lg py-2 text-sm"
                  >
                    Claim
                  </button>
                ) : (
                  <div className="w-full bg-[#1c1c1c] text-white rounded-lg py-2 text-sm font-semibold">
                    {entry.date}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Social Points */}
        {activeTab === "social" && (
          <div className="flex flex-col gap-4">
            {socialPoints.map((entry, i) => (
              <div
                key={i}
                className={`w-full flex justify-between items-center px-6 py-4 rounded-[20px] border border-white/10 ${
                  entry.status === "claimed" ? "bg-[#1C1C1C] text-white/40" : "bg-[#212121]"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">{entry.action}</span>
                  <span className=" font-medium text-sm">+{entry.points}</span>
                </div>

                <div className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-white rotate-320" />
                  {entry.status === "claimed" ? (
                    <button
                      className="bg-black text-white w-[100px] px-4 py-2 rounded-full text-sm font-semibold cursor-not-allowed"
                      disabled
                    >
                      Claimed
                    </button>
                  ) : (
                    <button className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black w-[100px] px-4 py-2 rounded-full text-sm font-semibold">
                      Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
