'use client';
import React, { useState } from 'react';
import { createUserWithdrawal } from '../../../lib/api';
import { useUser } from '../../../hooks/useUserData';

const WithdrawalFormCard = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  
  const { balance } = useUser();

  const usdtData = {
    symbol: 'USDT',
    maxBalance: balance || 0,
    fee: 1
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Failed to paste from clipboard. Please paste manually.');
    }
  };

  const handleMax = () => {
    if (balance) {
      setAmount(balance.toString());
    }
  };

  const calculateTotal = () => {
    if (!amount) return '0.00';
    const numAmount = parseFloat(amount);
    return (numAmount + usdtData.fee).toFixed(2);
  };

  const handleWithdraw = async () => {
    if (!address || !amount) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const numAmount = parseFloat(amount);
      const response = await createUserWithdrawal(numAmount, address);
      console.log('Withdrawal successful:', response);
      alert('Your withdrawal request has been submitted successfully! It will be processed within 24 hours.');
      
      setAmount('');
      setAddress('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-[377px] bg-[#212121] border border-white/10 rounded-[20px] p-4 flex flex-col">
      <h2 className="text-white font-normal text-lg mb-4">Withdraw</h2>

      <div className="flex-1 space-y-3">
        <div className="w-full">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
              <img 
                src="/assets/usdt.png" 
                alt="USDT" 
                className="w-4 h-4"
              />
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-[40px] pl-8 pr-12 bg-[#1C1C1C] border placeholder:text-xs border-white/10 rounded-[15px] text-white placeholder-white/60 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              onClick={handleMax}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-white text-xs transition-colors cursor-pointer"
            >
              Max
            </button>
          </div>
          <p className="text-white/60 text-xs mt-2 ml-1">
            Available: {balance?.toFixed(2) || '0.00'}
          </p>
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
      </div>

      <div className="mb-2 mt-4 flex items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex gap-2 text-white/60 text-xs">
            <span>Transaction Fee:</span>
            <span className="text-white">
              {usdtData.fee}
            </span>
          </div>
          <div className="flex gap-2 text-white/60 font-semibold text-xs">
            <span>Total Amount:</span>
            <span className="text-white">
              {calculateTotal()}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleWithdraw}
          disabled={!address || !amount}
          className="px-4 py-2.5 bg-[#c8a2ff] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-normal rounded-[10px] transition-colors text-sm whitespace-nowrap"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WithdrawalFormCard;