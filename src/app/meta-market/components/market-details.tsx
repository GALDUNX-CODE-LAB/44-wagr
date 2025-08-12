"use client"

import { ChevronDown, ChevronUp, Send, Heart, Award } from "lucide-react"
import { useState, useEffect } from "react"
import type { Market } from "../../../interfaces/interface"
import LivePlays from "../../../components/live-plays"
import { placeMarketBet } from "../../../lib/api"
import {
  fetchComments,
  addMetaMarketComment,
  likeComment, // Added: Import likeComment
} from "../../../lib/api" // Assuming these are correctly imported

interface Comment {
  _id: string
  market: string
  user: {
    _id: string
    username?: string
    avatar?: string
  }
  comment: string
  createdAt: string
  likes?: number
}

interface Pagination {
  total: number
  page: number
  pages: number
}

interface MarketDetailsProps {
  market: Market
  commentCount?: number
}

export default function MarketDetails({ market }: MarketDetailsProps) {
  // State management
  const [betAmount, setBetAmount] = useState(10)
  const [selectedOption, setSelectedOption] = useState<"Yes" | "No" | "">("")
  const [commentSort, setCommentSort] = useState<"Newest" | "Oldest">("Newest")
  const [commentInput, setCommentInput] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pages: 1,
  })
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null) // Added: State to track which comment is being liked

  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [betError, setBetError] = useState<Error | null>(null)

  // Market data with safe defaults
  const marketData = {
    question: market.question || "Market Prediction",
    b: market.b ?? 0,
    qYes: market.qYes ?? 0,
    qNo: market.qNo ?? 0,
    isResolved: market.isResolved || false,
    result: market.result || "PENDING",
    createdAt: market.createdAt || new Date().toISOString(),
    plays: market.plays || [],
  }
  // Calculate probabilities
  const totalShares = marketData.qYes + marketData.qNo
  const yesProbability = totalShares > 0 ? (marketData.qYes / totalShares) * 100 : 50
  const noProbability = 100 - yesProbability
  // Generate sample data points for the graph (you can replace this with real historical data)
  const generateGraphData = () => {
    const points = 20
    const yesData = []
    const noData = []
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * 100
      // Generate some realistic fluctuation around the current probabilities
      const yesVariation = Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 15
      const noVariation = Math.cos(i * 0.4) * 8 + (Math.random() - 0.5) * 12
      const yesY = Math.max(10, Math.min(90, yesProbability + yesVariation))
      const noY = Math.max(10, Math.min(90, noProbability + noVariation))
      yesData.push({ x, y: 100 - yesY }) // Invert Y for SVG coordinates
      noData.push({ x, y: 100 - noY })
    }
    return { yesData, noData }
  }
  const { yesData, noData } = generateGraphData()
  // Convert data points to SVG path
  const createPath = (data: { x: number; y: number }[]) => {
    return data.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L"
      return `${path} ${command} ${point.x} ${point.y}`
    }, "")
  }
  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        console.log("📥 Loading comments...")
        console.log("➡️ Market ID:", market?._id)
        console.log("➡️ Current page:", pagination.page)
        if (!market?._id) {
          console.warn("⛔ Skipping comment fetch: market._id is undefined")
          return
        }
        setLoadingComments(true)
        setError(null)
        const response = await fetchComments(market._id, pagination.page)
        console.log("✅ Comment response:", response)
        if (response?.success && response.data) {
          setComments(response.data)
          setPagination(response.pagination)
          console.log("🗂️ Loaded comments:", response.data.length)
          console.log("🔢 Updated pagination:", response.pagination)
        } else {
          throw new Error(response?.message || "Failed to load comments")
        }
      } catch (err) {
        console.error("❌ Failed to load comments:", err)
        setError(err instanceof Error ? err.message : "Failed to load comments")
        setComments([])
      } finally {
        setLoadingComments(false)
      }
    }
    loadComments()
  }, [market?._id, pagination.page])
  // Handlers
  const handleAmountChange = (value: number) => {
    setBetAmount(Math.max(1, Math.min(10000, value)))
  }
 
  const handlePlaceBet = async () => {
  if (!selectedOption || marketData.isResolved) return
  
  setIsPlacingBet(true)
  setError(null)
  setBetError(null)
  
  try {
    await placeMarketBet(
      market._id,
      selectedOption.toUpperCase() as "YES" | "NO",
      betAmount
    )
    setSelectedOption("")
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Failed to place bet")
    setBetError(error)
    setError(error.message)
  } finally {
    setIsPlacingBet(false)
  }
}
 

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || isSubmittingComment) return
    setIsSubmittingComment(true)
    setError(null)
    try {
      const response = await addMetaMarketComment(market._id, commentInput.trim())
      if (response?.success && response.data) {
        setComments((prev) => [
          {
            ...response.data,
            user: { _id: response.data.user }, // Ensure user is an object with _id
            likes: 0, // Initialize likes for new comments
          },
          ...prev,
        ])
        setCommentInput("")
      } else {
        throw new Error(response?.message || "Failed to add comment")
      }
    } catch (err) {
      console.error("Failed to submit comment:", err)
      setError(err instanceof Error ? err.message : "Failed to submit comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Added: Handler for liking a comment
  const handleLikeComment = async (commentId: string) => {
    if (likingCommentId === commentId) return // Prevent multiple clicks on the same comment
    setLikingCommentId(commentId)
    try {
      const response = await likeComment(commentId)
      if (response?.success) {
        setComments((prevComments) =>
          prevComments.map((c) => (c._id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c)),
        )
      } else {
        console.error("Failed to like comment:", response?.message)
        // Optionally, display an error message to the user
      }
    } catch (err) {
      console.error("Error liking comment:", err)
    } finally {
      setLikingCommentId(null)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }
  // Calculate potential payout
  const calculatePayout = (option: "Yes" | "No") => {
    if (option === "Yes") {
      return marketData.qYes > 0 ? (betAmount / (marketData.qYes / totalShares)).toFixed(2) : betAmount.toFixed(2)
    } else {
      return marketData.qNo > 0 ? (betAmount / (marketData.qNo / totalShares)).toFixed(2) : betAmount.toFixed(2)
    }
  }
  // Format date
  const marketDate = new Date(marketData.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  return (
    <div className="p-4 sm:p-6 text-white min-h-screen flex flex-col gap-10">
      {/* Top Section */}
      <div className="bg-[#212121] rounded-xl p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-medium flex items-center gap-3">
            <div className="w-[60px] h-[60px] bg-white rounded-[10px]" />
            {marketData.question}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/20 text-sm">
            <p>{marketData.b.toLocaleString()} vol</p>
            <p>{marketDate}</p>
            {marketData.isResolved && <p className="text-green-500">Resolved: {marketData.result}</p>}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center text-xs text-white/65 gap-2">
              <span className="w-3 h-3 bg-[#C8A2FF] rounded-full" /> YES {yesProbability.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-white/65 gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" /> NO {noProbability.toFixed(1)}%
            </div>
          </div>
          {/* Responsive Graph */}
          <div className="relative mt-4 h-[212px] w-full max-w-[95%]">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[90, 70, 50, 30, 10].map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between border-t border-dotted border-white/10 text-xs text-white/65"
                >
                  <span></span>
                  <span className="-mr-2 sm:-mr-8 -mt-2">{100 - p}%</span>
                </div>
              ))}
            </div>
            {/* SVG Graph */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              {/* YES line */}
              <path
                d={createPath(yesData)}
                stroke="#C8A2FF"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              {/* NO line */}
              <path
                d={createPath(noData)}
                stroke="#ef4444"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
        {/* Trade Panel */}
        <div className="w-full lg:max-w-[347px] bg-[#1C1C1C] rounded-xl border border-white/10 p-4 sm:p-6">
          <h2 className="text-base font-medium mb-2 border-b border-white/6 pb-2">
            {marketData.isResolved ? "Market Resolved" : "Trade"}
          </h2>
          {marketData.isResolved ? (
            <div className="text-center py-4">
              <p className="text-white/60 mb-2">This market has been resolved</p>
              <p className="text-xl font-semibold text-green-500">{marketData.result}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                {(["Yes", "No"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    disabled={isPlacingBet}
                    className={`flex-1 py-2 rounded-[10px] text-sm font-medium text-center transition-colors ${
                      selectedOption === opt
                        ? opt === "Yes"
                          ? "bg-[#C8A2FF] text-black"
                          : "bg-red-500 text-black"
                        : "bg-[#212121] text-white border border-white/10 hover:border-white/20"
                    } ${isPlacingBet ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {opt} {opt === "Yes" ? yesProbability.toFixed(1) : noProbability.toFixed(1)}%
                  </button>
                ))}
              </div>
              {/* Bet Amount */}
              <div className="mb-4">
                <p className="text-sm text-white/60 mb-1">Bet Amount</p>
                <div className="flex bg-[#212121] rounded-lg px-3 py-2 items-center gap-2">
                  <span className="text-white text-lg font-semibold">$</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    disabled={isPlacingBet}
                    className="bg-transparent text-white text-lg font-semibold text-left w-full focus:outline-none disabled:opacity-50"
                    min={1}
                    max={10000}
                  />
                  <div className="flex flex-row gap-1 ml-2">
                    <button
                      onClick={() => handleAmountChange(betAmount + 1)}
                      disabled={isPlacingBet}
                      className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4 text-white" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleAmountChange(betAmount - 1)}
                      disabled={isPlacingBet}
                      className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4 text-white" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Potential Payout */}
              {selectedOption && (
                <div className="mb-4 p-3 bg-[#212121] rounded-lg">
                  <p className="text-sm text-white/60">Potential Payout</p>
                  <p className="text-lg font-semibold text-white">${calculatePayout(selectedOption)}</p>
                  <p className="text-xs text-white/40">
                    Profit: ${(Number.parseFloat(calculatePayout(selectedOption)) - betAmount).toFixed(2)}
                  </p>
                </div>
              )}
              {/* Error Messages */}
              {(error || betError) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">
                    {error || (betError instanceof Error ? betError.message : "Failed to place bet")}
                  </p>
                </div>
              )}
              {/* Trade Button */}
              <button
                onClick={handlePlaceBet}
                disabled={isPlacingBet || !selectedOption}
                className={`w-full font-semibold mt-5 rounded-[10px] py-3 transition-colors ${
                  isPlacingBet
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black"
                } ${!selectedOption ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isPlacingBet ? "Placing Bet..." : "Trade"}
              </button>
            </>
          )}
        </div>
      </div>
      {/* Comments + Plays Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Comments */}
        <div className="w-full lg:w-[754px] bg-[#212121] rounded-[20px] border border-white/10 p-4 sm:p-6 flex flex-col">
          <div className="flex items-start gap-2 mb-4">
            <Award className="text-[#c8a2ff]" />
            <h2 className="text-xl font-bold text-white">Comments</h2>
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitComment()
                }
              }}
              disabled={isSubmittingComment}
              className="w-full h-[50px] pl-4 pr-12 bg-[#212121] border border-white/6 rounded-[15px] text-sm text-white focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentInput.trim() || isSubmittingComment}
              className={`absolute right-1 top-1/2 -translate-y-1/2 p-4 rounded-[10px] transition-colors ${
                !commentInput.trim() || isSubmittingComment
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#C8A2FF] hover:bg-[#D5B3FF]"
              }`}
            >
              <Send className="text-black w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <select
              className="bg-[#212121] text-white text-sm px-4 py-2 rounded-full border border-white/6"
              value={commentSort}
              onChange={(e) => setCommentSort(e.target.value as "Newest" | "Oldest")}
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
            <span className="text-sm text-white/60">
              {pagination.total} comment{pagination.total !== 1 ? "s" : ""}
            </span>
          </div>
          {/* Comment List */}
          <div className="flex flex-col gap-4 overflow-auto">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A2FF]" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : Array.isArray(comments) && comments.length === 0 ? (
              <p className="text-white/40 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              [...comments]
                .sort((a, b) =>
                  commentSort === "Newest"
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                )
                .map((comment) => (
                  <div key={comment._id} className="flex items-start gap-4 rounded-[15px] p-3 hover:bg-white/5">
                    <div className="w-10 h-10 bg-white rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-base text-white">
                          {comment.user?.username || `User ${comment.user._id.slice(0, 4)}`}
                        </p>
                        <span className="text-xs text-white/65">
                          •{" "}
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-white/65 text-sm mt-1">{comment.comment}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          disabled={likingCommentId === comment._id}
                          className="flex items-center gap-1 text-white/40 hover:text-[#C8A2FF] disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Like this comment. Current likes: ${comment.likes || 0}`}
                        >
                          <Heart size={14} />
                          <span className="text-xs">{comment.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${pagination.page === page ? "bg-[#C8A2FF] text-black" : "bg-[#333]"}`}
                    >
                      {page}
                    </button>
                  )
                })}
                {pagination.pages > 5 && <span className="px-3 py-1 text-white/60">...</span>}
              </div>
            )}
          </div>
        </div>
        {/* Live Plays */}
        <LivePlays plays={marketData.plays} />
      </div>
    </div>
  )
}
