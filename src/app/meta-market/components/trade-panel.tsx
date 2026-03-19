"use client";
import { useState } from "react";
import { Market } from "../../../interfaces/interface";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { executeMarketTrade, fetchMarketPrices, fetchUserPorfolio } from "../../../lib/api";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";
import { useUser } from "../../../hooks/useUserData";
import { BiLoaderAlt } from "react-icons/bi";
import { toast } from "sonner";

interface TradePanelProps {
  market: Market;
}
function parseNumInput(s: string): number {
  if (s === "" || s === ".") return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function TradePanel({ market }: TradePanelProps) {
  const [tab, setTab] = useState<"BUY" | "SELL">("BUY");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [inputMode, setInputMode] = useState<"USDT" | "SHARES">("USDT");
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = useIsLoggedIn();
  const { balance } = useUser();

  const { data: prices } = useQuery({
    queryKey: ["market", market._id],
    queryFn: () => fetchMarketPrices(market._id),
  });

  const { data: portfolio } = useQuery({
    queryKey: ["porfolio", market._id],
    queryFn: () => fetchUserPorfolio(market._id),
    enabled: isLoggedIn,
  });

  const queryclient = useQueryClient();

  const rawNum = parseNumInput(inputValue);
  const amount =
    !prices ? 0 : inputMode === "USDT" ? rawNum : rawNum * (side === "YES" ? prices.yesPrice : prices.noPrice);
  const shares =
    !prices ? 0 : inputMode === "USDT" ? rawNum / (side === "YES" ? prices.yesPrice : prices.noPrice) : rawNum;

  const handleInputChange = (val: string) => {
    if (val === "" || /^\d*\.?\d*$/.test(val)) setInputValue(val);
  };

  const handleTrade = async () => {
    setError(null);

    if (!inputValue.trim() || rawNum <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    if (tab === "BUY" && amount > balance) {
      setError("Insufficient Balance");
      return;
    }

    if (tab === "SELL") {
      if (side === "YES" && shares > (portfolio?.yesShares ?? 0)) {
        setError("Not enough YES shares to sell");
        return;
      }
      if (side === "NO" && shares > (portfolio?.noShares ?? 0)) {
        setError("Not enough NO shares to sell");
        return;
      }
    }

    try {
      setLoading(true);
      await executeMarketTrade({
        marketId: market._id,
        side,
        shares,
        action: tab,
      });
      setInputValue("");
      await queryclient.invalidateQueries();
      toast.success("Market Trade Executed Successful");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMax = () => {
    if (!prices) return;

    if (tab === "BUY") {
      if (inputMode === "USDT") {
        setInputValue(String(balance.toFixed(2)));
      } else {
        const maxShares = balance / (side === "YES" ? prices.yesPrice : prices.noPrice);
        setInputValue(String(maxShares.toFixed(2)));
      }
    } else {
      const userShares = side === "YES" ? portfolio?.yesShares || 0 : portfolio?.noShares || 0;
      if (inputMode === "USDT") {
        const maxAmount = userShares * (side === "YES" ? prices.yesPrice : prices.noPrice);
        setInputValue(String(maxAmount.toFixed(2)));
      } else {
        setInputValue(String(userShares.toFixed(2)));
      }
    }
  };

  return (
    <div className="lg:w-[300px] bg-[#1C1C1C] text-white rounded-xl border border-white/10 p-3 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold line-clamp-2">{market.question}</h2>
      </div>

      <div className="flex gap-2">
        {["BUY", "SELL"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "BUY" | "SELL")}
            className={`flex-1 py-1 font-medium text-[10px] ${
              tab === t
                ? `border-b ${t === "BUY" ? "border-b-[#C8A2FF]" : "border-b-red-400 text-red-400"} `
                : " border-b  border-b-[#fff] text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSide("YES")}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs ${
            side === "YES" ? "bg-[#C8A2FF] text-black" : "bg-[#212121] text-gray-300"
          }`}
        >
          YES {prices?.yesPrice?.toFixed(2)}¢
        </button>
        <button
          onClick={() => setSide("NO")}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs ${
            side === "NO" ? "bg-red-500 text-white" : "bg-[#212121] text-gray-300"
          }`}
        >
          NO {prices?.noPrice?.toFixed(2)}¢
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="text-xs text-gray-400">
            <small
              className={`cursor-pointer ${inputMode === "SHARES" && "text-primary"}`}
              onClick={() => {
                setInputMode("SHARES");
                setInputValue("");
              }}
            >
              Shares |
            </small>{" "}
            <small
              className={`cursor-pointer ${inputMode === "USDT" && "text-primary"}`}
              onClick={() => {
                setInputMode("USDT");
                setInputValue("");
              }}
            >
              USDT
            </small>
          </label>

          <small className="text-gray-300" onClick={handleMax}>
            MAX
          </small>
        </div>
        <div className="flex items-center mt-1 bg-[#212121] rounded-lg px-3 py-2">
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm"
            placeholder="0"
          />
        </div>

        <p className="text-[10px] text-gray-400 mt-1">
          {inputMode === "USDT" ? `${shares.toFixed(2)} Shares` : `$${amount.toFixed(2)}`}
        </p>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {market.isResolved ? (
        <button className="bg-green-500/30 text-green-500 p-1.5 rounded-lg w-full text-xs">Market Resolved</button>
      ) : (
        <button
          onClick={handleTrade}
          className={`w-full py-2 rounded-lg text-xs ${
            tab === "BUY" ? "bg-[#C8A2FF] text-black" : "bg-red-400 text-white"
          } font-semibold`}
        >
          {loading ? (
            <BiLoaderAlt className="mx-auto animate-spin" />
          ) : (
            <span>
              {tab} {shares > 0 ? shares.toFixed(2) : "0"} {side}
            </span>
          )}
        </button>
      )}

      {isLoggedIn && (
        <div className="border-t border-white/10 pt-3 text-xs text-gray-400">
          <h3 className="text-primary mb-1 text-xs font-semibold">Your Holdings</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white text-[10px]">
                {portfolio?.yesShares?.toFixed(2)} <small className="text-white/80">YES shares</small>
              </span>
              <span>${(portfolio?.yesShares * prices?.yesPrice)?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white text-[10px]">
                {portfolio?.noShares?.toFixed(2)} <small className="text-white/80">NO shares</small>
              </span>
              <span>${(portfolio?.noShares * prices?.noPrice)?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
