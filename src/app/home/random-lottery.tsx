"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchLotteries } from "../../lib/api";
import { useRouter } from "next/navigation";
import { RiNftLine } from "react-icons/ri";
import Image from "next/image";
import { Users } from "lucide-react";

const ROTATE_MS = 10000;
const FETCH_MS = 30000;

interface Lottery {
  _id: string;
  name: string;
  imgUrl: string;
  ticketPrice: number;
  totalBets: number;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

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

export default function RandomLottery() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [visible, setVisible] = useState<Lottery[]>([]);
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const lotteriesRef = useRef<Lottery[]>([]);
  const rotateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useResponsiveCount();
  const countRef = useRef(count);

  const pickRandom = (data: Lottery[], n: number) => {
    if (!data?.length) return [];
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(n, data.length));
  };

  const loadLotteries = async () => {
    try {
      const res = await fetchLotteries();
      const list = Array.isArray(res?.lotteries) ? res.lotteries : [];
      lotteriesRef.current = list;
      setLotteries(list);
      if (visible.length === 0) {
        const first = pickRandom(list, countRef.current);
        setVisible(first);
        setKey((k) => k + 1);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const scheduleRotate = () => {
    if (rotateTimeoutRef.current) clearTimeout(rotateTimeoutRef.current);
    rotateTimeoutRef.current = setTimeout(() => {
      const next = pickRandom(lotteriesRef.current, countRef.current);
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
      await loadLotteries();
      scheduleFetch();
    }, FETCH_MS);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadLotteries();
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
    const fresh = pickRandom(lotteriesRef.current, count);
    if (fresh.length) {
      setVisible(fresh);
      setKey((k) => k + 1);
    }
  }, [count]);

  return (
    <div className="w-full lg:max-w-8xl mx-auto text-white my-4">
      <h2 className="text-white font-semibold text-sm mb-2 lg:text-lg flex gap-2 items-center">
        <RiNftLine className="text-primary" />
        NFT Lottery
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-[150px] bg-[#212121] rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-8 text-white/60 text-sm">
          No lotteries available at the moment
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
            {visible.map((lottery) => (
              <LotteryCard key={lottery._id} lottery={lottery} router={router} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function LotteryCard({ lottery, router }: { lottery: Lottery; router: any }) {
  return (
    <div
      onClick={() => router.push(`/nft-lottery/${lottery._id}`)}
      className="cursor-pointer bg-[#212121] rounded-[20px] border border-white/6 p-4 flex flex-col gap-3 transition hover:border-[#C8A2FF]/30 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8A2FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-center justify-between">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10">
          <Image
            src={lottery.imgUrl || "/assets/user.png"}
            fill
            className="object-cover"
            alt={lottery.name}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/user.png";
            }}
          />
        </div>
        {!lottery.isCompleted && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>

      <div className="relative flex-grow">
        <h2 className="text-sm lg:text-base font-medium text-white/90 line-clamp-2 mb-2">
          {lottery.name}
        </h2>
      </div>

      <div className="relative flex justify-between items-center text-xs lg:text-sm">
        <div className="flex flex-col">
          <span className="text-white/50 text-[10px]">Ticket Price</span>
          <span className="text-white font-semibold">${lottery.ticketPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/70">
          <Users className="w-4 h-4" />
          <span className="font-medium">{lottery.totalBets}</span>
        </div>
      </div>
    </div>
  );
}
