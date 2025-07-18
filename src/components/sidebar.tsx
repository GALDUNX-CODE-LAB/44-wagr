'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home,
  Gamepad2,
  Target,
  Ticket,
  ShoppingCart
} from 'lucide-react'
import { TbCards } from "react-icons/tb";
import { RxDashboard } from "react-icons/rx";
import { TbGraph } from "react-icons/tb";
import { RiNftLine } from "react-icons/ri";

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState('Home page')

  useEffect(() => {
    if (pathname.startsWith('/games')) setActiveItem('Games')
    else if (pathname.startsWith('/bets')) setActiveItem(' My Bets')
    else if (pathname.startsWith('/nft-lottery')) setActiveItem('Nft Lottery')
    else if (pathname.startsWith('/meta-market')) setActiveItem('Meta Market')
    else setActiveItem('Home page')
  }, [pathname])

  const navItems = [
    { href: '/home', icon: <RxDashboard className="w-6 h-6" />, key: 'Home page' },
    { href: '/games', icon: <Gamepad2 className="w-6 h-6" />, key: 'Games' },
    { href: '/bets', icon: <TbCards className="w-6 h-6" />, key: 'My Bets' },
    { href: '/nft-lottery', icon: <RiNftLine className="w-6 h-6" />, key: 'Nft Lottery' },
    { href: '/meta-market', icon: <TbGraph className="w-6 h-6" />, key: 'Meta Market' },
    { href: '/bets', icon: <TbCards className="w-6 h-6" />, key: 'Bets' },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:block fixed h-full w-[245px] border-r border-white/10 bg-[#212121]"
        style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div className="flex flex-col px-6 gap-1 pt-25">
          {navItems.map((item) => (
            <SidebarItem
              key={item.key}
              label={item.key.replace('-', ' ')}
              icon={item.icon}
              active={activeItem === item.key}
              onClick={() => router.push(item.href)}
            />
          ))}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-5 backdrop-blur-sm rounded-full p-3 flex justify-around items-center left-0 right-0 z-50 lg:hidden  border-[#FFFFFF0F] bg-[#212121]  h-[96px] px-2 ">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex flex-col items-center justify-center h-full transition ${
                isActive ? 'text-[#C8A2FF]' : 'text-white/60'
              }`}
            >
              <div className="w-full flex justify-center items-center">
                {item.icon}
              </div>
              <div
                className="w-full h-1 mt-2 rounded-full bg-[#C8A2FF] transition-all duration-300"
                style={{ visibility: isActive ? 'visible' : 'hidden' }}
              />
            </button>
          )
        })}
      </nav>
    </>
  )
}

function SidebarItem({
  label,
  icon,
  active,
  onClick
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'w-[175px] h-[36px] bg-[#C8A2FF] text-black'
          : 'text-white/70 hover:bg-white/10'
      }`}
    >
      {icon}
      <span className="text-sm font-medium text-white/40">{label}</span>
    </button>
  )
}
