"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { handleGoogleRedirect, googleLogin, setAuthTokens } from "../lib/api/auth";
import { FcGoogle } from "react-icons/fc";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/api/useAuth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  const { connect, connectors, isPending } = useConnect();
  const { isConnected, address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { authenticate, isAuthenticated, isLoading: authLoading, error: authError, refreshAuthState } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth callback when component mounts
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        setError('Google login was cancelled or failed');
        router.replace(window.location.pathname);
        return;
      }
      
      if (code) {
        setIsGoogleLoading(true);
        try {
          const result = await googleLogin(code);
          console.log('Google login result:', result);
          
          const accessToken = result.access_token || result.accessToken || result.token || (result.data ? result.data.access_token || result.data.accessToken || result.data.token : null);
          const refreshToken = result.refresh_token || result.refreshToken || (result.data ? result.data.refresh_token || result.data.refreshToken : null);

          if (!accessToken) {
            console.error('No access token found in response:', result);
            throw new Error('No access token received');
          }

          setAuthTokens(accessToken, refreshToken);
          console.log('Google login successful, tokens set');
          refreshAuthState();
          router.replace(window.location.pathname);
        } catch (error) {
          console.error('Google login failed:', error);
          setError(error instanceof Error ? error.message : 'Google login failed');
          router.replace(window.location.pathname);
        } finally {
          setIsGoogleLoading(false);
        }
      }
    };

    if (open) {
      handleOAuthCallback();
    }
  }, [searchParams, router, open, refreshAuthState]);

  // Close modal if user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User authenticated, closing modal');
      onClose();
    }
  }, [isAuthenticated, authLoading, onClose]);

  if (!open) return null;

  const handleEmailLogin = () => {
    console.log("Logging in with email:", email);
    setError("Email login not implemented yet");
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setIsGoogleLoading(true);
      await handleGoogleRedirect();
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
      setError('Failed to start Google login');
      setIsGoogleLoading(false);
    }
  };

  const handleMetamaskLogin = async () => {
    try {
      setError("");
      const metamaskConnector = connectors.find(
        (connector) => connector.name.toLowerCase().includes("meta")
      );

      if (!metamaskConnector) {
        console.error("MetaMask connector not found");
        setError("MetaMask not found. Please install MetaMask extension.");
        return;
      }

      if (!isConnected || status !== 'connected') {
        console.log('Connecting to MetaMask', { isConnected, status });
        await connect({ connector: metamaskConnector });
      }

      console.log('Initiating wallet authentication', { isConnected, address, status });
      await authenticate();
      console.log('MetaMask login initiated');
      refreshAuthState();
    } catch (error) {
      console.error('MetaMask login failed:', error);
      setError(error instanceof Error ? error.message : 'MetaMask login failed');
      if (isConnected) {
        disconnect();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#212121] w-full max-w-sm rounded-[20px] border border-white/20 p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-red-500"
          disabled={isGoogleLoading || authLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Login!</h2>

        {(error || authError) && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error || authError}</p>
          </div>
        )}

        {(isGoogleLoading || authLoading) && (
          <div className="mb-4 p-3 rounded-[10px] bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400 text-sm">Processing login...</p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="text-sm text-white mb-2 block">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@example.com"
            className="w-full px-4 py-2 rounded-[15px] border border-white/20 bg-[#212121] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C8A2FF]"
            disabled={isGoogleLoading || authLoading}
          />
        </div>

        <button
          onClick={handleEmailLogin}
          disabled={isGoogleLoading || authLoading}
          className="w-full bg-[#C8A2FF] hover:bg-[#b389ff] text-white font-medium py-2 rounded-[15px] transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Login
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/50 text-sm">Or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || authLoading}
          className="w-full flex items-center justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 mb-3 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle />
          {isGoogleLoading ? 'Connecting to Google...' : 'Login with Google'}
        </button>

        <button
          onClick={handleMetamaskLogin}
          disabled={isGoogleLoading || authLoading || isPending}
          className="w-full flex items-center justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image src="/assets/metamask.svg" alt="MetaMask" width={16} height={16} />
          {isPending || authLoading ? 'Connecting...' : 'Login with MetaMask'}
        </button>
      </div>
    </div>
  );
}