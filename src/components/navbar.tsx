"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Flag, Bell, X, Wallet, Lock, CreditCard, Settings, LogOut } from "lucide-react";
import { RiMenu4Line } from "react-icons/ri";
import Image from "next/image";
import WalletModal from "./wallet-modal";
import TransactionsModal from "./transactions-modal";
import PointsModal from "./points-modal";
import AffiliateModal from "./affiliate-modal";
import LoginModal from "./login-modal";
import { logout } from "../lib/api/auth";
import { useDisconnect } from "wagmi";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // auth state derived from localStorage
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const { disconnect } = useDisconnect();

  const refreshAuth = useCallback(() => {
    try {
      const t = localStorage.getItem("access-token");
      setIsAuthed(!!t);
    } catch {
      setIsAuthed(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access-token") refreshAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshAuth]);

  const handleLogout = async () => {
    await logout(disconnect);
    refreshAuth();
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  };

  // Reusable actions (close menus after click)
  const openWallet = () => {
    setWalletModalOpen(true);
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  };
  const openTx = () => {
    setTransactionsModalOpen(true);
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  };
  const openPoints = () => {
    setPointsModalOpen(true);
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  };
  const openAffiliate = () => {
    setAffiliateModalOpen(true);
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  };
  const openLogin = () => {
    setLoginModalOpen(true);
    setSidebarOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      <nav className="w-full sm:border-b border-white/15 bg-transparent sm:bg-[#212121] relative z-20 transition-colors duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-13 py-4 sm:flex sm:justify-end sm:pl-[35%]">
          {/* MOBILE TOP BAR */}
          <div className="flex items-center justify-between sm:hidden w-full">
            <div className="flex items-center gap-2">
              <Image src="/assets/44.png" alt="Logo" width={60} height={28} className="rounded" />
            </div>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="w-10 h-10 rounded-md text-white hover:text-[#C8A2FF] transition"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <RiMenu4Line className="w-6 h-6" />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {sidebarOpen && (
            <div className="sm:hidden mt-4 bg-[#1C1C1C] border border-white/15 rounded-lg p-4 text-white space-y-4">
              {/* If auth state still resolving, show a quick placeholder */}
              {isAuthed === null ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-9 bg-white/10 rounded" />
                  <div className="h-9 bg-white/10 rounded" />
                  <div className="h-9 bg-white/10 rounded" />
                </div>
              ) : (
                <>
                  {/* Daily/Social Points */}
                  <button
                    className="flex items-center cursor-pointer bg-[#c8a2ff] gap-2 px-3 py-2 rounded-full border border-white/20 text-black text-sm w-full"
                    onClick={openPoints}
                  >
                    <Flag className="w-5 h-5" />
                    <span>Daily/Social Point</span>
                  </button>

                  {/* Wallet (always visible for quick peek) */}
                  <button
                    onClick={openWallet}
                    className="w-full h-10 rounded-full flex items-center justify-between text-white/90 text-sm px-4 border border-white/20 bg-[#1C1C1C]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
                        <Image width={20} height={20} src="/assets/usdt.png" alt="USDT" />
                      </div>
                      <span>0.0867</span>
                    </div>
                    <div className="w-px h-5 bg-white/20 mx-2" />
                    <Wallet className="w-4 h-4" />
                  </button>

                  {/* Auth-dependent actions */}
                  {isAuthed ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={openTx}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Transactions
                        </button>

                        <button
                          onClick={openAffiliate}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          Affiliate
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm">
                          <Bell className="w-4 h-4" />
                          Alerts
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm">
                          <Lock className="w-4 h-4" />
                          Reset Password
                        </button>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-red-400/30 text-red-400 text-sm bg-red-400/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center justify-center cursor-pointer bg-[#c8a2ff] gap-2 px-3 py-2 rounded-full border border-white/20 text-black text-sm w-full"
                      onClick={openLogin}
                    >
                      <span>Login</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* DESKTOP */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-3 bg-[#fff] whitespace-nowrap text-xs py-2 rounded-full border border-white/20 text-black"
              onClick={openPoints}
            >
              <Flag size={15} />
              <span className="hidden md:inline">Daily/Social Point</span>
            </button>

            <button
              onClick={openWallet}
              className="w-[180px] h-10 rounded-full flex items-center justify-between text-white/90 text-sm px-4"
              style={{ background: "#1C1C1C", border: "1px solid rgba(255, 255, 255, 0.2)" }}
            >
              <div className="flex items-center gap-2">
                <div className="relative rounded-full w-6 h-6 flex items-center justify-center">
                  <Image src="/assets/usdt.png" alt="USDT" fill className="object-contain" />
                </div>
                <span>0.0867</span>
              </div>
              <div className="w-px h-5 bg-white/20 mx-2" />
              <Wallet className="w-4 h-4" />
            </button>

            {isAuthed ? (
              <>
                <button
                  onClick={openLogin}
                  className="flex items-center gap-2 px-3 bg-white/0 whitespace-nowrap text-xs py-2 rounded-full border border-transparent text-white/80 hover:text-white hover:border-white/20"
                  title="Switch account"
                >
                  Switch
                </button>
                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen((v) => !v)}
                    className="w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-haspopup="menu"
                    aria-expanded={userDropdownOpen}
                  >
                    <Image src="/assets/user.png" alt="User" width={40} height={40} className="rounded-full" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute top-12 right-0 z-50 w-[220px] rounded-[10px] border border-[#FFFFFF33] bg-white text-black shadow-xl"
                      role="menu"
                    >
                      <div className="absolute -top-2 right-4 w-3 h-3 bg-white rotate-45 border-t border-l border-[#FFFFFF33]" />
                      <div className="p-4 flex flex-col gap-3 text-sm font-medium">
                        <button className="flex items-center gap-2 hover:text-[#C8A2FF] transition" onClick={() => {}}>
                          <Lock className="w-4 h-4" />
                          Reset Password
                        </button>
                        <button className="flex items-center gap-2 hover:text-[#C8A2FF] transition" onClick={openTx}>
                          <CreditCard className="w-4 h-4" />
                          Transactions
                        </button>
                        <button
                          className="flex items-center gap-2 hover:text-[#C8A2FF] transition"
                          onClick={openAffiliate}
                        >
                          <Settings className="w-4 h-4" />
                          Affiliate
                        </button>
                        <button
                          className="flex items-center gap-2 mt-2 text-red-500 hover:text-red-600"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                className="flex items-center gap-2 px-3 bg-[#c8a2ff] whitespace-nowrap text-xs py-2 rounded-full border border-white/20 text-black"
                onClick={openLogin}
              >
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <TransactionsModal open={transactionsModalOpen} onClose={() => setTransactionsModalOpen(false)} />
      <PointsModal open={pointsModalOpen} onClose={() => setPointsModalOpen(false)} />
      <AffiliateModal open={affiliateModalOpen} onClose={() => setAffiliateModalOpen(false)} />
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
