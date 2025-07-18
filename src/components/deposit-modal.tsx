'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import QRCode from 'react-qr-code';

interface DepositModalProps {
  coin: {
    name: string;
    symbol: string;
    icon: string;
  } | null;
  onClose: () => void;
}

export default function DepositModal({ coin, onClose }: DepositModalProps) {
  const [wallet, setWallet] = useState('main');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (coin) {
      setAddress(`bc1qexampleaddressfor${coin.symbol.toLowerCase()}1234567890xyz`);
    }
  }, [coin]);

  if (!coin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[600px] p-6 border border-white/10 relative">
        {/* Close & Back */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-sm text-white hover:text-purple-400"
        >
          ← Back
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold text-center mb-6">
          Deposit {coin.name}
        </h2>

        {/* Wallet Selector */}
        <div className="mb-4">
          <label className="text-sm mb-1 block">Select Wallet</label>
          <select
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-white/10 p-2 rounded text-white"
          >
            <option value="main">Main Wallet</option>
            <option value="trading">Trading Wallet</option>
          </select>
        </div>

        {/* QR + Warning Box */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* QR Code */}
          <div className="w-full sm:w-1/2 flex justify-center">
            <div className="bg-white p-2 rounded">
              <QRCode
                value={address}
                size={128}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* Warning Box */}
          <div className="w-full sm:w-1/2 bg-[#2C2C2C] p-4 rounded-lg border border-red-500 text-sm text-red-300">
            ⚠️ Send only <strong>{coin.name}</strong> to this address.<br />
            Sending any other asset may result in <strong>permanent loss</strong> of funds.
          </div>
        </div>

        {/* Address + Copy */}
        <p className="mb-1 text-[14px]">Your {coin.symbol.toUpperCase()} Address:</p>
        <div className="bg-[#2A2A2A] text-sm text-white px-4 py-2 rounded mb-4 border border-[#FFFFFF1A] break-words">
          <div className="font-mono text-purple-300 flex justify-between items-center gap-2 flex-wrap">
            <span className="break-all">{address}</span>
            <button
              onClick={() => navigator.clipboard.writeText(address)}
              className="text-xs text-white/50 hover:text-white whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Info Note */}
        <p className="text-xs text-white/60 text-center leading-relaxed">
          Cryptocurrency deposits are generally credited after 3 confirmations.
          Please allow up to 30 minutes for funds to appear in your account.
          In most cases, funds will appear within 5 minutes.
        </p>
      </div>
    </div>
  );
}
