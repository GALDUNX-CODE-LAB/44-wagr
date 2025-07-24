// hooks/useAutoAuth.ts
import { useAccount, useSignMessage } from 'wagmi'
import { requestNonce, verifySignature } from '../api/auth'
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

  useEffect(() => {
    const checkAuth = async () => {
      if (!isConnected || !address) return
      
      // Skip if already authenticated
      if (localStorage.getItem('access-token')) {
        setIsAuthenticated(true)
        return
      }

      setIsLoading(true)
      try {
        // 1. Get nonce
        const { message } = await requestNonce(address)
        
        // 2. Sign message
        const signature = await signMessageAsync({
          account: address,
          message: message as SignableMessage,
        })
        
        // 3. Verify signature
        const { accessToken } = await verifySignature(address, signature)
        
        // Store token and update state
        localStorage.setItem('access-token', accessToken)
        setIsAuthenticated(true)
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Authentication failed')
        console.error('Auto-auth error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isConnected, address, signMessageAsync])

  return { isAuthenticated, isLoading, error: authError }
}