"use client"

import Image from "next/image"
import { Bitcoin } from "lucide-react"
import { Winner } from "../../../interfaces/interface"

interface RecentWinnersProps {
  winners?: Winner[];
}

const defaultWinners: Winner[] = [
  { username: "CryptoKing", price: "$2,500", avatar: "/assets/nft2.png" },
  { username: "NFTCollector", price: "$1,800", avatar: "/assets/nft3.png" },
  { username: "DigitalArt", price: "$3,200", avatar: "/assets/nft4.png" },
  { username: "MetaVerse", price: "$1,500", avatar: "/assets/nft5.png" },
]

export default function RecentWinners({ winners = defaultWinners }: RecentWinnersProps) {
  return (
    <div className="w-full max-w-[600px] max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-6 mx-auto flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Recent Winners</h2>
      </div>

      <div className="bg-[#c8a2ff]/50 rounded-[5px] h-[40px] w-full mb-5" />

      <div className="space-y-4 flex-grow overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium text-white/65">Player</span>
          <span className="text-sm font-medium text-white/65">Price</span>
        </div>

        {/* Winners List */}
        {winners.map((winner, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-[#1C1C1C]/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={winner.avatar || "/placeholder.svg"}
                  width={32}
                  height={32}
                  className="object-cover"
                  alt={winner.username}
                />
              </div>
              <div>
                <p className="font-medium">{winner.username}</p>
              </div>
            </div>

            <div className="text-right flex gap-2">
              <p className="font-bold text-white">{winner.price}</p>
              <div className="bg-yellow-400 rounded-full w-5 h-5 flex mt-0.5 items-center justify-center">
                <Bitcoin className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}