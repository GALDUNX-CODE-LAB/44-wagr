import { useAccount, useSignMessage } from 'wagmi';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { SignableMessage } from 'viem';
import { setCookie, getCookie, removeCookie } from '../api/cookie';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authMethod: 'wallet' | 'token' | null;
}

export const useAuth = () => {
  const { address, isConnected, status } = useAccount();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    authMethod: null,
  });

  const authAttemptRef = useRef(false);

  const { signMessageAsync } = useSignMessage({
    mutation: {
      onError: (error) => {
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      },
    },
  });

  const disconnect = useCallback(() => {
    console.log('Disconnecting user');
    removeCookie('access-token');
    removeCookie('refresh-token');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authMethod: null,
    });
  }, []);

  const checkExistingAuth = useCallback(async (): Promise<boolean> => {
    const token = getCookie('access-token');
    if (!token) {
      console.log('No access token found in cookies');
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        authMethod: null,
      }));
      return false;
    }
    
    console.log('Access token found, assuming valid');
    // Simply trust the stored token without validation since backend doesn't have validate endpoint
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: true,
      isLoading: false,
      authMethod: 'token',
      error: null,
    }));
    return true;
  }, []);

  const authenticateWallet = useCallback(async () => {
    if (authAttemptRef.current || !address) {
      console.log('Skipping wallet auth:', { authAttempt: authAttemptRef.current, address });
      return;
    }
    authAttemptRef.current = true;
    setAuthState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const NONCE_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_NONCE_ENDPOINT;
      const VERIFY_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_VERIFY_ENDPOINT;
      if (!API_BASE || !NONCE_ENDPOINT || !VERIFY_ENDPOINT) {
        throw new Error('API endpoints not configured');
      }
      const nonceResponse = await fetch(`${API_BASE}${NONCE_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      if (!nonceResponse.ok) {
        throw new Error(`Failed to fetch nonce: ${nonceResponse.statusText}`);
      }
      const { message } = await nonceResponse.json();
      console.log('Nonce received:', { message });
      const signature = await signMessageAsync({
        account: address,
        message: message as SignableMessage,
      });
      console.log('Signature created:', { signature });
      const verifyResponse = await fetch(`${API_BASE}${VERIFY_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address.toLowerCase(),
          signature,
        }),
      });
      if (!verifyResponse.ok) {
        throw new Error(`Signature verification failed: ${verifyResponse.statusText}`);
      }
      const { accessToken, refreshToken } = await verifyResponse.json();
      console.log('Wallet auth response:', { accessToken, refreshToken });
      if (!accessToken) {
        throw new Error('No access token received from server');
      }
      setCookie('access-token', accessToken, 7);
      if (refreshToken) {
        setCookie('refresh-token', refreshToken, 30);
      }
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authMethod: 'wallet',
      });
    } catch (err) {
      console.error('Wallet authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        authMethod: null,
      }));
    } finally {
      authAttemptRef.current = false;
    }
  }, [address, signMessageAsync]);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      console.log('Initializing auth state:', { isConnected, address, status });
      const hasValidAuth = await checkExistingAuth();
      if (!isMounted) return;
      
      // If we have a valid token, don't proceed with wallet auth
      if (hasValidAuth) {
        console.log('Found valid auth token, skipping wallet authentication');
        return;
      }
      
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };
    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, [checkExistingAuth]);

  useEffect(() => {
    // Only attempt wallet authentication if:
    // 1. Wallet is connected
    // 2. Not already authenticated 
    // 3. Not already attempting authentication
    // 4. Connection is fully established
    if (isConnected && address && !authState.isAuthenticated && !authAttemptRef.current && status === 'connected') {
      console.log('Wallet fully connected and not authenticated, attempting authentication:', { address, status });
      authenticateWallet();
    }
  }, [isConnected, address, status, authState.isAuthenticated, authenticateWallet]);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = getCookie('access-token');
      console.log('Auth change event:', { token });
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: !!token,
        isLoading: false,
        authMethod: token ? 'token' : null,
      }));
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const authenticate = useCallback(async () => {
    if (isConnected && address && status === 'connected') {
      await authenticateWallet();
    } else {
      setAuthState((prev) => ({
        ...prev,
        error: 'Wallet not connected',
        isLoading: false,
      }));
    }
  }, [isConnected, address, status, authenticateWallet]);

  const refreshAuthState = useCallback(() => {
    const token = getCookie('access-token');
    console.log('Refreshing auth state:', { token });
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: !!token,
      isLoading: false,
      authMethod: token ? 'token' : null,
    }));
  }, []);

  // Dummy refresh function to maintain compatibility
  const refreshAuthTokens = useCallback(async (): Promise<AuthTokens | null> => {
    console.log('Refresh tokens called but not implemented (backend has no refresh endpoint)');
    return null;
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    authMethod: authState.authMethod,
    disconnect,
    authenticate,
    refreshTokens: refreshAuthTokens,
    refreshAuthState,
  };
};