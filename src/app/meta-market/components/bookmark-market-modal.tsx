"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, LoaderCircle, Bookmark } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMarketsByIds } from "../../../lib/api";

interface Market {
  _id: string;
  question: string;
  summary?: string;
  b: number;
  qYes: number;
  qNo: number;
  isResolved: boolean;
  result?: "YES" | "NO";
  commentCount: number;
  createdAt: string;
}

export default function BookmarkMarketsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const stored = JSON.parse(localStorage.getItem("bookmarkedMarkets") || "[]");
    setBookmarks(stored);
  }, [open]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["bookmarkedMarkets", bookmarks],
    queryFn: async () => {
      if (!bookmarks.length) return [];
      const res = await getMarketsByIds(bookmarks);
      console.log(res);
      return res.data || res.markets || [];
    },
    enabled: open && bookmarks.length > 0,
    refetchOnWindowFocus: false,
  });

  const toggleBookmark = (id: string) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem("bookmarkedMarkets", JSON.stringify(updated));
    refetch();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-3"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[#1C1C1C] text-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto border border-white/10 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10">
              <X size={18} />
            </button>

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-semibold">Bookmarked Markets</h2>
              {isFetching && <LoaderCircle size={16} className="animate-spin text-[#C8A2FF]" />}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoaderCircle size={24} className="animate-spin text-[#C8A2FF]" />
              </div>
            ) : !data || data.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-xs">No bookmarked markets yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((m: Market) => {
                  const totalShares = m.qYes + m.qNo;
                  const yesProb = totalShares > 0 ? (m.qYes / totalShares) * 100 : 50;
                  const noProb = 100 - yesProb;

                  return (
                    <motion.div
                      key={m._id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-[#212121] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-[#C8A2FF]/40 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/meta-market/${m._id}`} className="text-xs font-medium hover:text-[#C8A2FF]">
                          {m.question}
                        </Link>
                        <button onClick={() => toggleBookmark(m._id)} className="p-1 rounded-md hover:bg-white/10">
                          <Bookmark
                            size={16}
                            className={bookmarks.includes(m._id) ? "text-[#C8A2FF] fill-[#C8A2FF]" : "text-white/40"}
                          />
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-400 mb-3 line-clamp-2">{m.summary}</p>

                      <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                        <span>{m.commentCount} comments</span>
                        <span>{m.b.toLocaleString()} vol</span>
                      </div>

                      <div className="flex justify-between text-[10px]">
                        <span className="flex items-center gap-2 text-[#C8A2FF] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#C8A2FF]" /> YES {yesProb.toFixed(1)}%
                        </span>
                        <span className="flex items-center gap-2 text-rose-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> NO {noProb.toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
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
