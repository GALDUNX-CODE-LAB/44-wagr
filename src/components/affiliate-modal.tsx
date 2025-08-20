"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fetchReferralStats } from "../lib/api";

export default function AffiliateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    totalEarnings: number;
    totalReferralDeposit: number;
  } | null>(null);

  const referralLink = "44//http/ref2345...bets";
  const referralCode = "XYZ123";

  const tableData = [
    { username: "john_doe", date: "2024-07-10", referrals: 5, earnings: "$100.00" },
    { username: "sara88", date: "2024-07-11", referrals: 2, earnings: "$45.00" },
    { username: "mike21", date: "2024-07-12", referrals: 4, earnings: "$85.00" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const getReferralStats = async () => {
      try {
        const res = await fetchReferralStats();
        if (res.success) {
          setReferralStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch referral stats:", err);
      }
    };

    if (open) getReferralStats();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-2 sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-[#1C1C1C] text-white rounded-t-xl sm:rounded-xl w-full sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-white/10"
          >
            {/* Close btn */}
            <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Header Card */}
            <div className="w-full bg-[#212121] border border-white/10 rounded-[20px] p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-2xl font-medium text-white">Refer and Earn</h2>
                <p className="text-xs sm:text-sm text-white/65">
                  Earn commission for all bets placed by your referrals across Casino and Sportsbook.
                </p>

                <div className="flex gap-4 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {referralStats ? referralStats.totalReferrals : "--"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/50">Total Referrals</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {referralStats ? `$${referralStats.totalEarnings}` : "--"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/50">Total Earnings</p>
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {referralStats ? `$${referralStats.totalReferralDeposit}` : "--"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/50">Total Referral Deposit</p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block">
                <Image src="/assets/icon.svg" alt="Affiliate illustration" width={160} height={160} />
              </div>
            </div>

            {/* Referral Card */}
            <div className="w-full bg-[#212121] border border-white/10 rounded-[20px] p-4 sm:p-5 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-xs sm:text-base text-white/65 font-medium max-w-lg">
                Ready to earn commission? Tap the &apos;Copy Referral Link&apos; button and share your default campaign.
              </p>

              <div className="flex flex-col items-end w-full sm:w-auto gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-white/65 bg-[#1c1c1c] rounded-lg border border-white/10 text-[10px] sm:text-sm font-mono px-2 py-1 sm:px-3 sm:py-2 truncate max-w-[160px] sm:max-w-[200px]">
                    {referralLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black text-[10px] sm:text-xs font-light rounded-lg px-3 sm:px-4 py-1 sm:py-2 transition whitespace-nowrap"
                  >
                    {copied ? <Check className="w-3 h-3" /> : "Copy Link"}
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-white/65 font-normal text-right w-full">
                  <span className="font-semibold">Code:</span> {referralCode}
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-[#212121] border border-white/10 rounded-[20px] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Stats and Referrals</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                  <thead className="text-white/60">
                    <tr>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Username</th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Date</th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Referrals</th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? "bg-[#1C1C1C]" : "bg-[#212121]"} text-white`}>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">{row.username}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-white/70">{row.date}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">{row.referrals}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">{row.earnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
