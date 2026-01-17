"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMarkets } from "../../lib/api";
import type { Market } from "../../interfaces/interface";
import { MessageCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaChartLine } from "react-icons/fa";

const ROTATE_MS = 10000;
const FETCH_MS = 30000;

function useResponsiveCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => setCount(lg.matches ? 4 : md.matches ? 3 : 2);
    update();
    md.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      md.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);
  return count;
}

export default function RandomMetaMarket() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [visible, setVisible] = useState<Market[]>([]);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const marketsRef = useRef<Market[]>([]);
  const rotateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useResponsiveCount();
  const countRef = useRef(count);

  const pickRandom = (data: Market[], n: number) => {
    if (!data?.length) return [];
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(n, data.length));
  };

  const loadMarkets = async () => {
    try {
      const res = await fetchMarkets();
      const list = Array.isArray(res) ? res : res?.markets || [];
      marketsRef.current = list;
      setMarkets(list);
      if (visible.length === 0) {
        const first = pickRandom(list, countRef.current);
        setVisible(first);
        setKey((k) => k + 1);
      }
      setLoading(false);
    } catch {}
  };

  const scheduleRotate = () => {
    if (rotateTimeoutRef.current) clearTimeout(rotateTimeoutRef.current);
    rotateTimeoutRef.current = setTimeout(() => {
      const next = pickRandom(marketsRef.current, countRef.current);
      if (next.length) {
        setVisible(next);
        setKey((k) => k + 1);
      }
      scheduleRotate();
    }, ROTATE_MS);
  };

  const scheduleFetch = () => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(async () => {
      await loadMarkets();
      scheduleFetch();
    }, FETCH_MS);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadMarkets();
      if (!mounted) return;
      scheduleRotate();
      scheduleFetch();
    })();
    return () => {
      mounted = false;
      if (rotateTimeoutRef.current) clearTimeout(rotateTimeoutRef.current);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    countRef.current = count;
    const fresh = pickRandom(marketsRef.current, count);
    if (fresh.length) {
      setVisible(fresh);
      setKey((k) => k + 1);
    }
  }, [count]);

  return (
    <div className="w-full lg:max-w-8xl mx-auto text-white my-8">
      <h2 className="text-white font-semibold text-sm mb-2 lg:text-lg flex gap-2 items-center">
        <FaChartLine className="text-primary" />
        Meta market
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="cursor-pointer bg-[#212121] rounded-[20px] border border-white/6 p-4 flex flex-col gap-3"
            >
              {/* Image placeholder */}
              <div className="flex gap-3 items-center lg:items-start">
                <div className="lg:w-10 lg:h-10 w-10 h-10 bg-white/10 rounded-[10px] mt-2 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2 mt-2">
                  <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
                </div>
              </div>
              {/* Summary placeholder */}
              <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
              {/* Stats placeholder */}
              <div className="flex justify-between items-center mt-2">
                <div className="h-4 bg-white/10 rounded animate-pulse w-20" />
                <div className="h-4 bg-white/10 rounded animate-pulse w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {visible.map((market) => (
              <MarketCard key={market._id} market={market} router={router} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function MarketCard({ market, router }: { market: Market; router: any }) {
  return (
    <div
      onClick={() => router.push(`/meta-market/${market._id}`)}
      className="cursor-pointer bg-[#212121] rounded-[20px] border border-white/6 p-4 flex flex-col gap-3 transition hover:border-[#C8A2FF]/30"
    >
      <div className="flex gap-3 items-center lg:items-start">
        {market.image ? (
          <img
            src={market.image}
            alt={market.question}
            className="lg:w-10 lg:h-10 w-10 h-10 rounded-[10px] mt-2 object-cover flex-shrink-0"
          />
        ) : (
          <div className="lg:w-10 lg:h-10 w-10 h-10 bg-white/10 rounded-[10px] mt-2 flex-shrink-0" />
        )}
        <h2 className="text-sm lg:text-base mt-2 font-medium overflow-hidden text-ellipsis line-clamp-2 flex-1">
          {market.question}
        </h2>
      </div>
      {market.summary && (
        <p className="text-xs lg:text-sm text-white/70 line-clamp-1 overflow-hidden">
          {market.summary}
        </p>
      )}
      <MarketStats market={market} />
    </div>
  );
}

function MarketStats({ market }: { market: Market }) {
  return (
    <div className="flex justify-between text-xs lg:text-sm font-medium mt-2">
      <div className="flex items-center gap-2">
        <span className="text-white/65">Vol: {market.b}</span>
        <TrendIndicator qYes={market.qYes} qNo={market.qNo} />
      </div>
      <div className="flex items-center gap-1 text-white/70">
        <MessageCircle className="lg:w-4 lg:h-4 w-3 h-3" />
        <span>{market.commentCount}</span>
      </div>
    </div>
  );
}

function TrendIndicator({ qYes, qNo }: { qYes: number; qNo: number }) {
  const isUp = qYes > qNo;
  return (
    <div className={`flex items-center gap-1 ${isUp ? "text-green-500" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="lg:w-4 lg:h-4 w-3 h-3" /> : <TrendingDown className="lg:w-4 lg:h-4 w-3 h-3" />}
      <span>{Math.abs(qYes - qNo).toFixed(2)}</span>
    </div>
  );
}
