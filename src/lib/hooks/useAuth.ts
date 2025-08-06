// hooks/useAuth.ts
import { useAccount, useSignMessage } from 'wagmi'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { SignableMessage } from 'viem'
import { setAuthTokens, clearAuthTokens } from '../api/auth'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  authMethod: 'wallet' | 'token' | null
}

export const useAuth = () => {
  const { address, isConnected } = useAccount()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    authMethod: null,
  })
  
  // Prevent multiple simultaneous auth attempts
  const authAttemptRef = useRef(false)

  const { signMessageAsync } = useSignMessage({
    mutation: {
      onError: (error) => {
        setAuthState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }))
      },
    },
  })

  // Helper function to validate tokens
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
      const VALIDATE_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_VALIDATE_ENDPOINT
      
      if (!API_BASE || !VALIDATE_ENDPOINT) return false

      const response = await fetch(`${API_BASE}${VALIDATE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      
      return response.ok
    } catch {
      return false
    }
  }, [])

  // Helper function to refresh tokens
  const refreshAuthTokens = useCallback(async (): Promise<AuthTokens | null> => {
    try {
      const refreshToken = localStorage.getItem('refresh-token')
      if (!refreshToken) return null

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
      const REFRESH_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_REFRESH_ENDPOINT
      
      if (!API_BASE || !REFRESH_ENDPOINT) return null

      const response = await fetch(`${API_BASE}${REFRESH_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return null

      const tokens = await response.json()
      return tokens
    } catch {
      return null
    }
  }, [])

  const disconnect = useCallback(() => {
    clearAuthTokens()
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authMethod: null,
    })
  }, [])

  // Check and validate existing authentication
  const checkExistingAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('access-token')
    if (!token) return false

    // Validate token
    const isValid = await validateToken(token)
    if (isValid) {
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticated: true, 
        authMethod: 'token' 
      }))
      return true
    }

    // Try to refresh if validation fails
    const newTokens = await refreshAuthTokens()
    if (newTokens) {
      setAuthTokens(newTokens.accessToken, newTokens.refreshToken)
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticated: true, 
        authMethod: 'token' 
      }))
      return true
    }

    // Clear invalid tokens
    disconnect()
    return false
  }, [validateToken, refreshAuthTokens, disconnect])

  // Wallet authentication
  const authenticateWallet = useCallback(async () => {
    if (authAttemptRef.current || !address) return
    
    authAttemptRef.current = true
    setAuthState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }))

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
      const NONCE_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_NONCE_ENDPOINT
      const VERIFY_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_VERIFY_ENDPOINT

      if (!API_BASE || !NONCE_ENDPOINT || !VERIFY_ENDPOINT) {
        throw new Error('API endpoints not configured')
      }

      // 1. Request nonce
      const nonceResponse = await fetch(`${API_BASE}${NONCE_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!nonceResponse.ok) {
        throw new Error(`Failed to fetch nonce: ${nonceResponse.statusText}`)
      }
      
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

      if (!verifyResponse.ok) {
        throw new Error(`Signature verification failed: ${verifyResponse.statusText}`)
      }
      
      const { accessToken, refreshToken } = await verifyResponse.json()

      // Use utility function to set tokens and dispatch event
      setAuthTokens(accessToken, refreshToken)
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authMethod: 'wallet',
      })
    } catch (err) {
      console.error('Wallet authentication error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        authMethod: null,
      }))
      disconnect()
    } finally {
      authAttemptRef.current = false
    }
  }, [address, signMessageAsync, disconnect])

  // Main authentication effect
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      // First check for existing valid auth
      const hasValidAuth = await checkExistingAuth()
      if (!isMounted || hasValidAuth) return

      // If wallet is connected but no valid auth, attempt wallet auth
      if (isConnected && address) {
        await authenticateWallet()
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [isConnected, address, checkExistingAuth, authenticateWallet])

  // Poll for token changes (fallback for Google auth)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    // Only poll when not authenticated to detect new logins
    if (!authState.isAuthenticated) {
      pollInterval = setInterval(() => {
        const token = localStorage.getItem('access-token')
        if (token) {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            authMethod: 'token',
          }))
        }
      }, 1000) // Check every second
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [authState.isAuthenticated])
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access-token') {
        const hasToken = !!e.newValue
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: hasToken,
          authMethod: hasToken ? 'token' : null,
        }))
      }
    }

    // Listen for custom events (for same-tab Google auth)
    const handleAuthChange = () => {
      const token = localStorage.getItem('access-token')
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: !!token,
        authMethod: token ? 'token' : null,
      }))
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  // Manual authentication method for external use
  const authenticate = useCallback(async () => {
    if (isConnected && address) {
      await authenticateWallet()
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Wallet not connected' 
      }))
    }
  }, [isConnected, address, authenticateWallet])

  // Force refresh authentication state
  const refreshAuthState = useCallback(() => {
    const token = localStorage.getItem('access-token')
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: !!token,
      authMethod: token ? 'token' : null,
    }))
  }, [])

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    authMethod: authState.authMethod,
    disconnect,
    authenticate,
    refreshTokens: refreshAuthTokens,
    refreshAuthState, // Export this for manual refresh
  }
}