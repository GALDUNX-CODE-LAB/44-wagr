'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUp, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Market } from '../../../interfaces/interface';

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
    <div className="p-4 sm:p-6 bg-black text-white min-h-screen flex flex-col gap-10">
      {/* Top Section */}
      <div className="bg-[#212121] rounded-xl p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Side */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Image src="/prediction.png" alt="" width={32} height={32} />
            {market.question}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
            <p>Vol: {market.volume}</p>
            <p>Ends: Dec 31, 2025</p>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#C8A2FF] rounded-full" /> YES
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" /> NO
            </div>
          </div>

          {/* Graph */}
          <div className="relative mt-4 h-[212px] w-full">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[50, 40, 30, 20, 10].map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between border-t-[3px] border-dotted border-white/10 text-xs text-gray-400"
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
          <h2 className="text-sm font-semibold mb-2 border-b border-white/10 pb-2">Opinion</h2>
          <div className="flex gap-4 mb-4">
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt as 'Yes' | 'No')}
                className={`flex-1 py-2 rounded-full border font-semibold transition ${
                  selectedOption === opt
                    ? 'bg-[#C8A2FF] text-black'
                    : 'bg-[#212121] border-white/10 hover:bg-[#2A2A2A]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Bet Amount</p>
            <div className="flex bg-[#1A1A1A] rounded-lg px-3 py-2 items-center gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(+e.target.value)}
                className="bg-transparent text-white text-lg font-semibold text-center w-full focus:outline-none"
                min={1}
              />
              <div className="flex flex-col gap-1">
                <button onClick={increaseAmount}>
                  <ArrowUp className="w-4 h-4 text-white" />
                </button>
                <button onClick={decreaseAmount}>
                  <ArrowDown className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-[#2A2A2A] rounded-lg text-center p-3">
              <p className="text-xs text-gray-400">Yes Odds</p>
              <p className="text-xl font-bold">1.8x</p>
            </div>
            <div className="flex-1 bg-[#2A2A2A] rounded-lg text-center p-3">
              <p className="text-xs text-gray-400">No Odds</p>
              <p className="text-xl font-bold">2.2x</p>
            </div>
          </div>
          <button className="w-full bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full py-3 mt-4">
            Trade
          </button>
        </div>
      </div>

      {/* Comments + Plays Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Comments */}
        <div className="w-full lg:w-[754px] bg-[#212121] rounded-[20px] border border-white/10 p-4 sm:p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Comments ({market.comments.length})</h3>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full h-[50px] pl-4 pr-12 bg-[#1A1A1A] border border-white/10 rounded-[15px] text-sm text-white focus:outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C8A2FF] p-2 rounded-full">
              <SendHorizontal className="text-black w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            className="mb-4 bg-[#1A1A1A] text-white text-sm px-3 py-2 rounded-full border border-white/10 w-fit"
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
                <Image src={c.avatar} alt={c.name} width={40} height={40} className="rounded-full" />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-gray-300 text-sm">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Plays */}
        <div className="w-full lg:w-[393px] bg-[#212121] rounded-[20px] border border-white/10 p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Live Plays</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th>User</th>
                <th>Time</th>
                <th>Opinion</th>
              </tr>
            </thead>
            <tbody>
              {[{ user: 'Alice', time: '2 months ago', choice: 'Yes' }, { user: 'Bob', time: '3 days ago', choice: 'No' }, { user: 'Charlie', time: '1 hour ago', choice: 'Yes' }].map((row, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-2">{row.user}</td>
                  <td className="py-2 text-gray-400">{row.time}</td>
                  <td className={`py-2 ${row.choice === 'Yes' ? 'text-[#C8A2FF]' : 'text-red-500'}`}>
                    {row.choice}
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
