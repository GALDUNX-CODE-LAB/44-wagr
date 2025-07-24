"use client";

import { useEffect, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { ChevronDown, X, Copy, Check } from "lucide-react";

interface DepositModalProps {
  coin: {
    name: string;
    symbol: string;
    icon: string;
  } | null;
  onClose: () => void;
}

export default function DepositModal({ coin, onClose }: DepositModalProps) {
  const [wallet, setWallet] = useState("main");
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (coin) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setAddress(`bc1q${wallet}-${coin.symbol.toLowerCase()}-${Math.random().toString(36).substring(2, 10)}`);
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [coin, wallet]);

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWallet(e.target.value);
    setIsLoading(true);
  };

  if (!coin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[700px] p-6 border border-white/10 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close deposit modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Deposit Funds</h2>
          <div className="flex items-center text-sm text-white/80 gap-2">
            <button onClick={onClose} className="hover:text-purple-400 transition-colors">
              Back
            </button>
            <span className="text-white">/ Deposit {coin.name}</span>
          </div>
        </div>

        {/* Wallet Selector */}
        <div className="mb-6 relative">
          <div className="relative">
            <select
              id="wallet-select"
              value={wallet}
              onChange={handleWalletChange}
              className="w-full h-[40px] bg-[#212121] border border-white/10 text-white rounded-[10px] px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            >
              <option value="main">Select Network</option>
              <option value="trading">Trading Wallet</option>
              <option value="savings">Savings Wallet</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* QR & Instructions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {/* QR Code */}
          <div className=" flex justify-center">
            <div className="bg-white p-6 my-auto rounded">
              {isLoading ? (
                <div className="w-[128px] h-[128px]  flex items-center justify-center bg-gray-200 animate-pulse" />
              ) : (
                <QRCode value={address} size={128} bgColor="#ffffff" fgColor="#000000" />
              )}
            </div>
          </div>

          {/* Instruction Box */}
          <div className=" bg-[#212121] border border-white/10 rounded-[20px] p-4">
            <h1 className="text-xl font-bold">Scan the QR code or copy the address and send your desired amount. </h1>
            <p className="text-white/70 text-sm mb-4 leading-relaxed mt-5">
              Send BTC to this address to receive the current USD value in PackDraw credit. The minimum transfer value
              is $5. Transfers below $5 will not be credited to your account and will not be returned.
            </p>
          </div>
        </div>

        {/* Address Box - Updated to match wallet selector */}
        <div className="mb-6 relative">
          <label className="block text-sm text-white/80 mb-2">Your {coin.symbol.toUpperCase()} Address:</label>
          <div className="relative">
            <div className="w-full h-[40px] bg-[#212121] border border-white/10 text-white rounded-[10px] px-4 pr-8 flex items-center">
              {isLoading ? (
                <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
              ) : (
                <span className="truncate font-mono text-purple-300">{address}</span>
              )}
            </div>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
              disabled={copied}
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="text-xs text-white/60">
          <p>
            Cryptocurrency deposits are generally credited after 3 confirmations. Please allow up to 30 minutes for
            funds to appear in your account. In most cases, funds will appear within 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
