// hooks/useAuth.ts
import { useAccount, useSignMessage } from 'wagmi'
import { useEffect, useState } from 'react'
import type { SignableMessage } from 'viem'

export const useAuth = () => {
  const { address, isConnected } = useAccount()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { signMessageAsync } = useSignMessage({
    mutation: {
      onError: (error) => setAuthError(error.message),
    },
  })

  const disconnect = () => {
    localStorage.removeItem('access-token')
    localStorage.removeItem('refresh-token')
    setIsAuthenticated(false)
  }

  useEffect(() => {
    const authenticate = async () => {
      if (!isConnected || !address) return

      const token = localStorage.getItem('access-token')
      if (token) {
        setIsAuthenticated(true)
        return
      }

      setIsLoading(true)
      setAuthError(null)

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
        const NONCE_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_NONCE_ENDPOINT
        const VERIFY_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_VERIFY_ENDPOINT

        if (!API_BASE || !NONCE_ENDPOINT || !VERIFY_ENDPOINT)
          throw new Error('API endpoints not set in environment variables.')

        // 1. Request nonce
        const nonceResponse = await fetch(`${API_BASE}${NONCE_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        })

        if (!nonceResponse.ok) throw new Error('Failed to fetch nonce')
        const { message } = await nonceResponse.json()

        // 2. Sign message
        const signature = await signMessageAsync({
          account: address,
          message: message as SignableMessage,
        })

        // 3. Verify signature
        const verifyResponse = await fetch(`${API_BASE}${VERIFY_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address.toLowerCase(),
            signature,
          }),
        })

        if (!verifyResponse.ok) throw new Error('Signature verification failed')
        const { accessToken, refreshToken } = await verifyResponse.json()

        localStorage.setItem('access-token', accessToken)
        localStorage.setItem('refresh-token', refreshToken)
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Auth error:', err)
        setAuthError(err instanceof Error ? err.message : 'Authentication failed')
        disconnect()
      } finally {
        setIsLoading(false)
      }
    }

    authenticate()
  }, [isConnected, address])

  return {
    isAuthenticated,
    isLoading,
    error: authError,
    disconnect,
  }
}
