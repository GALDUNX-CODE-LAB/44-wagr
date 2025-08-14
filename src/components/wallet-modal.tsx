"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import DepositModal from "./deposit-modal";
import { WalletCoin } from "../interfaces/interface";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const topCoins: WalletCoin[] = [
  { name: "USDT-BSC", symbol: "bsc", icon: "https://www.cryptologos.cc/logos/tether-usdt-logo.png?v=040" },
  { name: "USDT-ETH", symbol: "eth", icon: "https://www.cryptologos.cc/logos/tether-usdt-logo.png?v=040" },
  { name: "USDC-SOL", symbol: "usdt", icon: "https://www.cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040" },
  { name: "BNB", symbol: "bnb", icon: "https://www.cryptologos.cc/logos/bnb-bnb-logo.png?v=040" },
  { name: "Solana", symbol: "sol", icon: "https://www.cryptologos.cc/logos/solana-sol-logo.png?v=040" },
  { name: "Ethereum", symbol: "sol", icon: "https://www.cryptologos.cc/logos/ethereum-eth-logo.png?v=040" },
];

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const [selectedCoin, setSelectedCoin] = useState<WalletCoin | null>(null);

  if (!open) return null;

  return (
    <>
      {/* Token Selector Modal */}
      {!selectedCoin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[540px] p-4 sm:p-6 border border-white/10 relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-red-500">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-6 text-center">Choose Token to Deposit</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {topCoins.map((coin, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCoin(coin)}
                  className="rounded-[13px] border border-[#FFFFFF1A] bg-[#1C1C1C] flex flex-col items-center justify-center gap-2 hover:border-[#C8A2FF] transition px-2 py-3"
                >
                  <Image src={coin.icon} alt={coin.name} width={40} height={40} />
                  <span className="text-white text-sm">{coin.name}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-white/60 text-center leading-relaxed px-2">
              There is no mechanism to withdraw deposited funds. All funds must be used to purchase.
            </p>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {selectedCoin && <DepositModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
    </>
  );
}
