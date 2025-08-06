"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchUserTransactions } from "../lib/api";

interface TransactionsModalProps {
  open: boolean;
  onClose: () => void;
}

interface Transaction {
  _id: string;
  userId: string;
  type: "Deposit" | "Withdrawal";
  amount: number;
  status: string;
  date: string;
}

const tabs: Array<"Deposit" | "Withdrawal"> = ["Deposit", "Withdrawal"];

export default function TransactionsModal({ open, onClose }: TransactionsModalProps) {
  const [activeTab, setActiveTab] = useState<"Deposit" | "Withdrawal">("Deposit");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetchUserTransactions();
        if (response?.data) {
          setTransactions(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [open]);

  if (!open) return null;

  const filtered = transactions.filter((tx) => tx.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1c1c1c] w-full max-w-[1080px] rounded-[20px] border border-white/10 p-4 relative flex flex-col lg:flex-row gap-4">
        {/* Left Tab Card */}
        <div className="w-full lg:w-[185px] h-auto lg:h-[203px] bg-[#212121] rounded-[20px] p-4">
          <div className="flex lg:flex-col gap-2 justify-between">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative text-sm text-white px-3 py-2 rounded w-full text-left ${
                  activeTab === tab ? "bg-[#212121] text-white font-semibold" : "text-white/40"
                }`}
              >
                {activeTab === tab && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C8A2FF] rounded-r" />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#212121] border border-[#FFFFFF0F] rounded-[20px] p-4 lg:p-6 overflow-auto max-h-[70vh] relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold text-white mb-4">{activeTab} History</h2>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-white border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left text-xs text-white/60">Date</th>
                  <th className="py-2 px-4 text-left text-xs text-white/60">Status</th>
                  <th className="py-2 px-4 text-left text-xs text-white/60">Transaction Hash</th>
                  <th className="py-2 px-4 text-right text-xs text-white/60">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-white/50">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-white/50">
                      No {activeTab.toLowerCase()} transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, idx) => (
                    <tr key={tx._id} className={idx % 2 === 0 ? "bg-[#1c1c1c]" : "bg-[#212121]"}>
                      <td className="py-6 px-4 text-sm whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-6 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tx.status === "Successful"
                                ? "bg-green-400"
                                : tx.status === "Pending"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          ></span>
                          {tx.status}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-sm font-mono truncate">—</td>
                      <td className="py-6 px-4 text-sm whitespace-nowrap text-right">
                        {tx.amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
