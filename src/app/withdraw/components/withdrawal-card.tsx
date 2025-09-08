'use client';
import React, { useState } from 'react';
import { ChevronDown, Bitcoin, Coins } from 'lucide-react';

const WithdrawalFormCard = () => {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const coins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin, maxBalance: 10.5, fee: 0.001 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: Coins, maxBalance: 25.8, fee: 0.005 },
  ];

  const selectedCoinData = coins.find(coin => coin.id === selectedCoin);
  const IconComponent = selectedCoinData?.icon;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    }
  };

  const handleMax = () => {
    if (selectedCoinData) {
      setAmount(selectedCoinData.maxBalance.toString());
    }
  };

  const calculateTotal = () => {
    if (!amount || !selectedCoinData) return '0.000';
    const numAmount = parseFloat(amount);
    return (numAmount + selectedCoinData.fee).toFixed(3);
  };

  const handleWithdraw = () => {
    if (!address || !amount || !selectedCoin) {
      alert('Please fill in all fields');
      return;
    }
    alert(`Withdrawing ${amount} ${selectedCoinData?.symbol} to ${address}`);
  };

  return (
    <div className="w-full max-w-[377px] h-[352px] bg-[#212121] border border-white/10 rounded-[20px] p-4 flex flex-col">
      <h2 className="text-white font-normal text-lg mb-4">Withdraw</h2>

      <div className="flex-1 space-y-3">
        <div className="w-full">
          <div className="relative">
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="appearance-none w-full h-[40px] pl-8 pr-10 bg-[#1C1C1C] border border-white/10 rounded-[15px] text-white focus:outline-none focus:border-purple-500 cursor-pointer text-sm"
            >
              <option value="" disabled className="text-white/60 text-xs font-normal ">
                Select cryptocurrency to withdraw
              </option>
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id} className="text-white ">
                    {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
            
            {selectedCoinData && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/60 rounded-full p-0.5 flex items-center gap-2 pointer-events-none">
                <IconComponent className="w-4 h-4 text-orange-500" />
              </div>
            )}
            
            
            
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-[40px] px-4 pr-14 bg-[#1C1C1C] placeholder:text-xs border border-white/10 rounded-[15px] text-white placeholder-white/60 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              onClick={handlePaste}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-white text-xs transition-colors cursor-pointer"
            >
              Paste
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="relative">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[40px] px-4 pr-12 bg-[#1C1C1C] border placeholder:text-xs border-white/10 rounded-[15px] text-white placeholder-white/60 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              onClick={handleMax}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-white text-xs transition-colors cursor-pointer"
            >
              Max
            </button>
          </div>
          {selectedCoinData && (
            <p className="text-white/60 text-xs mt-2 ml-1">
              Available: {selectedCoinData.maxBalance} {selectedCoinData.symbol}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex gap-2 text-white/60 text-xs">
            <span>Transaction Fee:</span>
            <span className="text-white">
              {selectedCoinData ? `${selectedCoinData.fee} ${selectedCoinData.symbol}` : '0.000'}
            </span>
          </div>
          <div className="flex gap-2 text-white/60 font-semibold text-xs">
            <span>Total Amount:</span>
            <span className=' text-white'>
              {calculateTotal()} {selectedCoinData?.symbol || ''}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleWithdraw}
          disabled={!address || !amount || !selectedCoin}
          className="px-4 py-2.5 bg-[#c8a2ff] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-normal rounded-[10px] transition-colors text-sm whitespace-nowrap"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WithdrawalFormCard;