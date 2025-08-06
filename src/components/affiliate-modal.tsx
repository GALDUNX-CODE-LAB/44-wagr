'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { fetchReferralStats } from '../lib/api';

export default function AffiliateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    totalEarnings: number;
    totalReferralDeposit: number;
  } | null>(null);

  const referralLink = '44//http/ref2345...bets';
  const referralCode = 'XYZ123';

  const tableData = [
    { username: 'john_doe', date: '2024-07-10', referrals: 5, earnings: '$100.00' },
    { username: 'sara88', date: '2024-07-11', referrals: 2, earnings: '$45.00' },
    { username: 'mike21', date: '2024-07-12', referrals: 4, earnings: '$85.00' },
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
        console.error('Failed to fetch referral stats:', err);
      }
    };

    if (open) getReferralStats();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[900px] p-6 border border-white/10 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Card */}
        <div className="w-full h-auto bg-[#212121] border border-white/10 rounded-[20px] p-4 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-medium text-white">Refer and Earn</h2>
            <p className="text-sm text-white/65">
              Earn commission for all bets placed by your referrals across Casino and Sportsbook.
            </p>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-2xl font-bold text-white">
                  {referralStats ? referralStats.totalReferrals : '--'}
                </p>
                <p className="text-xs text-white/50">Total Referrals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {referralStats ? `$${referralStats.totalEarnings}` : '--'}
                </p>
                <p className="text-xs text-white/50">Total Earnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {referralStats ? `$${referralStats.totalReferralDeposit}` : '--'}
                </p>
                <p className="text-xs text-white/50">Total Referral Deposit</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:block">
            <Image
              src="/assets/icon.svg"
              alt="Affiliate illustration"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Referral Card */}
        <div className="w-full bg-[#212121] border border-white/10 rounded-[20px] p-5 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <p className="text-base text-white/65 font-medium max-w-lg">
            Ready to earn commission? Tap the &apos;Copy Referral Link&apos; button and share your default campaign.
          </p>

          <div className="flex flex-col items-end w-full lg:w-auto gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white/65 bg-[#1c1c1c] rounded-lg border border-white/10 text-sm font-mono px-3 py-2 truncate max-w-[200px]">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black text-[10px] font-light rounded-lg px-4 py-2 transition whitespace-nowrap"
              >
                {copied ? <Check className="w-3 h-3" /> : 'Copy Link'}
              </button>
            </div>

            <div className="text-sm text-white/65 font-normal text-right w-full">
              <span className="font-semibold">Code:</span> {referralCode}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-[#212121] border border-white/10 rounded-[20px] p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-1">Stats and Referrals</h3>
          </div>

          <table className="w-full text-sm">
            <thead className=" text-white/60">
              <tr>
                <th className="text-left px-4 py-3">Username</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Referrals</th>
                <th className="text-left px-4 py-3">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? 'bg-[#1C1C1C]' : 'bg-[#212121]'
                  } text-white`}
                >
                  <td className="px-4 py-3">{row.username}</td>
                  <td className="px-4 py-3 text-white/70">{row.date}</td>
                  <td className="px-4 py-3">{row.referrals}</td>
                  <td className="px-4 py-3">{row.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
