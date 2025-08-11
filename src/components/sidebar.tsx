"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Gamepad2, ArrowRightLeft, RefreshCcw, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { TbCards, TbGraph } from "react-icons/tb";
import { RxDashboard } from "react-icons/rx";
import { RiNftLine } from "react-icons/ri";
import { Dices } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("Home page");
  const [gamesOpen, setGamesOpen] = useState(false);
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/games")) {
      setActiveItem("Games");
      setGamesOpen(true);
    } else {
      setGamesOpen(false);
    }

    if (pathname.startsWith("/games")) setActiveItem("Games");
    else if (pathname.startsWith("/bets")) setActiveItem("My Bets");
    else if (pathname.startsWith("/nft-lottery")) setActiveItem("Nft Lottery");
    else if (pathname.startsWith("/meta-market")) setActiveItem("Meta Market");
    else setActiveItem("Home page");
  }, [pathname]);

  const gamesList = [
    {
      name: "Crash",
      icon: <Rocket className="w-4 h-4 rotate-[320deg]" />,
      href: "/games/crash",
    },
    {
      name: "Dice",
      icon: <Dices className="w-4 h-4" />,
      href: "/games/dice",
    },
    {
      name: "Coin",
      icon: <ArrowRightLeft className="w-4 h-4" />,
      href: "/games/coin",
    },
    {
      name: "Wheel",
      icon: <RefreshCcw className="w-4 h-4" />,
      href: "/games/wheel",
    },
  ];

  const navItems = [
    {
      href: "/home",
      icon: <RxDashboard className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "Home page",
    },
    {
      href: "/games",
      icon: <Gamepad2 className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "Games",
      hasDropdown: true,
    },
    {
      href: "/bets",
      icon: <TbCards className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "My Bets",
    },
    {
      href: "/nft-lottery",
      icon: <RiNftLine className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "Nft Lottery",
    },
    {
      href: "/meta-market",
      icon: <TbGraph className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "Meta Market",
    },
  ];

  const handleGameSelect = (gameHref) => {
    router.push(gameHref);
    setMobileGamesOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed h-full w-[245px] border-r border-white/10 bg-[#212121]">
        <div className="flex justify-center  py-2 mt-4 border-b border-white/20">
          <Image src={"/assets/44.png"} alt="44-wager" width={150} height={100} />
        </div>
        <div className="flex flex-col px-6 gap-1 pt-20">
          {navItems.map((item) =>
            item.hasDropdown ? (
              <div key={item.key}>
                <SidebarItem
                  label={item.key}
                  icon={item.icon}
                  active={activeItem === item.key}
                  hasDropdown={true}
                  isOpen={gamesOpen}
                  onClick={() => setGamesOpen((prev) => !prev)}
                />
                {gamesOpen && (
                  <div className="pl-8 flex flex-col gap-1 mt-2">
                    {gamesList.map((game) => (
                      <button
                        key={game.name}
                        onClick={() => handleGameSelect(game.href)}
                        className={`flex items-center gap-3 text-sm rounded px-3 py-2 transition-all ${
                          pathname === game.href ? "bg-[#C8A2FF] text-black" : "text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {game.icon}
                        {game.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <SidebarItem
                key={item.key}
                label={item.key}
                icon={item.icon}
                active={activeItem === item.key}
                onClick={() => router.push(item.href)}
              />
            )
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="rounded-t-[10px] fixed bottom-0 max-w-full mx-auto px-4 backdrop-blur-sm p-5 flex justify-around items-center left-0 right-0 z-50 lg:hidden border-[#FFFFFF0F] bg-[#212121] h-[120px]">
        {navItems.map((item) =>
          item.hasDropdown ? (
            <div key="Games" className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMobileGamesOpen((prev) => !prev);
                }}
                className={`flex flex-col items-center justify-center transition ${
                  pathname.startsWith("/games") ? "text-[#C8A2FF]" : "text-white/60"
                }`}
              >
                {item.icon}
                <span className="text-xs">Games</span>
              </button>
              {mobileGamesOpen && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setMobileGamesOpen(false)} />
                  <div className="absolute bottom-[80px] left-[-50px] w-40 bg-[#2e2e2e] rounded-md shadow-lg border border-white/10 py-2 z-50">
                    {gamesList.map((game) => (
                      <button
                        key={game.name}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleGameSelect(game.href);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-[#3a3a3a] transition-colors ${
                          pathname === game.href ? "bg-[#C8A2FF] text-black" : "text-white"
                        }`}
                      >
                        {game.icon}
                        {game.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center transition ${
                pathname.startsWith(item.href) ? "text-[#C8A2FF]" : "text-white/60"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.key.split(" ")[0]}</span>
            </button>
          )
        )}
      </nav>
    </>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  onClick,
  hasDropdown = false,
  isOpen = false,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  hasDropdown?: boolean;
  isOpen?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all ${
        active ? "w-[175px] h-[36px] bg-[#C8A2FF] !text-black" : "text-white/70 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {hasDropdown && (
        <div className="flex items-center">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      )}
    </button>
  );
}
