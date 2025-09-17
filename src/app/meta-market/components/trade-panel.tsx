"use client";
import { useState } from "react";
import { Market } from "../../../interfaces/interface";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { executeMarketTrade, fetchMarketPrices, fetchUserPorfolio } from "../../../lib/api";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";
import { useUser } from "../../../hooks/useUserData";
import { BiLoaderAlt } from "react-icons/bi";

interface TradePanelProps {
  market: Market;
}
export default function TradePanel({ market }: TradePanelProps) {
  const [tab, setTab] = useState<"BUY" | "SELL">("BUY");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [inputMode, setInputMode] = useState<"USDT" | "SHARES">("USDT");
  const [amount, setAmount] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
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

  const handleInputChange = (val: number) => {
    if (!prices) return;
    if (inputMode === "USDT") {
      setAmount(val);
      setShares(val / (side === "YES" ? prices.yesPrice : prices.noPrice));
    } else {
      setShares(val);
      setAmount(val * (side === "YES" ? prices.yesPrice : prices.noPrice));
    }
  };

  const handleTrade = async () => {
    setError(null);

    if (amount <= 0 || shares <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    if (tab === "BUY" && amount > balance) {
      setError("Insufficient Balance");
      return;
    }

    if (tab === "SELL") {
      if (side === "YES" && shares > portfolio.yesShares) {
        setError("Not enough YES shares to sell");
        return;
      }
      if (side === "NO" && shares > portfolio.noShares) {
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
    } catch (error) {
      console.log(error);
    } finally {
      await queryclient.invalidateQueries();
      setLoading(false);
    }
  };

  const handleMax = () => {
    if (!prices) return;

    if (tab === "BUY") {
      if (inputMode === "USDT") {
        setAmount(Number(balance.toFixed(2)));
        setShares(balance / (side === "YES" ? prices.yesPrice : prices.noPrice));
      } else {
        const maxShares = balance / (side === "YES" ? prices.yesPrice : prices.noPrice);
        setShares(maxShares);
        setAmount(maxShares * (side === "YES" ? prices.yesPrice : prices.noPrice));
      }
    } else {
      if (inputMode === "USDT") {
        const userShares = side === "YES" ? portfolio?.yesShares || 0 : portfolio?.noShares || 0;
        const maxAmount = userShares * (side === "YES" ? prices.yesPrice : prices.noPrice);
        setAmount(maxAmount);
        setShares(userShares);
      } else {
        const userShares = side === "YES" ? portfolio?.yesShares || 0 : portfolio?.noShares || 0;
        setShares(userShares);
        setAmount(userShares * (side === "YES" ? prices.yesPrice : prices.noPrice));
      }
    }
  };

  return (
    <div className="lg:w-[340px] bg-[#1C1C1C] text-white rounded-xl border border-white/10 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{market.question}</h2>
      </div>

      <div className="flex gap-2">
        {["BUY", "SELL"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "BUY" | "SELL")}
            className={`flex-1 py-1 font-medium text-xs ${
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
          className={`flex-1 py-3 rounded-lg font-semibold ${
            side === "YES" ? "bg-[#C8A2FF] text-black" : "bg-[#212121] text-gray-300"
          }`}
        >
          YES {prices?.yesPrice?.toFixed(2)}¢
        </button>
        <button
          onClick={() => setSide("NO")}
          className={`flex-1 py-3 rounded-lg font-semibold text-sm ${
            side === "NO" ? "bg-red-500 text-white" : "bg-[#212121] text-gray-300"
          }`}
        >
          NO {prices?.noPrice?.toFixed(2)}¢
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-400">
            <small
              className={`cursor-pointer ${inputMode === "SHARES" && "text-primary"}`}
              onClick={() => {
                setInputMode("SHARES");
                handleInputChange(0);
              }}
            >
              Shares |
            </small>{" "}
            <small
              className={`cursor-pointer ${inputMode === "USDT" && "text-primary"}`}
              onClick={() => {
                setInputMode("USDT");
                handleInputChange(0);
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
            type="number"
            min={0}
            value={inputMode === "USDT" ? amount : shares}
            onChange={(e) => handleInputChange(Number(e.target.value))}
            className="w-full bg-transparent focus:outline-none text-lg"
            placeholder="0"
          />
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {inputMode === "USDT" ? `${shares.toFixed(2)} Shares` : `$${amount.toFixed(2)}`}
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {market.isResolved ? (
        <button className="bg-green-500/30 text-green-500 p-2 rounded-lg w-full">Market Resolved</button>
      ) : (
        <button
          onClick={handleTrade}
          className={`w-full py-3 rounded-lg  ${
            tab === "BUY" ? "bg-[#C8A2FF] text-black" : "bg-red-400 text-white"
          } font-semibold`}
        >
          {loading ? (
            <BiLoaderAlt className="mx-auto animate-spin" />
          ) : (
            <span>
              {tab} {shares.toFixed(2)} {side}
            </span>
          )}
        </button>
      )}

      {isLoggedIn && (
        <div className="border-t border-white/10 pt-3 text-sm text-gray-400">
          <h1 className="text-primary mb-1">Your Holdings</h1>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">
                {portfolio?.yesShares?.toFixed(2)} <small className="text-white/80">YES shares</small>
              </span>
              <span>${(portfolio?.yesShares * prices?.yesPrice)?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">
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
