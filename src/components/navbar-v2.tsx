"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Bell, MessageSquare, Coins, Lock, CreditCard, Settings, LogOut, LogOutIcon } from "lucide-react";
import Image from "next/image";
import WalletModal from "./wallet-modal";
import TransactionsModal from "./transactions-modal";
import PointsModal from "./points-modal";
import AffiliateModal from "./affiliate-modal";
import LoginModal from "./login-modal";
import { AccountSettingsModal } from "./account-settings";
import { useAccount, useDisconnect } from "wagmi";
import { logout } from "../lib/api/auth";
import { getCookie } from "../lib/api/cookie";
import { useRouter } from "next/navigation";

export default function NavbarV2() {
  const [focused, setFocused] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [switchMode, setSwitchMode] = useState(false);
  const [accountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false);

  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  const authMethod: any = "token";
  const router = useRouter();

  const handleLoginModalClose = () => {
    setLoginModalOpen(false);
    setSwitchMode(false);
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getCookie("access-token");
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <>
      <div className="wrap relative h-[65px] w-full" />
      <div className="lg:w-[calc(100vw-220px)] w-full h-[66px] bg-[#212121] fixed top-0 z-50">
        <nav className="w-full h-full sm:border-b border-white/15  text-white flex items-center justify-between px-6 py-3">
          <div className="wrap lg:hidden max-h-[70px]" onClick={() => router.push("/")}>
            <Image src={"/assets/44.png"} alt="44-wager" width={70} height={70} />
          </div>
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="flex h-[30px] items-center border border-white/20 rounded-md px-3 py-2">
              <Search className="w-4 h-4 mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none flex-1 text-xs"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-primary/20 text-sm rounded-lg px-0 p-1">
                <div className="relative rounded-lg w-4 h-4 flex items-center justify-center ml-2">
                  <Image src="/assets/usdt.png" alt="USDT" fill className="object-contain" />
                </div>
                <span className="truncate">0.00</span>
                <button
                  className="bg-primary text-black p-1 px-2 rounded-lg text-l"
                  onClick={() => setWalletModalOpen(true)}
                >
                  <small>Wallet</small>
                </button>
              </div>
              <Coins className="w-5 h-5 text-yellow-500 cursor-pointer" onClick={() => setPointsModalOpen(true)} />
              <div className="relative">
                <User className="w-5 h-5 cursor-pointer" onClick={() => setUserDropdownOpen(!userDropdownOpen)} />
                {userDropdownOpen && (
                  <div
                    className="absolute top-12 right-0 z-50 w-[220px] rounded-[10px] border border-[#FFFFFF33] bg-white text-black shadow-xl"
                    role="menu"
                  >
                    <div className="absolute -top-1 right-1 w-3 h-3 bg-white rotate-45 border-t border-l border-[#FFFFFF33]" />
                    <div className="p-4 flex flex-col gap-3 text-sm font-medium">
                      <div className="text-xs text-gray-500 border-b border-gray-200 pb-2">
                        Logged in with:{" "}
                        {authMethod === "wallet" ? "MetaMask" : authMethod === "token" ? "Google" : "Unknown"}
                        {isConnected && (
                          <div className="mt-1 text-green-600">
                            Wallet: {address?.slice(0, 6)}...
                            {address?.slice(-4)}
                          </div>
                        )}
                      </div>
                      <button
                        className="flex items-center cursor-pointer gap-2 hover:text-[#C8A2FF] transition text-xs"
                        onClick={() => setAccountSettingsModalOpen(true)}
                      >
                        <Lock className="w-3 h-3" />
                        Account Settings
                      </button>
                      <button
                        className="flex items-center cursor-pointer gap-2 hover:text-[#C8A2FF] transition text-xs"
                        onClick={() => setTransactionsModalOpen(true)}
                      >
                        <CreditCard className="w-3 h-3" />
                        Transactions
                      </button>
                      <button
                        className="flex items-center cursor-pointer gap-2 hover:text-[#C8A2FF] transition text-xs"
                        onClick={() => setAffiliateModalOpen(true)}
                      >
                        <Settings className="w-3 h-3" />
                        Affiliate
                      </button>
                      <button
                        className="flex items-center cursor-pointer gap-2 mt-2 text-red-500 hover:text-red-600 text-xs"
                        onClick={() => logout()}
                      >
                        <LogOutIcon className="w-3 h-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="wrap hidden lg:block">
                <div className="min-h-5 min-w-5 rounded-full relative bg-white" />
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <>
              <div className="wrap" onClick={() => setLoginModalOpen(true)}>
                <button className="bg-primary text-black rounded-lg text-sm p-2 px-3">Login</button>
              </div>
            </>
          )}
        </nav>
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 bg-black p-6 z-10"
            >
              <div className="grid grid-cols-8 gap-4">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="h-20 bg-[#111] rounded-md"></div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <TransactionsModal open={transactionsModalOpen} onClose={() => setTransactionsModalOpen(false)} />
      <PointsModal open={pointsModalOpen} onClose={() => setPointsModalOpen(false)} />
      <AffiliateModal open={affiliateModalOpen} onClose={() => setAffiliateModalOpen(false)} />
      <LoginModal open={loginModalOpen} onClose={handleLoginModalClose} switchMode={switchMode} />
      <AccountSettingsModal open={accountSettingsModalOpen} onClose={() => setAccountSettingsModalOpen(false)} />
    </>
  );
}
