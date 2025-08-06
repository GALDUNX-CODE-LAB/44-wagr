// components/live-plays.tsx
'use client';

import { Market } from "../interfaces/interface";

interface LivePlaysProps {
  plays?: Array<{
    user: string;
    time: string;
    choice: 'Yes' | 'No';
  }>;
}

export default function LivePlays({ plays = [] }: LivePlaysProps) {
  // Default plays data if none provided
  const displayPlays = plays.length > 0 ? plays : [
    { user: 'Alice', time: '2 months ago', choice: 'Yes' },
    { user: 'Bob', time: '3 days ago', choice: 'No' },
    { user: 'Charlie', time: '1 hour ago', choice: 'Yes' }
  ];

  return (
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
          {displayPlays.map((row, i) => (
            <tr
              key={i}
              className={`${
                i % 2 === 0 ? 'bg-[#1C1C1C]' : 'bg-[#212121]'
              } text-white text-sm font-medium`}
            >
              <td className="py-3 px-4">{row.user}</td>
              <td className="py-3 px-4">{row.time}</td>
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
  );
}