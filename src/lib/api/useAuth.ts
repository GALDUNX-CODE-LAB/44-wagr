// import { useAccount, useSignMessage } from 'wagmi';
// import { useEffect, useState, useCallback, useRef } from 'react';
// import type { SignableMessage } from 'viem';
// import { setCookie, getCookie, removeCookie } from '../api/cookie';
// import { requestNonce, verifySignature, setAuthTokens } from './auth';

// interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
// }

// interface AuthState {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
//   authMethod: 'wallet' | 'token' | null;
// }

// export const useAuth = () => {
//   const { address, isConnected, status } = useAccount();
//   const [authState, setAuthState] = useState<AuthState>({
//     isAuthenticated: false,
//     isLoading: true,
//     error: null,
//     authMethod: null,
//   });

//   const authAttemptRef = useRef(false);
//   const authenticatedAddressRef = useRef<string | null>(null);
//   const initializeRef = useRef(false);
//   const hasInitializedRef = useRef(false);

//   const { signMessageAsync } = useSignMessage({
//     mutation: {
//       onError: (error) => {
//         setAuthState((prev) => ({
//           ...prev,
//           error: error.message,
//           isLoading: false,
//         }));
//         authAttemptRef.current = false;
//       },
//     },
//   });

//   const disconnect = useCallback(() => {
//     removeCookie('access-token');
//     removeCookie('refresh-token');
//     removeCookie('auth-method');
//     removeCookie('auth-address');
//     authAttemptRef.current = false;
//     authenticatedAddressRef.current = null;
//     setAuthState({
//       isAuthenticated: false,
//       isLoading: false,
//       error: null,
//       authMethod: null,
//     });
//     window.dispatchEvent(new Event('auth-change'));
//   }, []);

//   const checkExistingAuth = useCallback(async (): Promise<{ hasAuth: boolean; method: 'wallet' | 'token' | null }> => {
//     const token = getCookie('access-token');
//     if (!token) {
//       setAuthState((prev) => ({
//         ...prev,
//         isAuthenticated: false,
//         isLoading: false,
//         authMethod: null,
//         error: null,
//       }));
//       return { hasAuth: false, method: null };
//     }

//     const storedAuthMethod = getCookie('auth-method') as 'wallet' | 'token' | null;
//     const storedAddress = getCookie('auth-address');

//     let authMethod: 'wallet' | 'token';

//     if (storedAuthMethod === 'wallet') {
//       authMethod = 'wallet';
//       if (storedAddress) {
//         authenticatedAddressRef.current = storedAddress;
//       }

//       if (!isConnected || !address || address !== storedAddress) {
//         setAuthState((prev) => ({
//           ...prev,
//           isAuthenticated: true,
//           isLoading: false,
//           authMethod: 'wallet',
//           error: null,
//         }));
//         return { hasAuth: true, method: 'wallet' };
//       }
//     } else if (storedAuthMethod === 'token') {
//       authMethod = 'token';
//     } else {
//       authMethod = (isConnected && address) ? 'wallet' : 'token';
//       setCookie('auth-method', authMethod, 7);
//       if (authMethod === 'wallet' && address) {
//         setCookie('auth-address', address, 7);
//         authenticatedAddressRef.current = address;
//       }
//     }

//     setAuthState((prev) => ({
//       ...prev,
//       isAuthenticated: true,
//       isLoading: false,
//       authMethod,
//       error: null,
//     }));

//     return { hasAuth: true, method: authMethod };
//   }, [isConnected, address, disconnect]);

//   const authenticateWallet = useCallback(async (targetAddress: string) => {
//     if (authAttemptRef.current || !targetAddress) {
//       return;
//     }

//     const token = getCookie('access-token');
//     const storedAuthMethod = getCookie('auth-method');
//     const storedAddress = getCookie('auth-address');

//     if (token && storedAuthMethod === 'wallet' && storedAddress === targetAddress && authenticatedAddressRef.current === targetAddress) {
//       setAuthState((prev) => ({
//         ...prev,
//         isAuthenticated: true,
//         isLoading: false,
//         authMethod: 'wallet',
//         error: null,
//       }));
//       return;
//     }

//     authAttemptRef.current = true;
//     setAuthState((prev) => ({
//       ...prev,
//       isLoading: true,
//       error: null,
//     }));

//     try {
//       const { message } = await requestNonce(targetAddress);
//       const signature = await signMessageAsync({
//         account: targetAddress as `0x${string}`,
//         message: message as SignableMessage,
//       });
//       const { accessToken, refreshToken } = await verifySignature(targetAddress.toLowerCase(), signature);

//       if (!accessToken) {
//         throw new Error('No access token received from server');
//       }

//       setAuthTokens(accessToken, refreshToken);
//       setCookie('auth-method', 'wallet', 7);
//       setCookie('auth-address', targetAddress, 7);

//       authenticatedAddressRef.current = targetAddress;
//       setAuthState({
//         isAuthenticated: true,
//         isLoading: false,
//         error: null,
//         authMethod: 'wallet',
//       });
//       window.dispatchEvent(new Event('auth-change'));
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
//       setAuthState((prev) => ({
//         ...prev,
//         isLoading: false,
//         error: errorMessage,
//         isAuthenticated: false,
//         authMethod: null,
//       }));
//     } finally {
//       authAttemptRef.current = false;
//     }
//   }, [signMessageAsync]);

//   useEffect(() => {
//     if (initializeRef.current || hasInitializedRef.current) return;

//     initializeRef.current = true;
//     let isMounted = true;

//     const initializeAuth = async () => {
//       await checkExistingAuth();
//       if (!isMounted) return;
//       hasInitializedRef.current = true;
//     };

//     initializeAuth();
//     return () => {
//       isMounted = false;
//     };
//   }, [checkExistingAuth]);

//   useEffect(() => {
//     if (!hasInitializedRef.current || status === 'connecting' || !isConnected || !address) {
//       return;
//     }

//     const token = getCookie('access-token');
//     const storedAuthMethod = getCookie('auth-method');
//     const storedAddress = getCookie('auth-address');

//     if (token && storedAuthMethod === 'wallet' && storedAddress === address && authState.isAuthenticated && authenticatedAddressRef.current === address) {
//       return;
//     }

//     if (token && storedAuthMethod === 'token' && authState.isAuthenticated) {
//       return;
//     }

//     const timeoutId = setTimeout(() => {
//       if (isConnected && address && status === 'connected' && !authAttemptRef.current) {
//         authenticateWallet(address);
//       }
//     }, 1500);

//     return () => clearTimeout(timeoutId);
//   }, [isConnected, address, status, authState.isAuthenticated, authenticateWallet]);

//   useEffect(() => {
//     if (!hasInitializedRef.current || !authenticatedAddressRef.current || !address) {
//       return;
//     }

//     const storedAddress = getCookie('auth-address');

//     if (storedAddress && storedAddress !== address && getCookie('auth-method') === 'wallet') {
//       authenticatedAddressRef.current = null;
//       setAuthState((prev) => ({
//         ...prev,
//         isAuthenticated: false,
//         isLoading: true,
//         authMethod: null,
//       }));
//     }
//   }, [address]);

//   useEffect(() => {
//     const handleAuthChange = async () => {
//       await checkExistingAuth();
//     };
//     window.addEventListener('auth-change', handleAuthChange);
//     return () => window.removeEventListener('auth-change', handleAuthChange);
//   }, [checkExistingAuth]);

//   const authenticate = useCallback(async () => {
//     if (authAttemptRef.current) {
//       return;
//     }

//     if (isConnected && address && status === 'connected') {
//       const token = getCookie('access-token');
//       const storedAuthMethod = getCookie('auth-method');
//       const storedAddress = getCookie('auth-address');

//       if (token && storedAuthMethod === 'wallet' && storedAddress === address && authenticatedAddressRef.current === address) {
//         setAuthState((prev) => ({
//           ...prev,
//           isAuthenticated: true,
//           isLoading: false,
//           authMethod: 'wallet',
//           error: null,
//         }));
//         return;
//       }
//       await authenticateWallet(address);
//     } else {
//       setAuthState((prev) => ({
//         ...prev,
//         error: 'Wallet not connected',
//         isLoading: false,
//       }));
//     }
//   }, [isConnected, address, status, authenticateWallet]);

//   const refreshAuthState = useCallback(async () => {
//     await checkExistingAuth();
//   }, [checkExistingAuth]);

//   const refreshAuthTokens = useCallback(async (): Promise<AuthTokens | null> => {
//     return null;
//   }, []);

//   return {
//     isAuthenticated: authState.isAuthenticated,
//     isLoading: authState.isLoading,
//     error: authState.error,
//     authMethod: authState.authMethod,
//     disconnect,
//     authenticate,
//     refreshTokens: refreshAuthTokens,
//     refreshAuthState,
//   };
// };
