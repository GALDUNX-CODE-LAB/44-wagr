// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { Search, Flag, Bell, X, Wallet, Lock, CreditCard, Settings, LogOut } from "lucide-react";
// import { RiMenu4Line } from "react-icons/ri";
// import Image from "next/image";
// import WalletModal from "./wallet-modal";
// import TransactionsModal from "./transactions-modal";
// import PointsModal from "./points-modal";
// import AffiliateModal from "./affiliate-modal";
// import LoginModal from "./login-modal";
// import { logout } from "../lib/api/auth";
// import { useDisconnect, useAccount, useBalance } from "wagmi";
// // import { useAuth } from "../lib/api/useAuth";
// import { AccountSettingsModal } from "./account-settings";

// export default function Navbar() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
//   const [walletModalOpen, setWalletModalOpen] = useState(false);
//   const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
//   const [pointsModalOpen, setPointsModalOpen] = useState(false);
//   const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
//   const [loginModalOpen, setLoginModalOpen] = useState(false);
//   const [switchMode, setSwitchMode] = useState(false);
//   const [accountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false);

//   const { disconnect } = useDisconnect();
//   const { address, isConnected } = useAccount();
//   const { isAuthenticated, isLoading, authMethod } = useAuth();

//   const {
//     data: ethBalance,
//     isError,
//     isLoading: balanceLoading,
//   } = useBalance({
//     address: address,
//   });

//   const formatBalance = useCallback(() => {
//     if (!isConnected || !ethBalance) {
//       return "0.0000";
//     }
//     const formatted = parseFloat(ethBalance.formatted).toFixed(4);
//     return formatted;
//   }, [isConnected, ethBalance]);

//   const displayBalance = formatBalance();

//   const handleLogout = async () => {
//     await logout(disconnect);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };

//   const openWallet = () => {
//     setWalletModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };
//   const openTx = () => {
//     setTransactionsModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };
//   const openPoints = () => {
//     setPointsModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };
//   const openAffiliate = () => {
//     setAffiliateModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };
//   const openAccountSettings = () => {
//     setAccountSettingsModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };
//   const openLogin = () => {
//     if (isAuthenticated) {
//       return;
//     }
//     setSwitchMode(false);
//     setLoginModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };
//   const openSwitchModal = () => {
//     setSwitchMode(true);
//     setLoginModalOpen(true);
//     setSidebarOpen(false);
//     setUserDropdownOpen(false);
//   };

//   const handleLoginModalClose = () => {
//     setLoginModalOpen(false);
//     setSwitchMode(false);
//   };

//   return (
//     <>
//       <nav className="w-[calc(100vw-220px)] h-[65px] fixed sm:border-b border-white/15  sm:bg-[#212121] z-20 transition-colors duration-300 right-0">
//         <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-13 py-4 sm:flex sm:justify-end sm:pl-[35%]">
//           <div className="flex items-center justify-between sm:hidden w-full">
//             <div className="flex items-center gap-2">
//               <Image src="/assets/44.png" alt="Logo" width={60} height={28} className="rounded" />
//             </div>
//             <button
//               onClick={() => setSidebarOpen((v) => !v)}
//               className="w-10 h-10 rounded-md cursor-pointer text-white hover:text-[#C8A2FF] transition"
//               aria-label="Toggle menu"
//             >
//               {sidebarOpen ? <X className="w-6 h-6" /> : <RiMenu4Line className="w-6 h-6" />}
//             </button>
//           </div>

//           {sidebarOpen && (
//             <div className="sm:hidden mt-4 bg-[#1C1C1C] border border-white/15 rounded-lg p-4 text-white space-y-4">
//               {isLoading ? (
//                 <div className="animate-pulse space-y-3">
//                   <div className="h-9 bg-white/10 rounded" />
//                   <div className="h-9 bg-white/10 rounded" />
//                   <div className="h-9 bg-white/10 rounded" />
//                 </div>
//               ) : (
//                 <>
//                   <button
//                     className="flex items-center cursor-pointer bg-[#c8a2ff] gap-2 px-3 py-2 rounded-full border border-white/20 text-black text-sm w-full"
//                     onClick={openPoints}
//                   >
//                     <Flag className="w-5 h-5" />
//                     <span>Daily/Social Point</span>
//                   </button>

//                   <button
//                     onClick={openWallet}
//                     className="w-full h-10 rounded-full cursor-pointer flex items-center justify-between text-white/90 text-sm px-4 border border-white/20 bg-[#1C1C1C]"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
//                         <Image width={20} height={20} src="/assets/usdt.png" alt="USDT" />
//                       </div>
//                       <span>{balanceLoading ? "..." : displayBalance}</span>
//                     </div>
//                     <div className="w-px h-5 bg-white/20 mx-2" />
//                     <Wallet className="w-4 h-4" />
//                   </button>

//                   {isConnected && (
//                     <div className="text-xs text-green-400 px-3">
//                       Wallet Connected: {address?.slice(0, 6)}...
//                       {address?.slice(-4)}
//                     </div>
//                   )}

//                   {isAuthenticated ? (
//                     <>
//                       <div className="text-xs text-white/60 px-3">
//                         Logged in with:{" "}
//                         {authMethod === "wallet" ? "MetaMask" : authMethod === "token" ? "Google" : "Unknown"}
//                       </div>

//                       <div className="grid grid-cols-2 gap-3">
//                         <button
//                           onClick={openTx}
//                           className="flex items-center cursor-pointer justify-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm"
//                         >
//                           <CreditCard className="w-4 h-4" />
//                           Transactions
//                         </button>

//                         <button
//                           onClick={openAffiliate}
//                           className="flex items-center cursor-pointer justify-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm"
//                         >
//                           <Settings className="w-4 h-4" />
//                           Affiliate
//                         </button>
//                       </div>

//                       <div className="grid grid-cols-2 gap-3">
//                         <button className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2 rounded-full border border-white/20 bg-white/5 text-sm">
//                           <Bell className="w-4 h-4" />
//                           Alerts
//                         </button>
//                         <button
//                           onClick={openSwitchModal}
//                           className="flex items-center cursor-pointer justify-center gap-2 px-3 py-2 rounded-full border border-blue-400/30 text-blue-400 text-sm bg-blue-400/10"
//                         >
//                           Switch
//                         </button>
//                       </div>

//                       <button
//                         onClick={handleLogout}
//                         className="w-full flex items-center cursor-pointer justify-center gap-2 px-3 py-2 rounded-full border border-red-400/30 text-red-400 text-sm bg-red-400/10"
//                       >
//                         <LogOut className="w-4 h-4" />
//                         Logout
//                       </button>
//                     </>
//                   ) : (
//                     <button
//                       className="flex items-center  justify-center cursor-pointer bg-[#c8a2ff] gap-2 px-3 py-2 rounded-full border border-white/20 text-black text-sm w-full"
//                       onClick={openLogin}
//                     >
//                       <span>Login</span>
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>
//           )}

//           <div className="hidden sm:flex items-center gap-3">
//             <button
//               className="flex items-center cursor-pointer gap-2 px-3 bg-[#fff] whitespace-nowrap text-xs py-2 rounded-full border border-white/20 text-black"
//               onClick={openPoints}
//             >
//               <Flag size={15} />
//               <span className="hidden md:inline">Daily/Social Point</span>
//             </button>

//             <button
//               onClick={openWallet}
//               className="w-[200px] h-10 rounded-full cursor-pointer flex items-center justify-between text-white/90 text-sm px-4"
//               style={{
//                 background: "#1C1C1C",
//                 border: "1px solid rgba(255, 255, 255, 0.2)",
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 <div className="relative rounded-full w-6 h-6 flex items-center justify-center">
//                   <Image src="/assets/usdt.png" alt="USDT" fill className="object-contain" />
//                 </div>
//                 <span className="truncate">{balanceLoading ? "..." : displayBalance}</span>
//               </div>
//               <div className="w-px h-5 bg-white/20 mx-2" />
//               <Wallet className="w-4 h-4" />
//             </button>

//             {isAuthenticated ? (
//               <>
//                 <button
//                   onClick={openSwitchModal}
//                   className="flex items-center gap-2 cursor-pointer px-3 bg-white/0 whitespace-nowrap text-xs py-2 rounded-full border border-transparent text-white/80 hover:text-white hover:border-white/20"
//                   title={`Switch from ${authMethod === "wallet" ? "MetaMask" : "Google"}`}
//                 >
//                   Switch
//                 </button>
//                 <div className="relative">
//                   <button
//                     onClick={() => setUserDropdownOpen((v) => !v)}
//                     className="w-10 h-10 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
//                     aria-haspopup="menu"
//                     aria-expanded={userDropdownOpen}
//                   >
//                     <Image src="/assets/user.png" alt="User" width={40} height={40} className="rounded-full" />
//                   </button>

//                   {userDropdownOpen && (
//                     <div
//                       className="absolute top-12 right-0 z-50 w-[220px] rounded-[10px] border border-[#FFFFFF33] bg-white text-black shadow-xl"
//                       role="menu"
//                     >
//                       <div className="absolute -top-2 right-4 w-3 h-3 bg-white rotate-45 border-t border-l border-[#FFFFFF33]" />
//                       <div className="p-4 flex flex-col gap-3 text-sm font-medium">
//                         <div className="text-xs text-gray-500 border-b border-gray-200 pb-2">
//                           Logged in with:{" "}
//                           {authMethod === "wallet" ? "MetaMask" : authMethod === "token" ? "Google" : "Unknown"}
//                           {isConnected && (
//                             <div className="mt-1 text-green-600">
//                               Wallet: {address?.slice(0, 6)}...
//                               {address?.slice(-4)}
//                             </div>
//                           )}
//                         </div>
//                         <button
//                           className="flex items-center cursor-pointer gap-2 hover:text-[#C8A2FF] transition"
//                           onClick={openAccountSettings}
//                         >
//                           <Lock className="w-4 h-4" />
//                           Account Settings
//                         </button>
//                         <button
//                           className="flex items-center cursor-pointer gap-2 hover:text-[#C8A2FF] transition"
//                           onClick={openTx}
//                         >
//                           <CreditCard className="w-4 h-4" />
//                           Transactions
//                         </button>
//                         <button
//                           className="flex items-center cursor-pointer gap-2 hover:text-[#C8A2FF] transition"
//                           onClick={openAffiliate}
//                         >
//                           <Settings className="w-4 h-4" />
//                           Affiliate
//                         </button>
//                         <button
//                           className="flex items-center cursor-pointer gap-2 mt-2 text-red-500 hover:text-red-600"
//                           onClick={handleLogout}
//                         >
//                           <LogOut className="w-4 h-4" />
//                           Logout
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <button
//                 className="flex items-center gap-2 cursor-pointer px-3 bg-[#c8a2ff] whitespace-nowrap text-xs py-2 rounded-full border border-white/20 text-black"
//                 onClick={openLogin}
//               >
//                 <span>Login</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </nav>

//       <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
//       <TransactionsModal open={transactionsModalOpen} onClose={() => setTransactionsModalOpen(false)} />
//       <PointsModal open={pointsModalOpen} onClose={() => setPointsModalOpen(false)} />
//       <AffiliateModal open={affiliateModalOpen} onClose={() => setAffiliateModalOpen(false)} />
//       <LoginModal open={loginModalOpen} onClose={handleLoginModalClose} switchMode={switchMode} />
//       <AccountSettingsModal open={accountSettingsModalOpen} onClose={() => setAccountSettingsModalOpen(false)} />
//     </>
//   );
// }
