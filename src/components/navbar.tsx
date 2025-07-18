'use client'

import { useState } from 'react'
import {
  Search,
  Calendar,
  Bell,
  Menu,
  X,
  Bitcoin,
  Wallet,
  Lock,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react'
import Image from 'next/image'
import WalletModal from './wallet-modal'
import TransactionsModal from './transactions-modal'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false)

  return (
    <>
      <nav className="w-full border-b border-white/15 bg-transparent sm:bg-[#212121] relative z-20 transition-colors duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-13 py-4 sm:flex sm:justify-end sm:pl-[35%]">

          {/* ✅ Mobile Layout */}
          <div className="flex items-center justify-between sm:hidden w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-md  hover:text-white transition"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6" />}
            </button>
            <ConnectButton />
          </div>

          {/* ✅ Desktop Layout */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 text-white/40 min-w-[300px] max-w-[350px] flex-grow">
              <Search className="w-5 h-5 shrink-0" />
              <input
                type="text"
                placeholder="Find users, submission etc"
                className="bg-transparent outline-none text-sm placeholder-white/40 text-white w-full"
              />
            </div>

            {/* Date */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 text-white/40 text-sm">
              <Calendar className="w-5 h-5" />
              <span className="hidden md:inline">31.11.2024 - 25.5.2025</span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => setWalletModalOpen(true)}
              className="w-[180px] h-10 rounded-full flex items-center justify-between text-white/40 text-sm px-4"
              style={{
                background: '#1C1C1C',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-center gap-1">
                <Bitcoin className="w-4 h-4 text-yellow-400" />
                <span>0.0867</span>
              </div>
              <div className="w-px h-5 bg-white/20 mx-2" />
              <Wallet className="w-4 h-4" />
            </button>

            {/* Connect Wallet Button */}
            <ConnectButton />

            {/* Notification */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/40">
              <Bell className="w-4 h-4" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-10 h-10 rounded-full"
              >
                <Image
                  src="/assets/user.png"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute top-12 right-0 z-50 w-[200px] rounded-[10px] border border-[#FFFFFF33] bg-white text-black shadow-xl">
                  <div className="absolute -top-2 right-4 w-3 h-3 bg-white rotate-45 border-t border-l border-[#FFFFFF33]" />
                  <div className="p-4 flex flex-col gap-3 text-sm font-medium">
                    <div className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer">
                      <Lock className="w-4 h-4" />
                      Reset Password
                    </div>
                    <div
                      className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer"
                      onClick={() => setTransactionsModalOpen(true)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Transactions
                    </div>
                    <div className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-red-500 hover:text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Wallet Modal */}
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />

      {/* Transactions Modal */}
      <TransactionsModal open={transactionsModalOpen} onClose={() => setTransactionsModalOpen(false)} />
    </>
  )
}
