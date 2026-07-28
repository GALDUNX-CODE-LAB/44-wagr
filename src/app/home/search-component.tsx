"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaCircle } from "react-icons/fa";

import { fetchOriginalsPlayerCounts } from "../../lib/api";

const SEARCH_CATEGORIES = ["Originals", "Trending", "Slots", "Dice"];

const ALL_GAMES = [
  { name: "Crash", key: "crash" as const, image: "/assets/gamesV2/crash2.png", link: "/games/crash" },
  { name: "Dice", key: "dice" as const, image: "/assets/gamesV2/dice2.png", link: "/games/dice" },
  { name: "Coin", key: "coin" as const, image: "/assets/gamesV2/coinflip2.png", link: "/games/coin" },
  { name: "Wheel", key: "wheel" as const, image: "/assets/gamesV2/wheels2.png", link: "/games/wheel" },
];

export default function GameSearch() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(SEARCH_CATEGORIES[0]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: playerCounts } = useQuery({
    queryKey: ["originals-player-counts"],
    queryFn: fetchOriginalsPlayerCounts,
    refetchInterval: 30000,
  });

  const gamesWithPlayers = ALL_GAMES.map((g) => ({
    ...g,
    players: playerCounts ? playerCounts[g.key] : 0,
  }));

  const filtered = gamesWithPlayers.filter((game) =>
    game.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectGame = (game: (typeof gamesWithPlayers)[0]) => {
    try {
      const stored = localStorage.getItem("continue-playing");
      let parsed: typeof ALL_GAMES = stored ? JSON.parse(stored) : [];
      parsed = parsed.filter((g) => g.link !== game.link);
      parsed.unshift(game);
      localStorage.setItem("continue-playing", JSON.stringify(parsed));
    } catch {
      // ignore
    }
    setOpen(false);
    setQuery("");
    router.push(game.link);
  };

  return (
    <div className="w-full mx-auto mt-3 relative py-2" ref={containerRef}>
      <div className="flex items-center bg-secondary border border-white/10 rounded-lg px-3 py-2">
        <div className="flex items-center px-2 py-1 rounded-md bg-primary shrink-0">
          <span className="text-sm font-medium text-black">{selectedCategory}</span>
        </div>
        <div className="flex items-center flex-1 ml-3">
          <Search className="w-4 h-4 text-white/50 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search games..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="bg-transparent flex-1 text-sm text-white placeholder-white/50 outline-none min-w-0"
          />
        </div>
        {open && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear and close"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-2 w-full bg-secondary border border-white/10 rounded-lg p-4 z-10 shadow-lg">
          {filtered.length === 0 ? (
            <p className="text-white/60 text-sm">No results found for &quot;{query}&quot;</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-4">
              {filtered.map((game, i) => (
                <button
                  key={game.key}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition text-left"
                >
                  <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 33vw, 100px"
                      unoptimized
                    />
                  </div>
                  <div className="p-2 text-white/70">
                    <p className="text-white text-xs font-semibold truncate">{game.name}</p>
                    <p className="text-xs flex gap-2 items-center mt-0.5">
                      <FaCircle size={8} className="text-green-400 shrink-0" />
                      {game.players.toLocaleString()} playing
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
