'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface TransactionsModalProps {
  open: boolean
  onClose: () => void
}

const tabs = ['Deposit', 'Withdrawal']

export default function TransactionsModal({ open, onClose }: TransactionsModalProps) {
  const [activeTab, setActiveTab] = useState('Deposit')

  if (!open) return null

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
                  activeTab === tab
                    ? 'bg-[#212121] text-white font-semibold'
                    : 'text-white/40'
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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold text-white mb-4">
            {activeTab} History
          </h2>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-white border-collapse">
              <thead>
                <tr>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Transaction Hash</th>
                  <th className="py-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((row, idx) => (
                  <tr
                    key={row}
                    className={idx % 2 === 0 ? 'bg-[#1c1c1c]' : 'bg-[#212121]'}
                  >
                    <td className="py-3 px-2 whitespace-nowrap">2025-07-13</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Successful
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono truncate">
                      0xABCDEF1234567890abcdef
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">0.25 BTC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
