'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import DepositModal from './deposit-modal'
import { WalletCoin } from '../interfaces/interface'

interface WalletModalProps {
  open: boolean
  onClose: () => void
}

const topCoins: WalletCoin[] = [
  { name: 'Bitcoin', symbol: 'btc', icon: '/icons/btc.svg' },
  { name: 'Ethereum', symbol: 'eth', icon: '/icons/eth.svg' },
  { name: 'Tether', symbol: 'usdt', icon: '/icons/usdt.svg' },
  { name: 'BNB', symbol: 'bnb', icon: '/icons/bnb.svg' },
  { name: 'Solana', symbol: 'sol', icon: '/icons/sol.svg' },
  { name: 'XRP', symbol: 'xrp', icon: '/icons/xrp.svg' },
  { name: 'Cardano', symbol: 'ada', icon: '/icons/ada.svg' },
  { name: 'Dogecoin', symbol: 'doge', icon: '/icons/doge.svg' },
  { name: 'Polkadot', symbol: 'dot', icon: '/icons/dot.svg' },
  { name: 'USDC', symbol: 'usdc', icon: '/icons/usdc.svg' },
]

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const [selectedCoin, setSelectedCoin] = useState<WalletCoin | null>(null)

  if (!open) return null

  return (
    <>
      {/* Token Selector Modal */}
      {!selectedCoin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#1C1C1C] text-white rounded-xl w-full max-w-[540px] p-4 sm:p-6 border border-white/10 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-6 text-center">Choose Token to Deposit</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {topCoins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin)}
                  className="h-[60px] rounded-[13px] border border-[#FFFFFF1A] bg-[#1C1C1C] flex items-center justify-center gap-2 hover:border-[#C8A2FF] transition px-2"
                >
                  <Image src={coin.icon} alt={coin.name} width={24} height={24} />
                  <span className="text-white text-sm">{coin.name}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-white/60 text-center leading-relaxed px-2">
              There is no mechanism to withdraw deposited funds. All funds must be used to purchase.
            </p>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {selectedCoin && (
        <DepositModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </>
  )
}
