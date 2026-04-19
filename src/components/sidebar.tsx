"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Gamepad2,
  ArrowRightLeft,
  RefreshCcw,
  Rocket,
  ChevronDown,
  ChevronUp,
  LoaderPinwheel,
  ChevronsLeft,
  ChevronsRight,
  Bomb,
} from "lucide-react";
import { TbBalloon, TbGraph } from "react-icons/tb";
import { RxDashboard } from "react-icons/rx";
import { RiNftLine } from "react-icons/ri";
import { Dices } from "lucide-react";
import Image from "next/image";
import { FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../lib/api/auth";
import { useSidebarCollapsed } from "./sidebar-collapsed-context";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const [activeItem, setActiveItem] = useState("Home page");
  const [gamesOpen, setGamesOpen] = useState(false);
  const [gamesPopoverOpen, setGamesPopoverOpen] = useState(false);
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);
  const gamesAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gamesPopoverOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = gamesAnchorRef.current;
      if (el && !el.contains(e.target as Node)) {
        setGamesPopoverOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [gamesPopoverOpen]);

  useEffect(() => {
    if (pathname.startsWith("/games")) {
      setActiveItem("Games");
      setGamesOpen(true);
    } else {
      setGamesOpen(false);
      setGamesPopoverOpen(false);
    }

    if (pathname.startsWith("/games")) setActiveItem("Games");
    else if (pathname.startsWith("/nft-lottery")) setActiveItem("Nft Lottery");
    else if (pathname.startsWith("/meta-market")) setActiveItem("Meta Market");
    else if (pathname.startsWith("/support")) setActiveItem("Support");
    else setActiveItem("Home page");
  }, [pathname]);

  useEffect(() => {
    if (collapsed) {
      setGamesOpen(false);
    } else if (pathname.startsWith("/games")) {
      setGamesOpen(true);
    }
  }, [collapsed, pathname]);

  const gamesList = [
    {
      name: "Crash",
      image: "/assets/gamesV2/crash2.png",
      icon: <Rocket className="w-3 h-3 rotate-[320deg]" />,
      href: "/games/crash",
    },
    {
      name: "Dice",
      image: "/assets/gamesV2/dice2.png",
      icon: <Dices className="w-3 h-3" />,
      href: "/games/dice",
    },
    {
      name: "Coin",
      image: "/assets/gamesV2/coinflip2.png",
      icon: <ArrowRightLeft className="w-3 h-3" />,
      href: "/games/coin",
    },
    {
      name: "Wheel",
      image: "/assets/gamesV2/wheels2.png",
      icon: <RefreshCcw className="w-3 h-3" />,
      href: "/games/wheel",
    },
    {
      name: "Plinko",
      image: "/assets/gamesV2/plinko.png",
      icon: <LoaderPinwheel className="w-3 h-3" />,
      href: "/games/plinko",
    },
    {
      name: "Mines",
      image: "/assets/gamesV2/mine.png",
      icon: <Bomb className="w-3 h-3" />,
      href: "/games/mines",
    },
    {
      name: "Pump",
      image: "/assets/gamesV2/pump.png",
      icon: <TbBalloon className="w-3 h-3" />,
      href: "/games/pump",
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
      href: "/nft-lottery",
      icon: <RiNftLine className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "Lottery",
    },
    {
      href: "/meta-market",
      icon: <TbGraph className="lg:w-[16px] lg:h-[16px] w-[28px] h-[18px]" />,
      key: "Meta Market",
    },
  ];

  const handleGameSelect = (gameHref: string) => {
    router.push(gameHref);
    setMobileGamesOpen(false);
    setGamesPopoverOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col justify-between fixed top-0 left-0 z-40 h-[100vh] shrink-0 overflow-visible border-r border-white/10 bg-[#212121] text-xs transition-[width] duration-200 ease-out ${
          collapsed ? "w-[72px]" : "w-[220px]"
        }`}
      >
        <div className="wrap min-h-0 flex flex-col overflow-visible">
          <div
            className={`flex shrink-0 items-center border-b border-white/20 mt-4 pb-3 ${
              collapsed ? "justify-center px-1" : "h-[50px] justify-between px-2"
            }`}
          >
            {!collapsed && (
              <div className="flex min-w-0 flex-1 justify-center">
                <Image
                  src="/assets/44.png"
                  alt="44-wager"
                  width={100}
                  height={50}
                  className="h-auto w-[100px] object-contain"
                />
              </div>
            )}
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((c) => !c)}
              className="flex shrink-0 items-center justify-center rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </button>
          </div>
          <div
            className={`flex flex-col gap-1 rounded-lg bg-black/20 m-2 p-2 ${collapsed ? "items-stretch px-1" : ""}`}
          >
            {navItems.map((item) =>
              item.hasDropdown ? (
                <div key={item.key} className="relative z-30" ref={gamesAnchorRef}>
                  <SidebarItem
                    label={item.key}
                    icon={item.icon}
                    active={activeItem === item.key}
                    collapsed={collapsed}
                    hasDropdown={!collapsed}
                    isOpen={collapsed ? gamesPopoverOpen : gamesOpen}
                    onClick={() => {
                      if (collapsed) {
                        setGamesPopoverOpen((prev) => !prev);
                      } else {
                        setGamesOpen((prev) => !prev);
                      }
                    }}
                  />
                  {!collapsed && gamesOpen && (
                    <div className="mt-2 flex flex-col gap-1 pl-8">
                      {gamesList.map((game) => (
                        <button
                          key={game.name}
                          type="button"
                          onClick={() => handleGameSelect(game.href)}
                          className={`flex items-center gap-3 rounded px-3 py-2 text-xs transition-all ${
                            pathname === game.href ? "bg-[#C8A2FF] text-black" : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          {game.icon}
                          <small>{game.name}</small>
                        </button>
                      ))}
                    </div>
                  )}
                  {collapsed && gamesPopoverOpen && (
                    <div className="absolute left-[calc(100%+10px)] top-1/2 z-50 min-w-[200px] max-w-[min(260px,calc(100vw-96px))] -translate-y-1/2 rounded-xl border border-white/10 bg-[#1a1a1a] py-2 shadow-xl">
                      <p className="border-b border-white/10 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                        Games
                      </p>
                      <div className="flex flex-col gap-0.5 px-2 pt-2">
                        {gamesList.map((game) => (
                          <button
                            key={game.name}
                            type="button"
                            onClick={() => handleGameSelect(game.href)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-all ${
                              pathname === game.href ? "bg-[#C8A2FF] text-black" : "text-white/80 hover:bg-white/10"
                            }`}
                          >
                            {game.icon}
                            <span>{game.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <SidebarItem
                  key={item.key}
                  label={item.key}
                  icon={item.icon}
                  active={activeItem === item.key}
                  collapsed={collapsed}
                  onClick={() => router.push(item.href)}
                />
              ),
            )}
          </div>
        </div>
        <div className="wrap relative flex flex-col justify-end p-2">
          <ul className={`mb-3 space-y-2 rounded-lg bg-black/20 ${collapsed ? "p-2" : "p-3"}`}>
            <li>
              <button
                type="button"
                title="Contact Support"
                aria-label="Contact Support"
                className={`flex w-full cursor-pointer items-center rounded-lg p-2 text-sm text-white/70 transition-colors hover:bg-white/10 ${
                  collapsed ? "justify-center" : "gap-3"
                }`}
                onClick={() => router.push("/support")}
              >
                <FaEnvelope className="shrink-0 text-base" />
                {!collapsed && <span>Contact Support</span>}
              </button>
            </li>
            <li>
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                className={`flex w-full cursor-pointer items-center rounded-lg p-2 text-sm text-red-400 transition-colors hover:bg-white/5 ${
                  collapsed ? "justify-center" : "gap-3"
                }`}
                onClick={() => logout()}
              >
                <FaSignOutAlt className="shrink-0 text-base" />
                {!collapsed && <span>Log out</span>}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="rounded-t-[10px] fixed bottom-0 max-w-full mx-auto px-4 backdrop-blur-sm p-5 flex justify-around items-center left-0 right-0 z-50 lg:hidden border-[#FFFFFF0F] bg-[#212121]">
        {navItems.map((item) =>
          item.hasDropdown ? (
            <div key={item.key} className="relative">
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
                  <div
                    className="fixed inset-0 z-[55] bg-black/60 lg:hidden"
                    aria-hidden
                    onClick={() => setMobileGamesOpen(false)}
                  />
                  <div
                    className="fixed inset-x-0 bottom-0 z-[60] lg:hidden flex flex-col rounded-t-2xl bg-[#1a1a1a] border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] max-h-[min(50vh,440px)] pt-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
                    role="dialog"
                    aria-label="Games"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mb-3 shrink-0" />
                    <p className="text-center text-sm font-semibold text-white mb-3 px-4 shrink-0">Games</p>
                    <div className="grid grid-cols-2 gap-3 px-4 pb-2 overflow-y-auto min-h-0 flex-1">
                      {gamesList.map((game) => (
                        <button
                          key={game.name}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleGameSelect(game.href);
                          }}
                          className={`rounded-xl overflow-hidden border text-left transition active:opacity-90 ${
                            pathname === game.href
                              ? "border-[#C8A2FF] bg-[#C8A2FF]/10"
                              : "border-white/10 bg-[#252525] hover:border-white/20"
                          }`}
                        >
                          <div className="relative aspect-[4/3] bg-black">
                            <Image
                              src={game.image}
                              alt={game.name}
                              fill
                              className="object-contain p-1"
                              sizes="(max-width: 768px) 50vw, 160px"
                              unoptimized
                            />
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-2">
                            <span className="text-[#C8A2FF] shrink-0">{game.icon}</span>
                            <span className="text-xs font-medium text-white truncate">{game.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
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
          ),
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
  collapsed = false,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  hasDropdown?: boolean;
  isOpen?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onClick}
      className={`my-2 flex w-full items-center rounded-lg transition-all ${
        collapsed ? "justify-center px-2 py-2.5" : "justify-between gap-3 px-4 py-2"
      } ${
        active
          ? collapsed
            ? "bg-[#C8A2FF] text-black"
            : "h-[36px] w-[175px] bg-[#C8A2FF] !text-black"
          : "text-white/70 hover:bg-white/10"
      }`}
    >
      <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        {icon}
        {!collapsed && <span className="text-xs font-medium">{label}</span>}
      </div>
      {hasDropdown && !collapsed && (
        <div className="flex items-center">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      )}
    </button>
  );
}
