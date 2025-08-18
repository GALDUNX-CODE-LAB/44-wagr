"use client"

import { useEffect, useState } from "react"
import { X, ArrowRight, Coins } from "lucide-react"
import { claimDailyStreak, fetchUserPoints } from "../lib/api" 

interface PointsModalProps {
  open: boolean
  onClose: () => void
}

interface PointEntry {
  day: number
  points: number
  status: "claim" | "claimed" | "date"
  date?: string
}

interface SocialEntry {
  action: string
  points: number
  status: "claim" | "claimed"
  link: string // Added link for navigation
  visited: boolean // Added to track if the link has been clicked
}

export default function PointsModal({ open, onClose }: PointsModalProps) {
  const [activeTab, setActiveTab] = useState<"daily" | "social">("daily")
  const [claiming, setClaiming] = useState(false)
  const [streakData, setStreakData] = useState<PointEntry[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [hasClaimedToday, setHasClaimedToday] = useState(false)

  // Initialize socialPoints as state to allow updating 'visited' status
  const [socialPoints, setSocialPoints] = useState<SocialEntry[]>([
    {
      action: "Follow us on Instagram",
      points: 300,
      status: "claim",
      link: "https://www.instagram.com/vercel",
      visited: false,
    },
    { action: "Join our Telegram", points: 300, status: "claim", link: "https://t.me/vercel", visited: false }, // Changed to claim and not visited
    { action: "Share on Twitter", points: 300, status: "claim", link: "https://twitter.com/vercel", visited: false },
  ])

  const initializeStreakData = (streakPoints: number, hasClaimedToday: boolean) => {
    const daysClaimed = Math.floor(streakPoints / 20)
    const result: PointEntry[] = []
    for (let i = 1; i <= 7; i++) {
      let status: PointEntry["status"] = "date"
      if (i <= daysClaimed) {
        status = "claimed"
      } else if (i === daysClaimed + 1) {
        status = hasClaimedToday ? "claimed" : "claim"
      }
      result.push({
        day: i,
        points: i === 8 ? 50 : i >= 6 ? 30 : i === 5 ? 25 : 20,
        status,
        date: status === "date" ? "Locked" : undefined,
      })
    }
    setStreakData(result)
  }

  const loadUserPoints = async () => {
    try {
      const res = await fetchUserPoints()
      if (res.success) {
        setUserPoints(res.totalPoints)
        const daysClaimed = Math.floor(res.breakdown.streakPoints / 20)
        const claimedToday = daysClaimed > 0 && res.breakdown.streakPoints % 20 === 0
        setHasClaimedToday(claimedToday)
        initializeStreakData(res.breakdown.streakPoints, claimedToday)
      }
    } catch (err) {
      console.error("Failed to load user points", err)
    }
  }

  useEffect(() => {
    if (open) loadUserPoints()
  }, [open])

  const handleDailyClaim = async () => {
    try {
      setClaiming(true)
      const res = await claimDailyStreak()
      if (res.success) {
        const newStreakPoints = userPoints + res.points // 20-point increments
        setUserPoints(newStreakPoints)
        setHasClaimedToday(true)
        initializeStreakData(newStreakPoints, true)
      }
    } catch (err) {
      console.error("Claim failed", err)
    } finally {
      setClaiming(false)
    }
  }

  // New handler for social arrow click
  const handleSocialArrowClick = (index: number) => {
    setSocialPoints((prevSocialPoints) =>
      prevSocialPoints.map((entry, i) => (i === index ? { ...entry, visited: true } : entry)),
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:px-4">
      <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[90vw] sm:max-w-[600px] lg:max-w-[800px] p-4 sm:p-6 border border-white/10 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold">Points System</h2>
          <button className="bg-[#C8A2FF]/10 text-[#C8A2FF] text-xs flex items-center gap-2 rounded-full px-3 sm:px-4 py-2">
            <Coins size={10} className="text-yellow-300" /> {userPoints} Points
          </button>
        </div>
        {/* Tabs */}
        <div className="w-full h-[36px] sm:h-[40px] bg-[#212121] border border-white/10 rounded-full flex mb-4 sm:mb-6 overflow-hidden">
          <button
            onClick={() => setActiveTab("daily")}
            className={`w-1/2 rounded-full text-xs sm:text-sm font-medium transition ${
              activeTab === "daily" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Daily Points
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`w-1/2 rounded-full text-xs sm:text-sm font-medium transition ${
              activeTab === "social" ? "bg-[#C8A2FF] text-black" : "text-white/40"
            }`}
          >
            Social Points
          </button>
        </div>
        {/* Daily Points */}
        {activeTab === "daily" && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {streakData.map((entry, index) => (
              <div
                key={index}
                className="w-full h-auto relative overflow-clip bg-[#212121] border-white/10 rounded-[12px] sm:rounded-[20px] px-3 sm:px-6 py-3 sm:py-4 flex flex-col justify-between items-center text-center"
              >
                {/* <img
                  src={"/placeholder.svg?height=100&width=100&query=abstract blur"}
                  alt={"blur"}
                  className="object-contain absolute right-0 top-0 bottom-0"
                /> */}
                <span className="text-xs sm:text-sm text-white/50 font-medium mb-1 sm:mb-2">Day {entry.day}</span>
                <span className="text-xl sm:text-[30px] font-medium mb-2 sm:mb-4">+{entry.points}</span>
                {entry.status === "claimed" ? (
                  <button
                    className="w-full bg-[#1c1c1c] text-white rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold cursor-not-allowed"
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
                    className={`w-full rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold ${
                      claiming ? "bg-[#1c1c1c] text-white cursor-not-allowed" : "bg-white hover:bg-[#D5B3FF] text-black"
                    }`}
                  >
                    {claiming ? "Claiming..." : "Claim"}
                  </button>
                ) : entry.status === "claim" ? (
                  <button
                    className="w-full bg-[#1c1c1c] text-white rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold cursor-not-allowed"
                    disabled
                  >
                    Not Available
                  </button>
                ) : (
                  <div className="w-full bg-[#1c1c1c] text-white rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold">
                    {entry.date || "Locked"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Social Points */}
        {activeTab === "social" && (
          <div className="flex flex-col gap-3 sm:gap-4">
            {socialPoints.map((entry, i) => (
              <div
                key={i}
                className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 sm:py-4 rounded-[12px] sm:rounded-[20px] border border-white/10 gap-3 sm:gap-0 ${
                  entry.status === "claimed" ? "bg-[#1C1C1C] text-white/40" : "bg-[#212121]"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">{entry.action}</span>
                  <span className="font-medium text-sm">+{entry.points}</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialArrowClick(i)}
                    className={`p-2 rounded-full ${entry.status === "claimed" ? "cursor-not-allowed" : "hover:bg-white/10"}`}
                    aria-label={`Go to ${entry.action}`}
                  >
                    <ArrowRight
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${entry.status === "claimed" ? "text-white/40" : "text-white"} rotate-320`}
                    />
                  </a>
                  {entry.status === "claimed" ? (
                    <button
                      className="bg-black text-white min-w-[80px] sm:w-[100px] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-not-allowed"
                      disabled
                    >
                      Claimed
                    </button>
                  ) : (
                    <button
                      className={`min-w-[80px] sm:w-[100px] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold ${
                        !entry.visited
                          ? "bg-black text-white/40 cursor-not-allowed"
                          : "bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black"
                      }`}
                      disabled={!entry.visited}
                    >
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
  )
}
