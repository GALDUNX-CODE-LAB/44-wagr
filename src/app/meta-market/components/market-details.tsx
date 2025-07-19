'use client';

import Image from 'next/image';
import { ChevronDown, ChevronUp, Send, Heart } from 'lucide-react';
import { useState } from 'react';
import { Market } from '../../../interfaces/interface';
import { Award } from 'lucide-react';

interface MarketDetailsProps {
  market: Market;
}

export default function MarketDetails({ market }: MarketDetailsProps) {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedOption, setSelectedOption] = useState<'Yes' | 'No' | ''>('');
  const [commentSort, setCommentSort] = useState<'Newest' | 'Oldest'>('Newest');
  const [commentInput, setCommentInput] = useState('');

  const increaseAmount = () => setBetAmount((p) => p + 1);
  const decreaseAmount = () => setBetAmount((p) => Math.max(1, p - 1));

  return (
    <div className="p-4 sm:p-6  text-white min-h-screen flex flex-col gap-10">
      {/* Top Section */}
      <div className="bg-[#212121] rounded-xl p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-medium flex items-center gap-3">
            {/* Image Placeholder */}
            <div className="w-[60px] h-[60px] bg-white rounded-[10px] " />
            {market.question}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/20 text-sm">
            <p>{market.volume} vol</p>
            <p>Dec 31, 2025</p>
          </div>
          <div className="flex gap-4  mt-2">
            <div className="flex items-center text-xs text-white/65  gap-2">
              <span className="w-3 h-3 bg-[#C8A2FF] rounded-full" /> YES
            </div>
            <div className="flex items-center text-xs text-white/65  gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" /> NO
            </div>
          </div>

          {/* Graph */}
          <div className="relative mt-4 h-[212px] w-[95%]">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[50, 40, 30, 20, 10].map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between border-t-[3px] border-dotted border-white/10 text-xs text-white/65"
                >
                  <span></span>
                  <span className="-mr-8 -mt-2">{p}%</span>
                </div>
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,60 Q10,55 20,62 T40,58 T60,65 T80,50 T100,58" stroke="#C8A2FF" strokeWidth="1" fill="none" />
              <path d="M0,72 Q10,67 20,75 T40,70 T60,30 T80,60 T100,72" stroke="red" strokeWidth="1" fill="none" />
            </svg>
            
          </div>
        </div>

        {/* Trade Panel */}
        <div className="w-full lg:max-w-[347px] bg-[#1C1C1C] rounded-xl border border-white/10 p-4 sm:p-6">
          <h2 className="text-base font-medium mb-2 border-b border-white/6 pb-2">Opinion</h2>
          <div className="flex gap-4 mb-4">
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt as 'Yes' | 'No')}
                className={`flex-1 py-2 rounded-[10px] border font-semibold transition ${
                  selectedOption === opt
                    ? 'bg-[#C8A2FF] text-black'
                    : 'bg-[#212121] border-white/6 hover:bg-[#2A2A2A]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
                  <div>
  <p className="text-sm text-white/60 mb-1">Bet Amount</p>
  <div className="flex bg-[#212121] rounded-lg px-3 py-2 items-center gap-2">
    {/* Dollar Sign */}
    <span className="text-white text-lg font-semibold">$</span>

    {/* Input aligned to the left */}
    <input
      type="number"
      value={betAmount}
      onChange={(e) => setBetAmount(+e.target.value)}
      className="bg-transparent text-white text-lg font-semibold text-left w-full focus:outline-none"
      min={1}
    />

    {/* Arrow buttons for adjusting amount */}
    <div className="flex flex-row gap-1 ml-2">
      <button
        onClick={() => setBetAmount(prev => +(prev + 1).toFixed(1))}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10"
      >
        <ChevronUp className="w-4 h-4 text-white" strokeWidth={2} />
      </button>
      <button
        onClick={() => setBetAmount(prev => Math.max(1, +(prev - 1).toFixed(1)))}
        className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] border border-white/10"
      >
        <ChevronDown className="w-4 h-4 text-white" strokeWidth={2} />
      </button>
    </div>
  </div>
</div>

              <div className="flex gap-2 justify-end mt-4">
  <div className="w-[72px] h-[30px] flex items-center justify-center rounded-full border border-white/10 px-[18px] py-[5px]">
    <span className="text-sm font-medium text-white">1.8x</span>
  </div>
  <div className="w-[72px] h-[30px] flex items-center justify-center rounded-full border border-white/10 px-[18px] py-[5px]">
    <span className="text-sm font-medium text-white">2.2x</span>
  </div>
</div>

          <button className="w-full bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[10px] py-3 mt-17">
            Trade
          </button>
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

          {/* Sort Dropdown */}
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
  {market.comments.map((c, i) => (
    <div key={i} className="flex items-start gap-4 rounded-[100px] p-3">
      {/* Image Placeholder */}
      <div className="w-10 h-10 bg-white rounded-full" />

      <div className="flex-1">
        {/* Name and Time */}
        <div className="flex items-center gap-2">
          <p className="font-medium text-base text-white">{c.name}</p>
          <span className="text-xs text-white/65">• 3 days ago</span>
        </div>

        {/* Comment Text */}
        <p className="text-white/65 text-sm">{c.text}</p>

        {/* Like Icon */}
        <div className="flex items-center gap-1 mt-1">
          <Heart className="w-4 h-4 text-white"  />
          <span className="text-xs text-white/65">23</span>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>

        {/* Live Plays */}
              <div className="w-full lg:w-[393px] bg-[#212121] rounded-[20px] border border-white/10 p-4 sm:p-6">
  <h3 className="text-lg font-medium mb-4">Plays</h3>

  <table className="w-full text-sm text-left">
    <thead>
      <tr className="text-white/60 border-b border-white/10">
        <th className="py-3 px-4">Username</th>
        <th className="py-3 px-4">Time</th>
        <th className="py-3 px-4">Opinion</th>
      </tr>
    </thead>

    <tbody>
      {[
        { user: 'Alice', time: '2 months ago', choice: 'Yes' },
        { user: 'Bob', time: '3 days ago', choice: 'No' },
        { user: 'Charlie', time: '1 hour ago', choice: 'Yes' }
      ].map((row, i) => (
        <tr
          key={i}
          className={`${
            i % 2 === 0 ? 'bg-[#1C1C1C]' : 'bg-[#212121]'
          } text-white text-sm font-medium`}
        >
          <td className="py-3 px-4">{row.user}</td>
          <td className="py-3 px-4 ">{row.time}</td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  row.choice === 'Yes' ? 'bg-[#C8A2FF]' : 'bg-red-500'
                }`}
              />
              <span>{row.choice}</span>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
}
