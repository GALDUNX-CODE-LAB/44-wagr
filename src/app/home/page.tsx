'use client'

import { ArrowUpRight, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import LiveWinsSection from '../../components/live-wins'

export default function HomePage() {
  const router = useRouter()

  const availableGames = [
    { name: 'Crash', players: 1248, image: '/assets/icon.svg' },
    { name: 'Dice', players: 892, image: '/assets/icon.svg' },
    { name: 'Coin', players: 1532, image: '/assets/icon.svg' },
    { name: 'Wheel', players: 721, image: '/assets/icon.svg' }
  ]

  const trendingGames = [
    { name: 'Roulette Royale', players: 1248 },
    { name: 'Blackjack Pro', players: 1248 },
    { name: 'Slots Mania', players: 1248 },
    { name: 'Poker Stars', players: 1248 },
    { name: 'Baccarat Elite', players: 1248 },
    { name: 'Craps Champion', players: 1248 },
    { name: 'Texas Holdem', players: 1248 },
    { name: 'Dice Master', players: 1248 },
    { name: 'Virtual Sports', players: 1248 },
    { name: 'Wheel of Fortune', players: 1248 }
  ]

  const cardData = [
    'What is Peejayy all about?',
    'How does peejayy standout from others?',
    'What is the possibility we won\'t have dash?',
    'Is Peejayy staying longer?',
    'How secure is Peejayy?',
    'What support do we get?'
  ]

  return (
    <div className="p-4 sm:p-6 text-white max-w-screen-xl mx-auto">
      {/* Available Games */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold mb-6 ml-1">Available Games</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {availableGames.map((game, index) => (
            <div
              key={index}
              onClick={() => router.push(`/games/${game.name.toLowerCase()}`)}
              className="cursor-pointer w-full h-[80px] rounded-[20px] border border-white/10 bg-[#212121] flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition"
            >
              <Image
                src={game.image}
                alt={game.name}
                width={70}
                height={70}
                className="object-cover"
              />
              <div className="flex flex-col items-end">
                <h3 className="font-medium">{game.name}</h3>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-xs text-gray-400">
                    {game.players.toLocaleString()} playing
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Games */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4 ml-2">
          <Image src="/assets/casino.svg" alt="casino logo" width={24} height={24} />
          <h2 className="text-xl font-bold">Trending Games</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {trendingGames.map((game, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-full max-w-[205px] h-[166px] p-3 bg-[#212121] border border-white/10 rounded-[16px] relative hover:bg-[#2a2a2a] transition">
                <div className="absolute top-2 left-2 w-[30px] h-[30px] bg-[#C8A2FF] rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="font-medium mt-3 text-center">{game.name}</h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <span className="text-xs text-gray-400">
                  {game.players.toLocaleString()} playing
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Wins */}
      <LiveWinsSection />

      {/* FAQs */}
      <section className="mt-20 flex flex-col md:flex-row gap-10">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-[#C8A2FF] max-w-fit text-white font-medium px-3 py-1 rounded-[10px] text-sm mb-4">
            FAQs
          </div>
          <h3 className="text-2xl font-semibold mb-2">Why use 44-wagr for gaming</h3>
          <p className="text-gray-400 text-base mb-6 max-w-md">
            Lorem ipsum dolor sit amet consectetur. Ac iaculis in nullam etiam. At non cursus
          </p>
          <button className="w-fit px-4 py-2 rounded-full bg-[#C8A2FF] text-white text-sm font-medium hover:bg-gray-700 transition">
            Start Free Trial
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {cardData.map((text, index) => (
            <div
              key={index}
              className="w-full h-[50px] bg-[#212121] rounded-[10px] flex items-center justify-between px-4 text-white border border-white/10 shadow-sm"
            >
              <span className="text-sm font-semibold">{text}</span>
              <ChevronDown size={20} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
