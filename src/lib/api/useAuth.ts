import { useAccount, useSignMessage } from 'wagmi';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { SignableMessage } from 'viem';
import { setCookie, getCookie, removeCookie } from '../api/cookie';
import { requestNonce, verifySignature, setAuthTokens } from './auth';

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
  const authenticatedAddressRef = useRef<string | null>(null);
  const initializeRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const { signMessageAsync } = useSignMessage({
    mutation: {
      onError: (error) => {
        console.error('❌ SignMessage error:', error);
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
        authAttemptRef.current = false;
      },
    },
  });

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting user');
    removeCookie('access-token');
    removeCookie('refresh-token');
    authAttemptRef.current = false;
    authenticatedAddressRef.current = null;
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authMethod: null,
    });
    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const checkExistingAuth = useCallback(async (): Promise<{ hasAuth: boolean; method: 'wallet' | 'token' | null }> => {
    const token = getCookie('access-token');
    if (!token) {
      console.log('No access token found in cookies');
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        authMethod: null,
        error: null,
      }));
      return { hasAuth: false, method: null };
    }

    console.log('Access token found, determining auth method...');
    const authMethod: 'wallet' | 'token' = (isConnected && address) ? 'wallet' : 'token';
    if (authMethod === 'wallet' && address) {
      authenticatedAddressRef.current = address;
    }

    // Optional: Validate token with backend (uncomment if endpoint exists)
    /*
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.log('Token validation failed, clearing tokens');
        disconnect();
        return { hasAuth: false, method: null };
      }
    } catch (err) {
      console.error('Token validation error:', err);
      disconnect();
      return { hasAuth: false, method: null };
    }
    */

    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: true,
      isLoading: false,
      authMethod,
      error: null,
    }));

    return { hasAuth: true, method: authMethod };
  }, [isConnected, address, disconnect]);

  const authenticateWallet = useCallback(async (targetAddress: string) => {
    if (authAttemptRef.current) {
      console.log('⏭️ Authentication already in progress, skipping');
      return;
    }

    if (!targetAddress) {
      console.log('⏭️ No target address provided');
      return;
    }

    const token = getCookie('access-token');
    if (token && authenticatedAddressRef.current === targetAddress) {
      console.log('⏭️ Already authenticated for address:', targetAddress);
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        authMethod: 'wallet',
        error: null,
      }));
      return;
    }

    authAttemptRef.current = true;
    console.log('🚀 Starting wallet authentication for:', targetAddress);
    setAuthState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const { message } = await requestNonce(targetAddress);
      console.log('✅ Nonce received, requesting signature');
      const signature = await signMessageAsync({
        account: targetAddress as `0x${string}`,
        message: message as SignableMessage,
      });
      console.log('✅ Signature obtained, verifying with server');
      const { accessToken, refreshToken } = await verifySignature(targetAddress.toLowerCase(), signature);
      console.log('✅ Wallet authentication successful');

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      setAuthTokens(accessToken, refreshToken);
      authenticatedAddressRef.current = targetAddress;
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authMethod: 'wallet',
      });
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      console.error('❌ Wallet authentication error:', err);
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
  }, [signMessageAsync]);

  useEffect(() => {
    if (initializeRef.current || hasInitializedRef.current) return;

    initializeRef.current = true;
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('🔄 Initializing auth state');
      const authResult = await checkExistingAuth();
      if (!isMounted) return;

      hasInitializedRef.current = true;
      console.log('Initialization complete:', authResult);
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, [checkExistingAuth]);

  useEffect(() => {
    if (!hasInitializedRef.current || status === 'connecting' || !isConnected || !address) {
      console.log('⏭️ Skipping auth: not initialized, connecting, or no address', {
        hasInitialized: hasInitializedRef.current,
        status,
        isConnected,
        address,
      });
      return;
    }

    const token = getCookie('access-token');
    if (token && authState.isAuthenticated && authenticatedAddressRef.current === address) {
      console.log('⏭️ Already authenticated with valid token for address:', address);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isConnected && address && status === 'connected' && !authAttemptRef.current) {
        console.log('🔄 Starting wallet authentication after debounce:', { address });
        authenticateWallet(address);
      }
    }, 1500); // Increased debounce time to 1.5 seconds

    return () => clearTimeout(timeoutId);
  }, [isConnected, address, status, authState.isAuthenticated, authenticateWallet]);

  useEffect(() => {
    if (!hasInitializedRef.current || !authenticatedAddressRef.current || !address || authenticatedAddressRef.current === address) {
      return;
    }

    console.log('🔄 Address changed, clearing auth:', {
      oldAddress: authenticatedAddressRef.current,
      newAddress: address,
    });
    authenticatedAddressRef.current = null;
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: false,
      isLoading: true,
      authMethod: null,
    }));
  }, [address]);

  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('Auth change event received');
      await checkExistingAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [checkExistingAuth]);

  const authenticate = useCallback(async () => {
    if (authAttemptRef.current) {
      console.log('⏭️ Authentication already in progress, skipping');
      return;
    }

    if (isConnected && address && status === 'connected') {
      const token = getCookie('access-token');
      if (token && authenticatedAddressRef.current === address) {
        console.log('⏭️ Already authenticated, skipping');
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          authMethod: 'wallet',
          error: null,
        }));
        return;
      }
      await authenticateWallet(address);
    } else {
      setAuthState((prev) => ({
        ...prev,
        error: 'Wallet not connected',
        isLoading: false,
      }));
    }
  }, [isConnected, address, status, authenticateWallet]);

  const refreshAuthState = useCallback(async () => {
    console.log('Force refreshing auth state');
    await checkExistingAuth();
  }, [checkExistingAuth]);

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