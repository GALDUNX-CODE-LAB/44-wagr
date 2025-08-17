"use client";

import { useState } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import Image from "next/image";
import { FaCircle } from "react-icons/fa";

const categories = ["Originals", "Trending", "Slots", "Dice"];

const mockResults = [
  { name: "Roulette Royale", players: 1248, image: "/assets/games/crash.png" },
  { name: "Blackjack Pro", players: 1248, image: "/assets/games/coin-flip.png" },
  { name: "Slots Mania", players: 1248, image: "/assets/games/Dice.png" },
  { name: "Poker Stars", players: 1248, image: "/assets/games/glass-bridge.png" },
  { name: "Baccarat Elite", players: 1248, image: "/assets/games/mine.png" },
  { name: "Craps Champion", players: 1248, image: "/assets/games/Plinko.png" },
  { name: "Texas Holdem", players: 1248, image: "/assets/games/pump.png" },
  { name: "Dice Master", players: 1248, image: "/assets/games/red-light.png" },
  { name: "Virtual Sports", players: 1248, image: "/assets/games/rock.png" },
  { name: "Wheel of Fortune", players: 1248, image: "/assets/games/wheels.png" },
];

export default function GameSearch() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [open, setOpen] = useState(false);

  const filtered = mockResults.filter((game) => game.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-full bg-black/20 mx-auto mt-6 relative py-6 lg:p-6">
      <div className="flex items-center bg-secondary border border-white/10 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#243441] cursor-pointer">
          <span className="text-sm text-white">{selectedCategory}</span>
          <ChevronDown className="w-4 h-4 text-white/70" />
        </div>
        <div className="flex items-center flex-1 ml-3">
          <Search className="w-4 h-4 text-white/50 mr-2" />
          <input
            type="text"
            placeholder="Search games..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
            }}
            className="bg-transparent flex-1 text-sm text-white placeholder-white/50 outline-none"
          />
        </div>
        {open && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-2 w-full bg-secondary border border-white/10 rounded-lg p-4 z-10">
          {filtered.length === 0 ? (
            <p className="text-white/60 text-sm">No results found</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-4">
              {filtered.map((game, i) => (
                <div key={i} className="rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition">
                  <div className="relative w-full h-40">
                    <Image src={game.image} alt={game.name} fill className="object-cover" />
                  </div>
                  <div className="p-2 text-white/70">
                    {/* <p className="text-white text-xs font-semibold">{game.name}</p> */}
                    <p className="text-xs flex gap-2 items-center">
                      <FaCircle size={10} className="text-green-400 " />
                      {game.players} playing
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
