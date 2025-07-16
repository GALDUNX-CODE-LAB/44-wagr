'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award } from 'lucide-react';

export default function LiveWinsSection() {
  const router = useRouter()

  const gameCategories = ['Casino', 'Sports', 'Race', 'Dice']
  const liveWins = [
    { event: 'Roulette Spin', user: 'Player1', time: '2 mins ago', bet: '0.5 ETH', multiplier: '5x', payout: '2.5 ETH' },
    { event: 'Blackjack', user: 'Player2', time: '4 mins ago', bet: '1.2 ETH', multiplier: '2x', payout: '2.4 ETH' },
    { event: 'Slots', user: 'Player3', time: '6 mins ago', bet: '0.3 ETH', multiplier: '10x', payout: '3 ETH' },
    { event: 'Dice Roll', user: 'Player4', time: '8 mins ago', bet: '0.8 ETH', multiplier: '3x', payout: '2.4 ETH' }
  ]

  const [activeCategory, setActiveCategory] = useState(gameCategories[0])

  return (
    <section className="mb-20">
      <div className="flex items-center gap-2 mb-4">
        <Award className=' text-[#c8a2ff]' />
        <h2 className="text-xl font-bold">Live Wins</h2>
      </div>

      <div className="flex gap-2 mb-6">
        {gameCategories.map(category => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category)
              router.push(`/games/${category.toLowerCase()}`)
            }}
            className={`w-[92px] h-[30px] rounded-full flex items-center justify-center text-sm 
              ${activeCategory === category ? 'bg-[#C8A2FF] text-black' : 'bg-[#212121] border border-white/10'}`}
            style={{
              padding: '5px 23px',
              gap: '10px'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-white/10">
        <table className="w-full">
          <thead className="bg-[#212121]">
            <tr>
              <th className="p-3 text-left">Event</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Bet Amount</th>
              <th className="p-3 text-left">Multiplier</th>
              <th className="p-3 text-left">Payout</th>
            </tr>
          </thead>
          <tbody>
            {liveWins.map((win, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-[#1C1C1C]' : 'bg-[#212121]'}>
                <td className="p-3">{win.event}</td>
                <td className="p-3">{win.user}</td>
                <td className="p-3">{win.time}</td>
                <td className="p-3">{win.bet}</td>
                <td className="p-3">{win.multiplier}</td>
                <td className="p-3 text-green-400">{win.payout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
