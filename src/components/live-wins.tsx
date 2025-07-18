'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award } from 'lucide-react'

export default function LiveWinsSection() {
  const router = useRouter()

  const gameCategories = ['Casino', 'Sports', 'Race', 'Dice']
  const liveWins = [
    { event: 'Roulette Spin', user: 'Big boy', time: '2 mins ago', bet: '2,500.76854...', multiplier: '1.00x', payout: '2,500.76854...' },
    { event: 'Blackjack', user: 'Big boy', time: '4 mins ago', bet: '2,500.76854...', multiplier: '1.00x', payout: '2,500.76854...' },
    { event: 'Slots', user: 'Big boy', time: '6 mins ago', bet: '2,500.76854...', multiplier: '1.00x', payout: '2,500.76854...' },
    { event: 'Dice Roll', user: 'Big boy', time: '8 mins ago', bet: '2,500.76854...', multiplier: '1.00x', payout: '2,500.76854...' }
  ]

  const [activeCategory, setActiveCategory] = useState(gameCategories[0])

  return (
    <section className="mb-20 w-full ">
      <div className="flex items-start gap-2 mb-4">
        <Award className="text-[#c8a2ff]" />
        <h2 className="text-xl font-bold text-white">Live Wins</h2>
      </div>

      <div className="flex gap-2 mb-6">
        {gameCategories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category)
              router.push(`/games/${category.toLowerCase()}`)
            }}
            className={`w-[92px] h-[30px] rounded-full flex items-center justify-center text-sm transition
              ${activeCategory === category ? 'bg-[#C8A2FF] text-black' : 'bg-[#1c1c1c] text-white/70 hover:bg-[#2a2a2a]'}`}
            style={{
              padding: '5px 23px',
              gap: '10px',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden w-full">
        <table className="w-full">
          <thead className="bg-[#212121]">
            <tr className="text-[#ffffff]/60 text-[13px] ">
              <th className="p-5  text-left">Event</th>
              <th className="p-5 px-10 text-left">User</th>
              <th className="p-5 px-10 text-left">Time</th>
              <th className="p-5 px-10 text-left">Bet Amount</th>
              <th className="p-5 px-10 text-left">Multiplier</th>
              <th className="p-5 px-10 text-left">Payout</th>
            </tr>
          </thead>
          <tbody>
            {liveWins.map((win, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-[#1C1C1C]' : 'bg-[#212121]'
                } text-white text-[13px] font-medium`}
              >
                <td className="p-5 ">{win.event}</td>
                <td className="p-5 px-10">{win.user}</td>
                <td className="p-5 px-10">{win.time}</td>

                {/* Bet Amount with dot */}
                <td className="p-5 px-10">
                  <div className="flex items-center gap-1">
                    <span>{win.bet}</span>
                    <div className="w-[15px] h-[15px] rounded-full bg-[#D9D9D9]" />
                  </div>
                </td>

                <td className="p-5 px-10">{win.multiplier}</td>

                {/* Payout with dot */}
                <td className="p-5 px-10">
                  <div className="flex items-center gap-1">
                    <span>{win.payout}</span>
                    <div className="w-[15px] h-[15px] rounded-full bg-[#D9D9D9]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
