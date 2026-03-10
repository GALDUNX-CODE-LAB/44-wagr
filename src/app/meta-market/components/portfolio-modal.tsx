"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, LoaderCircle, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { getUserPortfolios, getPortfolioDetails } from "../../../lib/api";

const CHART_COLORS = ["#C8A2FF", "#A78BFA", "#8B5CF6", "#F472B6", "#34D399", "#FBBF24", "#60A5FA"];

interface Portfolio {
  _id: string;
  market?: {
    _id?: string;
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

const SHARES_EPS = 0.0001; // hide positions with effectively zero shares

function hasMeaningfulShares(p: Portfolio): boolean {
  const total = (p.yesShares ?? 0) + (p.noShares ?? 0);
  return total >= SHARES_EPS;
}

function totalPortfolioValue(portfolios: Portfolio[]): number {
  return portfolios.reduce((sum, p) => {
    const cost = p.yesShares * (p.avgYesPrice ?? 0) + p.noShares * (p.avgNoPrice ?? 0);
    return sum + cost;
  }, 0);
}

function portfolioCost(p: Portfolio): number {
  return p.yesShares * (p.avgYesPrice ?? 0) + p.noShares * (p.avgNoPrice ?? 0);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export default function PortfolioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const isMobile = useIsMobile();

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

  const filteredPortfolios = useMemo(() => (portfolios as Portfolio[]).filter(hasMeaningfulShares), [portfolios]);

  const ringData = useMemo(() => {
    const total = totalPortfolioValue(filteredPortfolios);
    if (total <= 0) return [];
    return filteredPortfolios.map((p, i) => ({
      name:
        (p.market?.question ?? "Market").slice(0, 20) +
        (p.market?.question && p.market.question.length > 20 ? "…" : ""),
      value: portfolioCost(p),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [filteredPortfolios]);

  const trendBarData = useMemo(
    () =>
      filteredPortfolios.map((p, i) => ({
        name:
          (p.market?.question ?? "Market").slice(0, 12) +
          (p.market?.question && p.market.question.length > 12 ? "…" : ""),
        value: portfolioCost(p),
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [filteredPortfolios],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex ${isMobile ? "items-end px-0" : "items-center px-4"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: isMobile ? "100%" : 60, opacity: isMobile ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isMobile ? "100%" : 60, opacity: isMobile ? 1 : 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-[#1C1C1C] border border-white/10 text-white w-full overflow-y-auto relative
              ${isMobile ? "max-h-[80vh] rounded-t-2xl p-4 border-b-0" : "max-w-2xl max-h-[85vh] rounded-2xl p-6 mx-auto"}`}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-5 bg-gradient-to-r from-[#C8A2FF] to-[#F472B6] bg-clip-text text-transparent">
              Your Portfolios
            </h2>

            {!isLoading && filteredPortfolios.length > 0 && (
              <>
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-[#2a1f3d] to-[#212121] border border-[#C8A2FF]/20">
                  <p className="text-xs text-[#C8A2FF]/80 uppercase tracking-wider mb-1">Total value across markets</p>
                  <p className="text-2xl font-bold text-white">
                    $
                    {totalPortfolioValue(filteredPortfolios).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Cost basis (avg entry price × shares)</p>
                </div>

                {ringData.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3 min-w-0">
                    <div className="rounded-lg sm:rounded-xl bg-[#212121] border border-white/10 p-2 sm:p-4 min-w-0">
                      <p className="text-[10px] sm:text-xs text-amber-400/90 uppercase tracking-wider mb-0.5 sm:mb-2">
                        Allocation
                      </p>
                      <div className="h-[88px] sm:h-[140px] lg:h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={ringData}
                              cx="50%"
                              cy="50%"
                              innerRadius="35%"
                              outerRadius="48%"
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {ringData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} stroke="#1C1C1C" strokeWidth={1} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
                              contentStyle={{
                                background: "#212121",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                              labelStyle={{ color: "#C8A2FF" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="rounded-lg sm:rounded-xl bg-[#212121] border border-white/10 p-2 sm:p-4 min-w-0">
                      <p className="text-[10px] sm:text-xs text-emerald-400/90 uppercase tracking-wider mb-0.5 sm:mb-2">
                        Value by market
                      </p>
                      <div className="h-[88px] sm:h-[140px] lg:h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={trendBarData}
                            layout="vertical"
                            margin={{ top: 2, right: 4, left: 0, bottom: 2 }}
                          >
                            <XAxis
                              type="number"
                              tick={{ fill: "#9ca3af", fontSize: 8 }}
                              tickFormatter={(v) => `$${v}`}
                            />
                            <YAxis type="category" dataKey="name" width={42} tick={{ fill: "#9ca3af", fontSize: 8 }} />
                            <Tooltip
                              formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
                              contentStyle={{
                                background: "#212121",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {trendBarData.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoaderCircle size={24} className="animate-spin text-[#C8A2FF]" />
              </div>
            ) : filteredPortfolios.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">No portfolios with shares found.</p>
            ) : (
              <div className="space-y-3">
                {filteredPortfolios.map((p: Portfolio) => {
                  const picked = p.yesShares > 0 ? "Yes" : "No";
                  const avgPrice = p.yesShares > 0 ? p.avgYesPrice : p.avgNoPrice;
                  const totalShares = p.yesShares + p.noShares;
                  const yesPct = totalShares > 0 ? (p.yesShares / totalShares) * 100 : 0;
                  const noPct = totalShares > 0 ? (p.noShares / totalShares) * 100 : 0;
                  const marketId =
                    p.market && typeof p.market === "object" && "_id" in p.market
                      ? (p.market as { _id: string })._id
                      : null;
                  const cost = portfolioCost(p);

                  return (
                    <div
                      key={p._id}
                      className="rounded-xl overflow-hidden border border-white/10 bg-[#212121] transition hover:border-[#C8A2FF]/30"
                      style={{
                        borderLeftWidth: "3px",
                        borderLeftColor: p.yesShares > p.noShares ? "#C8A2FF" : "#F472B6",
                      }}
                    >
                      <div className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-white/5 transition">
                        <div className="flex-1 min-w-0">
                          {marketId ? (
                            <Link
                              href={`/meta-market/${marketId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="group flex items-center gap-1.5 mb-1"
                            >
                              <h3 className="text-sm font-medium group-hover:text-[#C8A2FF] transition truncate pr-1">
                                {p.market?.question ?? "n/a"}
                              </h3>
                              <ExternalLink
                                size={12}
                                className="flex-shrink-0 text-gray-400 group-hover:text-[#C8A2FF]"
                              />
                            </Link>
                          ) : (
                            <h3 className="text-sm font-medium mb-1">{p.market?.question ?? "n/a"}</h3>
                          )}
                          <p className="text-xs text-gray-400 mb-1.5">
                            {totalShares >= 0.01 ? totalShares.toFixed(2) : totalShares.toFixed(4)} shares • Avg $
                            {(avgPrice ?? 0).toFixed(4)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#C8A2FF] font-medium">YES {yesPct.toFixed(0)}%</span>
                            <div className="flex-1 h-1.5 max-w-[80px] rounded-full bg-white/10 overflow-hidden flex">
                              <div className="h-full bg-[#C8A2FF]" style={{ width: `${yesPct}%` }} />
                              <div className="h-full bg-[#F472B6]" style={{ width: `${noPct}%` }} />
                            </div>
                            <span className="text-[10px] text-[#F472B6] font-medium">NO {noPct.toFixed(0)}%</span>
                          </div>
                          <p className="text-[11px] text-emerald-400/90 mt-1">${cost.toFixed(2)} value</p>
                        </div>
                        <button
                          onClick={() => toggleExpand(p._id)}
                          className="p-1 rounded hover:bg-white/10 flex-shrink-0"
                          aria-label="Expand details"
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${expanded === p._id ? "rotate-180 text-[#C8A2FF]" : ""}`}
                          />
                        </button>
                      </div>

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
                                  <span className="text-amber-400/80">You Picked</span>
                                  <span
                                    className={`font-medium ${
                                      portfolioDetails.youPicked === "Yes" ? "text-[#C8A2FF]" : "text-rose-400"
                                    }`}
                                  >
                                    {portfolioDetails.youPicked ?? "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Average Price</span>
                                  <span className="text-white">
                                    {portfolioDetails.avgPrice !== undefined && portfolioDetails.avgPrice !== null
                                      ? `$${portfolioDetails.avgPrice}`
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Shares</span>
                                  <span className="text-white">
                                    {portfolioDetails.shares !== undefined &&
                                    portfolioDetails.shares !== null &&
                                    typeof portfolioDetails.shares === "number" &&
                                    portfolioDetails.shares >= SHARES_EPS
                                      ? portfolioDetails.shares >= 0.01
                                        ? portfolioDetails.shares.toFixed(2)
                                        : portfolioDetails.shares.toFixed(4)
                                      : "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Cost</span>
                                  <span className="text-emerald-400">
                                    {portfolioDetails.cost !== undefined &&
                                    portfolioDetails.cost !== null &&
                                    typeof portfolioDetails.cost === "number"
                                      ? `$${portfolioDetails.cost.toFixed(2)}`
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Status</span>
                                  <span
                                    className={
                                      portfolioDetails.status === "Active"
                                        ? "text-emerald-400"
                                        : portfolioDetails.status === "Completed"
                                          ? "text-[#C8A2FF]"
                                          : "text-gray-300"
                                    }
                                  >
                                    {portfolioDetails.status ?? "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Event Outcome</span>
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
                                  <span className="text-amber-400/80">Payout</span>
                                  <span className="text-emerald-400 font-medium">
                                    {portfolioDetails.payout !== undefined && portfolioDetails.payout !== null
                                      ? `₦${portfolioDetails.payout?.toLocaleString?.() ?? "0"}`
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Payout Date</span>
                                  <span className="text-gray-300">
                                    {portfolioDetails.payoutDate
                                      ? new Date(portfolioDetails.payoutDate).toLocaleString()
                                      : "n/a"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-amber-400/80">Trade ID</span>
                                  <Link
                                    href={`/portfolio/${p._id}`}
                                    className="text-[#C8A2FF] underline underline-offset-4 text-xs break-all hover:text-[#A78BFA]"
                                  >
                                    {p._id ?? "n/a"}
                                  </Link>
                                </div>
                                {marketId && (
                                  <div className="pt-3">
                                    <Link
                                      href={`/meta-market/${marketId}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1.5 text-sm text-[#C8A2FF] hover:underline"
                                    >
                                      View market dashboard
                                      <ExternalLink size={14} />
                                    </Link>
                                  </div>
                                )}
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
