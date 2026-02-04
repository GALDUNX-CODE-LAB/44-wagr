"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getUserPortfolios, getPortfolioDetails } from "../../../lib/api";

interface Portfolio {
  _id: string;
  market?: {
    question?: string;
    result?: "YES" | "NO";
    isResolved: boolean;
  } | null;
  yesShares: number;
  noShares: number;
  avgYesPrice: number;
  avgNoPrice: number;
  createdAt: string;
}

export default function PortfolioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ["userPortfolios"],
    queryFn: async () => {
      const res = await getUserPortfolios();
      return res?.data || res;
    },
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const { data: portfolioDetails, isFetching } = useQuery({
    queryKey: ["portfolioDetails", expanded],
    queryFn: async () => {
      if (!expanded) return null;
      const res = await getPortfolioDetails(expanded);
      return res?.data?.summary || res?.summary;
    },
    enabled: !!expanded,
    refetchOnWindowFocus: false,
  });

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[#1C1C1C] border border-white/10 text-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 relative"
          >
            <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10">
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-5">Your Portfolios</h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoaderCircle size={24} className="animate-spin text-[#C8A2FF]" />
              </div>
            ) : portfolios.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">No portfolios found.</p>
            ) : (
              <div className="space-y-3">
                {portfolios.map((p: Portfolio) => {
                  const picked = p.yesShares > 0 ? "Yes" : "No";
                  const avgPrice = p.yesShares > 0 ? p.avgYesPrice : p.avgNoPrice;
                  const totalShares = p.yesShares + p.noShares;

                  return (
                    <div key={p._id} className="bg-[#212121] border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleExpand(p._id)}
                        className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-white/5 transition"
                      >
                        <div>
                          <h3 className="text-sm font-medium mb-1">{p.market?.question ?? "n/a"}</h3>
                          <p className="text-xs text-gray-400">
                            {totalShares?.toFixed?.(5) ?? "n/a"} shares • Avg ₦{avgPrice?.toFixed?.(5) ?? "n/a"}
                          </p>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${expanded === p._id ? "rotate-180 text-[#C8A2FF]" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {expanded === p._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4 pt-2 border-t border-white/10 text-sm"
                          >
                            {isFetching ? (
                              <div className="flex justify-center py-6">
                                <LoaderCircle size={20} className="animate-spin text-[#C8A2FF]" />
                              </div>
                            ) : portfolioDetails ? (
                              <div className="divide-y divide-white/10">
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">You Picked</span>
                                  <span
                                    className={`font-medium ${
                                      portfolioDetails.youPicked === "Yes" ? "text-[#C8A2FF]" : "text-rose-400"
                                    }`}
                                  >
                                    {portfolioDetails.youPicked ?? "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Average Price</span>
                                  <span>
                                    {portfolioDetails.avgPrice !== undefined && portfolioDetails.avgPrice !== null
                                      ? `$${portfolioDetails.avgPrice}`
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Shares</span>
                                  <span>
                                    {portfolioDetails.shares !== undefined &&
                                    portfolioDetails.shares !== null &&
                                    typeof portfolioDetails.shares === "number"
                                      ? portfolioDetails.shares.toFixed(7)
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Cost</span>
                                  <span>
                                    {portfolioDetails.cost !== undefined &&
                                    portfolioDetails.cost !== null &&
                                    typeof portfolioDetails.cost === "number"
                                      ? `$${portfolioDetails.cost.toFixed(7)}`
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Status</span>
                                  <span className="text-gray-300">{portfolioDetails.status ?? "n/a"}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Event Outcome</span>
                                  <span
                                    className={`font-medium ${
                                      portfolioDetails.eventOutcome === "Yes"
                                        ? "text-[#C8A2FF]"
                                        : portfolioDetails.eventOutcome === "No"
                                        ? "text-rose-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {portfolioDetails.eventOutcome ?? "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Payout</span>
                                  <span className="text-green-400">
                                    {portfolioDetails.payout !== undefined && portfolioDetails.payout !== null
                                      ? `₦${portfolioDetails.payout?.toLocaleString?.() ?? "0"}`
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Payout Date</span>
                                  <span>
                                    {portfolioDetails.payoutDate
                                      ? new Date(portfolioDetails.payoutDate).toLocaleString()
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-400">Trade ID</span>
                                  <Link
                                    href={`/portfolio/${p._id}`}
                                    className="text-[#C8A2FF] underline underline-offset-4 text-xs break-all"
                                  >
                                    {p._id ?? "n/a"}
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-400 py-4 text-center text-xs">No portfolio details found.</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
