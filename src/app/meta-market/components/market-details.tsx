'use client';

import { ChevronDown, ChevronUp, Send, Heart, Award } from 'lucide-react';
import { useState } from 'react';
import { Market } from '../../../interfaces/interface';
import LivePlays from '../../../components/live-plays';
import { usePlaceBet } from '../../../lib/hooks/useMarkets';


interface MarketDetailsProps {
  market: Market;
}

export default function MarketDetails({ market }: MarketDetailsProps) {
  // State management
  const [betAmount, setBetAmount] = useState(10);
  const [selectedOption, setSelectedOption] = useState<'Yes' | 'No' | ''>('');
  const [commentSort, setCommentSort] = useState<'Newest' | 'Oldest'>('Newest');
  const [commentInput, setCommentInput] = useState('');

  // Bet placement hook
  const { mutate: placeBet, isPending: isPlacingBet, error: betError } = usePlaceBet();
  const [errorMessage, setErrorMessage] = useState('');


  // Safe defaults for market data
  const marketData = {
    question: market.question || 'Market Prediction',
    b: market.b ?? 0,
    qYes: market.qYes ?? 0,
    qNo: market.qNo ?? 0,
    isResolved: market.isResolved || false,
    result: market.result || 'PENDING',
    createdAt: market.createdAt || new Date().toISOString(),
    comments: market.comments || [],
    plays: market.plays || []
  };

  // Calculate probabilities
  const totalShares = marketData.qYes + marketData.qNo;
  const yesProbability = totalShares > 0 ? (marketData.qYes / totalShares) * 100 : 50;
  const noProbability = 100 - yesProbability;

  // Generate sample data points for the graph (you can replace this with real historical data)
  const generateGraphData = () => {
    const points = 20;
    const yesData = [];
    const noData = [];
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * 100;
      // Generate some realistic fluctuation around the current probabilities
      const yesVariation = (Math.sin(i * 0.3) * 10) + (Math.random() - 0.5) * 15;
      const noVariation = (Math.cos(i * 0.4) * 8) + (Math.random() - 0.5) * 12;
      
      const yesY = Math.max(10, Math.min(90, yesProbability + yesVariation));
      const noY = Math.max(10, Math.min(90, noProbability + noVariation));
      
      yesData.push({ x, y: 100 - yesY }); // Invert Y for SVG coordinates
      noData.push({ x, y: 100 - noY });
    }
    
    return { yesData, noData };
  };

  const { yesData, noData } = generateGraphData();

  // Convert data points to SVG path
  const createPath = (data: {x: number, y: number}[]) => {
    return data.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');
  };

  // Format date
  const marketDate = new Date(marketData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Handlers
  const handleAmountChange = (value: number) => {
    setBetAmount(Math.max(1, Math.min(10000, value)));
  };

  const handlePlaceBet = () => {
    if (!selectedOption || marketData.isResolved) return;
    
    placeBet(
      { 
        marketId: market._id, 
        side: selectedOption.toUpperCase() as 'YES' | 'NO', 
        stake: betAmount 
      },
      {
        onSuccess: (data) => {
          console.log('Bet placed successfully!', data);
          // Reset selection after successful bet
          setSelectedOption('');
          setErrorMessage('');
          // You might want to show a success message here
        },
        onError: (error) => {
          console.error('Failed to place bet:', error);
          // You might want to show an error message here
        }
      }
    );
  };

  // Calculate potential payout
  const calculatePayout = (option: 'Yes' | 'No') => {
    if (option === 'Yes') {
      return marketData.qYes > 0 ? (betAmount / (marketData.qYes / totalShares)).toFixed(2) : betAmount.toFixed(2);
    } else {
      return marketData.qNo > 0 ? (betAmount / (marketData.qNo / totalShares)).toFixed(2) : betAmount.toFixed(2);
    }
  };

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen flex flex-col gap-10">
        
      {/* Top Section */}
      <div className="bg-[#212121] rounded-xl p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-medium flex items-center gap-3">
            <div className="w-[60px] h-[60px] bg-white rounded-[10px]" />
            {marketData.question}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-white/20 text-sm">
            <p>{marketData.b.toLocaleString()} vol</p>
            <p>{marketDate}</p>
            {marketData.isResolved && (
              <p className="text-green-500">Resolved: {marketData.result}</p>
            )}
          </div>
          
          <div className="flex gap-4 mt-2">
            <div className="flex items-center text-xs text-white/65 gap-2">
              <span className="w-3 h-3 bg-[#C8A2FF] rounded-full" /> YES {yesProbability.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-white/65 gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" /> NO {noProbability.toFixed(1)}%
            </div>
          </div>

          {/* Responsive Graph */}
          <div className="relative mt-4 h-[212px] w-full max-w-[95%]">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[90, 70, 50, 30, 10].map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between border-t border-dotted border-white/10 text-xs text-white/65"
                >
                  <span></span>
                  <span className="-mr-2 sm:-mr-8 -mt-2">{100-p}%</span>
                </div>
              ))}
            </div>
            
            {/* SVG Graph */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              style={{ overflow: 'visible' }}
            >
              {/* YES line */}
              <path 
                d={createPath(yesData)} 
                stroke="#C8A2FF" 
                strokeWidth="2" 
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              {/* NO line */}
              <path 
                d={createPath(noData)} 
                stroke="#ef4444" 
                strokeWidth="2" 
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>


{/* Trade Panel */}
<div className="w-full lg:max-w-[347px] bg-[#1C1C1C] rounded-xl border border-white/10 p-4 sm:p-6">
  <h2 className="text-base font-medium mb-2 border-b border-white/6 pb-2">
    {marketData.isResolved ? 'Market Resolved' : 'Opinion'}
  </h2>

  {marketData.isResolved ? (
    <div className="text-center py-4">
      <p className="text-white/60 mb-2">This market has been resolved</p>
      <p className="text-xl font-semibold text-green-500">{marketData.result}</p>
    </div>
  ) : (
    <>
      <div className="flex gap-4 mb-4">
        {(['Yes', 'No'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setSelectedOption(opt);
              setErrorMessage('');
            }}
            disabled={isPlacingBet}
            className={`flex-1 py-2 rounded-[10px]  text-sm font-medium text-center transition-colors ${
              selectedOption === opt
                ? opt === 'Yes'
                  ? 'bg-[#C8A2FF] text-black border-[#C8A2FF]'
                  : 'bg-red-500 text-black border-red-500'
                : 'bg-[#212121] text-white border-white/10 hover:border-white/20'
            } ${isPlacingBet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {opt} {opt === 'Yes' ? yesProbability.toFixed(1) : noProbability.toFixed(1)}%
          </button>
        ))}
      </div>

      {/* Bet Amount */}
      <div className="mb-4">
        <p className="text-sm text-white/60 mb-1">Bet Amount</p>
        <div className="flex bg-[#212121] rounded-lg px-3 py-2 items-center gap-2">
          <span className="text-white text-lg font-semibold">$</span>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            disabled={isPlacingBet}
            className="bg-transparent text-white text-lg font-semibold text-left w-full focus:outline-none disabled:opacity-50"
            min={1}
            max={10000}
          />
          <div className="flex flex-row gap-1 ml-2">
            <button
              onClick={() => handleAmountChange(betAmount + 1)}
              disabled={isPlacingBet}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
            <button
              onClick={() => handleAmountChange(betAmount - 1)}
              disabled={isPlacingBet}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Potential Payout */}
      {selectedOption && (
        <div className="mb-4 p-3 bg-[#212121] rounded-lg">
          <p className="text-sm text-white/60">Potential Payout</p>
          <p className="text-lg font-semibold text-white">
            ${calculatePayout(selectedOption)}
          </p>
          <p className="text-xs text-white/40">
            Profit: ${(parseFloat(calculatePayout(selectedOption)) - betAmount).toFixed(2)}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            {errorMessage}
          </p>
        </div>
      )}
      {betError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">
            {betError instanceof Error ? betError.message : 'Failed to place bet'}
          </p>
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={() => {
          if (!selectedOption) {
            setErrorMessage('Please select Yes or No to place a trade.');
            return;
          }
          handlePlaceBet();
        }}
        disabled={isPlacingBet}
        className={`w-full font-semibold mt-5 rounded-[10px] py-3 transition-colors ${
          isPlacingBet
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black'
        }`}
      >
        {isPlacingBet ? 'Placing Bet...' : 'Trade'}
      </button>
    </>
  )} 
</div>
</div>


      {/* Comments + Plays Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Comments */}
        <div className="w-full lg:w-[754px] bg-[#212121] rounded-[20px] border border-white/10 p-4 sm:p-6 flex flex-col">
          <div className="flex items-start gap-2 mb-4">
            <Award className="text-[#c8a2ff]" />
            <h2 className="text-xl font-bold text-white">Comments</h2>
          </div>
          
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full h-[50px] pl-4 pr-12 bg-[#212121] border border-white/6 rounded-[15px] text-sm text-white focus:outline-none"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#C8A2FF] p-4 rounded-[10px]">
              <Send className="text-black w-4 h-4" />
            </button>
          </div>

          <select
            className="mb-4 bg-[#212121] text-white text-sm px-4 py-2 rounded-full border border-white/6 w-fit"
            value={commentSort}
            onChange={(e) => setCommentSort(e.target.value as 'Newest' | 'Oldest')}
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>

          {/* Comment List */}
          <div className="flex flex-col gap-4 overflow-auto">
            {marketData.comments.length > 0 ? (
              marketData.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-4 rounded-[100px] p-3">
                  <div className="w-10 h-10 bg-white rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-base text-white">{c.name}</p>
                      <span className="text-xs text-white/65">• 3 days ago</span>
                    </div>
                    <p className="text-white/65 text-sm">{c.text}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Heart className="w-4 h-4 text-white" />
                      <span className="text-xs text-white/65">23</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/40 text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        {/* Live Plays */}
        <LivePlays plays={marketData.plays} />
      </div>
    </div>
  );
}