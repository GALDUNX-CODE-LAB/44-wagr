'use client'

import { useState } from 'react'
import {
  Search,
  Dices,
  ArrowRightLeft,
  RefreshCcw,
  HelpCircle,
  Rocket,
  Star
} from 'lucide-react'
import { TbGraph } from "react-icons/tb";

const categories = ['All', 'Dice', 'Meta Market', 'Crash', 'Flip', 'Wheel']

const betHistory = [
  {
    id: 1,
    type: 'Dice',
    icon: <Dices className="w-4 h-4 text-white" />,
    amount: '0.025',
    outcome: 'win',
    meta: {
      Multiplier: '2.00x',
      'Roll Over': '49.50',
      'Win Chance': '50%',
    },
  },
  {
    id: 2,
    type: 'Meta Market',
    icon: <TbGraph className="w-4 h-4 text-white" />,
    amount: '0.05',
    outcome: 'lose',
    meta: {
      Volume: '0.40',
      Comments: '12',
      Answers: 'Yes',
    },
  },
  {
    id: 3,
    type: 'Crash',
    icon: <Rocket className="w-4 h-4 text-white rotate-320" />,
    amount: '0.1',
    outcome: 'win',
    meta: {
      'Cashout At': '2.4x',
      'Bet Amount': '0.1 BTC',
      'Crash At': '2.7x',
    },
  },
  {
    id: 4,
    type: 'Flip',
    icon: <ArrowRightLeft className="w-4 h-4 text-white" />,
    amount: '0.012',
    outcome: 'lose',
    meta: {
      Multiplier: '1.90x',
      Result: 'Heads',
      Picked: 'Tails',
    },
  },
  {
    id: 5,
    type: 'Wheel',
    icon: <RefreshCcw className="w-4 h-4 text-white" />,
    amount: '0.075',
    outcome: 'win',
    meta: {
      'Bet Amount': '0.075 BTC',
      Segments: '18',
      Color: 'Purple',
    },
  },
]

export default function BetHistoryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBets = betHistory.filter((b) => {
    const matchesCategory = activeCategory === 'All' || b.type === activeCategory
    const matchesSearch =
      b.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(b.meta).join(' ').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const colorMap: Record<string, string> = {
    Purple: '#C8A2FF',
    Red: '#EF4444',
    Green: '#22C55E',
    Yellow: '#FACC15',
  }

  const colorOddsMap: Record<string, string> = {
    Purple: '1.3x',
    Red: '1.5x',
    Green: '2.0x',
    Yellow: '1.8x',
  }

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen">
      {/* Title & Subtext */}
      <h1 className="text-[30px] font-medium mb-1">Bet History</h1>
      <p className="text-base font-normal text-white/70 mb-6 max-w-xl">
        View your past bets across all games and platforms.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
        <input
          type="text"
          placeholder="Search bets"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 bg-[#212121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm font-medium relative pb-1 transition-colors ${
              activeCategory === cat ? 'text-[#C8A2FF]' : 'text-white/70 hover:text-white'
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C8A2FF] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Bet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBets.map((bet) => {
          const isWin = bet.outcome === 'win'
          const cardBg = isWin ? 'bg-green-400/10' : 'bg-red-400/10'
          const badgeColor = isWin ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          const amountColor = isWin ? 'text-green-400' : 'text-red-400'

          return (
            <div
              key={bet.id}
              className={`w-full max-w-[365px] h-[186px] ${cardBg} border border-white/10 rounded-[20px] p-4 flex flex-col justify-between`}
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center text-base gap-2 text-white/60 font-medium">
                  {bet.icon}
                  {bet.type}
                </div>
                <div className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeColor}`}>
                  {isWin ? 'Win' : 'Lose'}
                </div>
              </div>

              {/* Amount or Question */}
              {bet.type === 'Meta Market' ? (
                <div className="text-white text-base font-medium mt-2">
                  Will World War3 begin in year 2025?
                </div>
              ) : (
                <div className={`text-[20px] font-medium mt-2 ${amountColor}`}>
                  {isWin ? '+' : '-'} {bet.amount} BTC
                </div>
              )}

              {/* Metadata */}
              <div className="flex gap-3 mt-4">
                {Object.entries(bet.meta).map(([label, value]) => (
                  <div key={label} className="flex flex-col items-start flex-1 min-w-[80px]">
                    <span className="text-[12px] text-white/60 mb-1">{label}</span>
                    <div className="w-full bg-[#1C1C1C] rounded-md p-2 text-center text-sm font-semibold">
                      {(() => {
                        const isMetaMarket = bet.type === 'Meta Market'
                        const isWheelColor = bet.type === 'Wheel' && label === 'Color'

                        if (value === 'Heads' || value === 'Tails') {
                          return (
                            <div className="flex items-center justify-center gap-2">
                              <span>{value}</span>
                              {value === 'Heads' ? (
                                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-[#C8A2FF] flex items-center justify-center">
                                  <Star className="w-2.5 h-2.5 text-black fill-black" />
                                </div>
                              )}
                            </div>
                          )
                        } else if (isMetaMarket) {
                          return <span className="text-sm text-white font-semibold">{value}</span>
                        } else if (isWheelColor) {
                          return (
                            <div className="flex items-center gap-2 justify-center">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: colorMap[value as string] || '#ccc' }}
                              />
                              <span>{colorOddsMap[value as string] || '1.0x'}</span>
                            </div>
                          )
                        } else {
                          return <span className="text-xs">{value}</span>
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
