'use client'

import { ArrowUpRight, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import LiveWinsSection from '../../components/live-wins'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'
import type { SignableMessage } from 'viem'

export default function HomePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { signMessageAsync } = useSignMessage({
    mutation: {
      onError: (error) => {
        setAuthError(error.message)
        handleAuthFailure()
      },
    }
  })

  const availableGames = [
    { name: 'Crash', players: 1248, image: '/assets/icon.svg' },
    { name: 'Dice', players: 892, image: '/assets/icon.svg' },
    { name: 'Coin', players: 1532, image: '/assets/icon.svg' },
    { name: 'Wheel', players: 721, image: '/assets/icon.svg' }
  ]

  const trendingGames = [
    { name: 'Roulette Royale', players: 1248 },
    { name: 'Blackjack Pro', players: 1248 },
       { name: 'Slots Mania', players: 1248 },
    { name: 'Poker Stars', players: 1248 },
    { name: 'Baccarat Elite', players: 1248 },
    { name: 'Craps Champion', players: 1248 },
    { name: 'Texas Holdem', players: 1248 },
    { name: 'Dice Master', players: 1248 },
    { name: 'Virtual Sports', players: 1248 },
    { name: 'Wheel of Fortune', players: 1248 }
  ]

  const cardData = [
    'What is Peejayy all about?',
      'How does peejayy standout from others?',
    'What is the possibility we won\'t have dash?',
    'Is Peejayy staying longer?',
    'How secure is Peejayy?',
    'What support do we get?'
  ]

  const handleAuthFailure = () => {
    disconnect()
    localStorage.removeItem('access-token')
    setAuthToken(null)
  }

 const authenticateUser = async () => {
  if (!address) {
    console.error('No wallet address available');
    setAuthError('Wallet not connected');
    return;
  }

  setIsAuthenticating(true);
  setAuthError(null);

  try {
    console.log('[Auth] Starting authentication for:', address);

    // 1. Verify API URL
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_URL) throw new Error('API URL not configured');
    console.log('[Auth] Using API URL:', API_URL);

    // 2. Request nonce
    console.log('[Auth] Requesting nonce...');
    const nonceResponse = await fetch(`${API_URL}/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address })
    });

    if (!nonceResponse.ok) {
      const error = await nonceResponse.json();
      console.error('[Auth] Nonce request failed:', error);
      throw new Error(error.error || 'Failed to get nonce');
    }

    const { message: signingMessage, nonce } = await nonceResponse.json();
    console.log('[Auth] Received nonce:', nonce, 'Message:', signingMessage);

    // 3. Sign message
    console.log('[Auth] Requesting signature...');
    const signature = await signMessageAsync({
      account: address,
      message: signingMessage,
    });
    console.log('[Auth] Signature received:', signature);

    // 4. Verify signature
    console.log('[Auth] Verifying signature...');
    const verifyResponse = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: address.toLowerCase(),
        signature
      }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      console.error('[Auth] Verification failed:', {
        status: verifyResponse.status,
        error,
        sentData: {
          walletAddress: address.toLowerCase(),
          message: signingMessage
        }
      });
      throw new Error(error.error || 'Verification failed');
    }

    // 5. Store tokens
    const { accessToken, refreshToken } = await verifyResponse.json();
    console.log('[Auth] Authentication successful');
    
    localStorage.setItem('access-token', accessToken);
    localStorage.setItem('refresh-token', refreshToken);
    setAuthToken(accessToken);

  } catch (error) {
    console.error('[Auth] Full error context:', {
      error,
      address,
      timestamp: new Date().toISOString()
    });

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Authentication failed. Please try again.';
    
    setAuthError(errorMessage);
    handleAuthFailure();

    // Special handling for common errors
    if (errorMessage.includes('Signature mismatch')) {
      setAuthError('Wallet verification failed. Please reconnect your wallet.');
    }
  } finally {
    setIsAuthenticating(false);
  }
};

  useEffect(() => {
    const token = localStorage.getItem('access-token')
    if (token) {
      setAuthToken(token)
    } else if (isConnected && address) {
      authenticateUser()
    }
  }, [isConnected, address])

  const handleGameClick = (gameName: string) => {
    if (!authToken) {
      setAuthError('Please authenticate your wallet to play')
      return
    }
    router.push(`/games/${gameName.toLowerCase()}`)
  }

  return (
    <div className="p-4 sm:p-6 text-white max-w-screen-xl mx-auto">
      {/* Auth Header */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-3">
          {authToken ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Verified</span>
            </div>
          ) : authError ? (
            <div className="text-sm text-red-400 px-3 py-1 bg-red-500/10 rounded-full">
              {authError}
            </div>
          ) : null}
          
        </div>
      </div>

      {/* Hero Banner */}
      <div className='w-full h-[223px] bg-[#212121] rounded-[20px] border border-white/6 mb-8'>
        {/* Hero content */}
      </div>

      {/* Available Games */}
      <section className="mb-8">
        <h1 className="text-2xl font-normal text-[18px] text-white/50 mb-6 ml-1">Available Games</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {availableGames.map((game, index) => (
            <div
              key={index}
              onClick={() => handleGameClick(game.name)}
              className="cursor-pointer w-full h-[80px] rounded-[20px] border border-white/10 bg-[#212121] flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition"
            >
              <Image
                src={game.image}
                alt={game.name}
                width={70}
                height={70}
                className="object-cover"
              />
              <div className="flex flex-col items-end">
                <h3 className="font-medium text-white/70 text-sm">{game.name}</h3>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-xs text-white">
                    {game.players.toLocaleString()} playing
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Games */}
      <section className="mb-10 bg-[#212121] border border-[#ffffff]/6 rounded-[15px] p-5">
        <div className="flex items-center gap-2 mb-5 ml-1">
          <Image src="/assets/casino.svg" alt="casino logo" width={24} height={24} />
          <h2 className="text-[18px] font-medium">Trending Games</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {trendingGames.slice(0, 12).map((game, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="w-full h-[180px] p-3 bg-[#2c2c2c] border border-white/10 rounded-[16px] relative hover:bg-[#2a2a2a] transition">
                <div className="absolute top-2 left-2 w-6 h-6 bg-[#C8A2FF] rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3 text-black" />
                </div>
              </div>
              <h3 className="font-medium mt-3 text-left text-sm text-white">{game.name}</h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <span className="text-xs text-white/60">
                  {game.players.toLocaleString()} Playing
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-10'>
          <LiveWinsSection />
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-20 flex flex-col md:flex-row gap-10">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-[#C8A2FF] max-w-fit text-white font-medium px-3 py-1 rounded-[10px] text-sm mb-4">
            FAQs
          </div>
          <h3 className="text-2xl font-semibold mb-2">Why use 44-wagr for gaming</h3>
          <p className="text-gray-400 text-base mb-6 max-w-md">
            Lorem ipsum dolor sit amet consectetur. Ac iaculis in nullam etiam. At non cursus
          </p>
          <button className="w-fit px-4 py-2 rounded-full bg-[#C8A2FF] text-white text-sm font-medium hover:bg-[#D5B3FF] transition">
            Start Free Trial
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {cardData.map((text, index) => (
            <div
              key={index}
              className="w-full h-[50px] bg-[#212121] rounded-[10px] flex items-center justify-between px-4 text-white border border-white/10 shadow-sm"
            >
              <span className="text-sm font-semibold">{text}</span>
              <ChevronDown size={20} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}