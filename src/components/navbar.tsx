"use client";

import { useState } from "react";
import { Search, Flag, Bell, X, Bitcoin, Wallet, Lock, CreditCard, Settings, LogOut } from "lucide-react";
import { RiMenu4Line } from "react-icons/ri";
import Image from "next/image";
import WalletModal from "./wallet-modal";
import TransactionsModal from "./transactions-modal";
import PointsModal from "./points-modal";
import AffiliateModal from "./affiliate-modal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { logout } from "../lib/api/auth";
import { useDisconnect } from 'wagmi'; 

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
  const { disconnect } = useDisconnect();


  return (
    <>
      <nav className="w-full sm:border-b border-white/15 bg-transparent sm:bg-[#212121] relative z-20 transition-colors duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-13 py-4 sm:flex sm:justify-end sm:pl-[35%]">
          {/* ✅ Mobile Layout Trigger */}
          <div className="flex items-center justify-between sm:hidden w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-md text-white hover:text-[#C8A2FF] transition"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <RiMenu4Line className="w-6 h-6" />}
            </button>
            <ConnectButton />
          </div>

          {/* ✅ Mobile Menu Content */}
          {sidebarOpen && (
            <div className="sm:hidden mt-4 bg-[#1C1C1C] border border-white/15 rounded-lg p-4 text-white space-y-4">
              {/* Search */}
              {/* <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 text-white/40 w-full">
                <Search className="w-5 h-5 shrink-0" />
                <input
                  type="text"
                  placeholder="Find users, submission etc"
                  className="bg-transparent outline-none text-sm placeholder-white/40 text-white w-full"
                />
              </div> */}

              {/* Date Range */}
              <button
                className="flex items-center cursor-pointer bg-[#c8a2ff] gap-2 px-3 py-2 rounded-full border border-white/20 text-black text-sm w-full"
                onClick={() => setAffiliateModalOpen(true)}
              >
                <Flag className="w-5 h-5" />
                <span>Daily/Social Point</span>
              </button>

              {/* Wallet */}
              <button
                onClick={() => {
                  setWalletModalOpen(true);
                  setSidebarOpen(false);
                }}
                className="w-full h-10 rounded-full flex items-center justify-between text-white/40 text-sm px-4 border border-white/20 bg-[#1C1C1C]"
              >
                <div className="flex items-center gap-1">
                  <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
                    <Bitcoin className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span>0.0867</span>
                </div>
                <div className="w-px h-5 bg-white/20 mx-2" />
                <Wallet className="w-4 h-4" />
              </button>

              {/* Connect Button
              <ConnectButton /> */}

              {/* Notification */}
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/40">
                <Bell className="w-4 h-4" />
              </button>

              {/* Profile Menu */}
              <div className="space-y-3 pt-2">
                <div
                  className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer"
                  onClick={() => {
                    setTransactionsModalOpen(true);
                    setSidebarOpen(false);
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                  Transactions
                </div>
                <div
                  className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer"
                  onClick={() => {
                    setAffiliateModalOpen(true);
                    setSidebarOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Affiliate
                </div>
                <div className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer">
                  <Lock className="w-4 h-4" />
                  Reset Password
                </div>
                <div className="flex items-center gap-2 text-red-500 hover:text-red-600 cursor-pointer " onClick={() => logout(disconnect)}
>
                  <LogOut className="w-4 h-4" />
                  Logout
                </div>
              </div>
            </div>
          )}

          {/* ✅ Desktop Layout */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Search */}
            {/* <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 text-white/40 min-w-[300px] max-w-[350px] flex-grow">
              <Search className="w-5 h-5 shrink-0" />
              <input
                type="text"
                placeholder="Find users, submission etc"
                className="bg-transparent outline-none text-sm placeholder-white/40 text-white w-full"
              />
            </div> */}

            {/* Date */}
            <button
              className="flex items-center gap-2 px-3 bg-[#fff] whitespace-nowrap text-xs  py-2 rounded-full border border-white/20 text-black"
              onClick={() => setPointsModalOpen(true)}
            >
              <Flag size={15} />
              <span className="hidden md:inline">Daily/Social Point</span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => setWalletModalOpen(true)}
              className="w-[180px] h-10 rounded-full flex items-center justify-between text-white/40 text-sm px-4"
              style={{
                background: "#1C1C1C",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-1">
                <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
                </div>
                <span>0.0867</span>
              </div>
              <div className="w-px h-5 bg-white/20 mx-2" />
              <Wallet className="w-4 h-4" />
            </button>

            {/* Connect Wallet */}
            <ConnectButton />

            {/* Notification */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white/40">
              <Bell className="w-4 h-4" />
            </button>

            {/* User Avatar Dropdown */}
            <div className="relative">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="w-10 h-10 rounded-full">
                <Image src="/assets/user.png" alt="User" width={40} height={40} className="rounded-full" />
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
                    <div
                      className="flex items-center gap-2 hover:text-[#C8A2FF] transition cursor-pointer"
                      onClick={() => setAffiliateModalOpen(true)}
                    >
                      <Settings className="w-4 h-4" />
                      Affiliate
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => logout(disconnect)}
>
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

      {/* Modals */}
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <TransactionsModal open={transactionsModalOpen} onClose={() => setTransactionsModalOpen(false)} />
      <PointsModal open={pointsModalOpen} onClose={() => setPointsModalOpen(false)} />
      <AffiliateModal open={affiliateModalOpen} onClose={() => setAffiliateModalOpen(false)} />
    </>
  );
}
