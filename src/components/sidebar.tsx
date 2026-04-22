"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Hand,
  Layers2,
} from "lucide-react";
import { TbBalloon, TbGraph } from "react-icons/tb";
import { RxDashboard } from "react-icons/rx";
import { RiNftLine, RiTrafficLightLine } from "react-icons/ri";
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
  const [mobileSheetMounted, setMobileSheetMounted] = useState(false);
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const [sheetDragging, setSheetDragging] = useState(false);
  const sheetDragActiveRef = useRef(false);
  const sheetTranslateRef = useRef(0);
  const sheetDragStartY = useRef(0);

  useEffect(() => {
    sheetTranslateRef.current = sheetTranslateY;
  }, [sheetTranslateY]);
  const gamesAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileSheetMounted(true);
  }, []);

  const closeMobileGamesSheet = () => {
    sheetDragActiveRef.current = false;
    sheetTranslateRef.current = 0;
    setSheetDragging(false);
    setSheetTranslateY(0);
    setMobileGamesOpen(false);
  };

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
      image: "/assets/gamesV2/plinko2.png",
      icon: <LoaderPinwheel className="w-3 h-3" />,
      href: "/games/plinko",
    },
    {
      name: "Mines",
      image: "/assets/gamesV2/mines2.png",
      icon: <Bomb className="w-3 h-3" />,
      href: "/games/mines",
    },
    {
      name: "Pump",
      image: "/assets/gamesV2/pump2.png",
      icon: <TbBalloon className="w-3 h-3" />,
      href: "/games/pump",
    },
    {
      name: "Red Light",
      image: "/assets/gamesV2/red-light2.png",
      icon: <RiTrafficLightLine className="w-3 h-3" />,
      href: "/games/redlight",
    },
    {
      name: "RPS",
      image: "/assets/gamesV2/rps2.png",
      icon: <Hand className="w-3 h-3" />,
      href: "/games/rps",
    },
    {
      name: "Glass",
      image: "/assets/gamesV2/glass-bridge2.png",
      icon: <Layers2 className="w-3 h-3" />,
      href: "/games/glass",
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
                    <div className="absolute left-[calc(100%+10px)] top-0 z-50 min-w-[200px] max-w-[min(260px,calc(100vw-96px))] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl">
                      <p className="border-b border-white/10 px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                        Games
                      </p>
                      <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain px-2 py-2">
                        <div className="flex flex-col gap-0.5">
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
                  setMobileGamesOpen((prev) => {
                    if (prev) {
                      sheetTranslateRef.current = 0;
                      setSheetTranslateY(0);
                      sheetDragActiveRef.current = false;
                      setSheetDragging(false);
                    }
                    return !prev;
                  });
                }}
                className={`flex flex-col items-center justify-center transition ${
                  pathname.startsWith("/games") ? "text-[#C8A2FF]" : "text-white/60"
                }`}
              >
                {item.icon}
                <span className="text-xs">Games</span>
              </button>
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

      {mobileSheetMounted &&
        mobileGamesOpen &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] cursor-default border-0 bg-black/60 backdrop-blur-[3px] lg:hidden"
              aria-label="Close games"
              onClick={closeMobileGamesSheet}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Pick a game"
              className="fixed inset-x-3 bottom-0 z-[110] flex h-[min(78dvh,560px)] max-h-[min(78dvh,560px)] flex-col overflow-hidden rounded-t-[1.25rem] border border-white/10 border-b-0 bg-[#131313] shadow-[0_-28px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/5 lg:hidden"
              style={{
                transform: `translateY(${sheetTranslateY}px)`,
                transition: sheetDragging ? "none" : "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <div
                data-mobile-games-drag
                className="shrink-0 cursor-grab touch-none px-4 pb-2 pt-3 active:cursor-grabbing"
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  sheetDragActiveRef.current = true;
                  setSheetDragging(true);
                  sheetDragStartY.current = e.clientY - sheetTranslateRef.current;
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!sheetDragActiveRef.current) return;
                  const next = Math.max(0, e.clientY - sheetDragStartY.current);
                  sheetTranslateRef.current = next;
                  setSheetTranslateY(next);
                }}
                onPointerUp={(e) => {
                  const wasActive = sheetDragActiveRef.current;
                  sheetDragActiveRef.current = false;
                  setSheetDragging(false);
                  try {
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                  } catch {
                    /* duplicate release */
                  }
                  if (!wasActive) return;
                  const dismissAt = Math.min(120, typeof window !== "undefined" ? window.innerHeight * 0.18 : 120);
                  if (sheetTranslateRef.current > dismissAt) {
                    closeMobileGamesSheet();
                  } else {
                    sheetTranslateRef.current = 0;
                    setSheetTranslateY(0);
                  }
                }}
                onPointerCancel={(e) => {
                  sheetDragActiveRef.current = false;
                  setSheetDragging(false);
                  sheetTranslateRef.current = 0;
                  setSheetTranslateY(0);
                  try {
                    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                  } catch {
                    /* noop */
                  }
                }}
              >
                <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/30" />
                <p className="text-center text-[15px] font-semibold tracking-tight text-white">Games</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] [touch-action:pan-y]">
                <div className="grid grid-cols-3 gap-2.5 pb-1 sm:gap-3">
                  {gamesList.map((game) => (
                    <button
                      key={game.name}
                      type="button"
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        handleGameSelect(game.href);
                      }}
                      className={`group overflow-hidden rounded-2xl border text-left shadow-lg transition active:scale-[0.98] ${
                        pathname === game.href
                          ? "border-[#C8A2FF] bg-[#C8A2FF]/12 ring-2 ring-[#C8A2FF]/35"
                          : "border-white/10 bg-[#1c1c1c] active:border-white/25"
                      }`}
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-black/80 to-[#252525]">
                        <Image
                          src={game.image}
                          alt={game.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 30vw, 140px"
                          unoptimized
                        />
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-2.5">
                        <span className="text-[#C8A2FF] shrink-0">{game.icon}</span>
                        <span className="text-xs font-medium text-white/95 truncate">{game.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
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
