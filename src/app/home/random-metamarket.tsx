"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMarkets } from "../../lib/api";
import type { Market } from "../../interfaces/interface";
import { MessageCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

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
      <h2 className="text-white font-semibold text-sm mb-2 lg:text-lg">Meta market</h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-[150px] bg-[#212121] rounded-[20px] animate-pulse" />
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
      <div className="flex">
        <div className="lg:min-w-10 lg:min-h-10 min-w-10 min-h-10 bg-white rounded-[10px] mt-2" />
      </div>
      <h2 className="text-sm lg:text-base mt-2 font-medium overflow-hidden text-ellipsis line-clamp-2">
        {market.question}
      </h2>
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
