'use client'

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { handleGoogleRedirect, logout } from "../lib/api/auth";
import { FcGoogle } from "react-icons/fc";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/api/useAuth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  switchMode?: boolean;
}

export default function LoginModal({ open, onClose, switchMode = false }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { connect, connectors, isPending } = useConnect();
  const { isConnected, address, status } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { authenticate, isAuthenticated, isLoading: authLoading, error: authError, refreshAuthState, disconnect: authDisconnect, authMethod } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading && !switchMode) {
     
      onClose();
    }
  }, [isAuthenticated, authLoading, onClose, switchMode]);

  if (!open) return null;

  const handleEmailLogin = () => {
   
    setError("Email login not implemented yet");
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setIsGoogleLoading(true);
     

      if (switchMode && isAuthenticated) {
        await logout(wagmiDisconnect);
        authDisconnect();
      }

      await handleGoogleRedirect();
    } catch (error) {
    
      setError(error instanceof Error ? error.message : 'Failed to start Google login');
      setIsGoogleLoading(false);
    }
  };

  const handleMetamaskLogin = async () => {
    try {
      setError("");

      if (isAuthenticated && authMethod === 'wallet' && address && isConnected) {
      
        if (!switchMode) {
          onClose();
        }
        return;
      }

      const metamaskConnector = connectors.find(
        (connector) => connector.name.toLowerCase().includes("meta")
      );

      if (!metamaskConnector) {
      
        setError("MetaMask not found. Please install MetaMask extension.");
        return;
      }

      if (switchMode && isAuthenticated) {
      
        await logout(wagmiDisconnect);
        authDisconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!isConnected) {
     
        await connect({ connector: metamaskConnector });
      }

     
      await authenticate();
    } catch (error) {
     
      setError(error instanceof Error ? error.message : 'MetaMask connection failed');
      if (isConnected) {
        wagmiDisconnect();
      }
    }
  };

  const handleLogoutAndClose = async () => {
    await logout(wagmiDisconnect);
    authDisconnect();
    onClose();
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

        <h2 className="text-xl font-bold text-white mb-6">
          {switchMode ? "Switch Account" : "Login!"}
        </h2>

        {switchMode && isAuthenticated && (
          <div className="mb-4 p-3 rounded-[10px] bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400 text-sm">
              Currently logged in with: {authMethod === 'wallet' ? 'MetaMask' : 'Google'}
            </p>
          </div>
        )}

        {(error || authError) && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error || authError}</p>
          </div>
        )}

        {(isGoogleLoading || authLoading) && (
          <div className="mb-4 p-3 rounded-[10px] bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400 text-sm">
              {isGoogleLoading ? 'Redirecting to Google...' : 'Processing login...'}
            </p>
          </div>
        )}

        {!switchMode && (
          <>
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
              className="w-full bg-[#C8A2FF] hover:bg-[#b389ff] cursor-pointer text-white font-medium py-2 rounded-[15px] transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/50 text-sm">Or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || authLoading}
          className={`w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 mb-3 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            switchMode && authMethod !== 'wallet' ? 'opacity-50' : ''
          }`}
        >
          <FcGoogle />
          {isGoogleLoading ? 'Redirecting to Google...' : 
           switchMode ? 'Switch to Google' : 'Login with Google'}
        </button>

        <button
          onClick={handleMetamaskLogin}
          disabled={isGoogleLoading || authLoading || isPending}
          className={`w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            switchMode && authMethod === 'wallet' ? 'opacity-50' : ''
          }`}
        >
          <Image src="/assets/metamask.svg" alt="MetaMask" width={16} height={16} />
          {isPending || authLoading ? 'Connecting...' : 
           switchMode ? 'Switch to MetaMask' : 'Login with MetaMask'}
        </button>

        {switchMode && (
          <>
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/50 text-sm">Or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            
            <button
              onClick={handleLogoutAndClose}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-3 py-2 rounded-[15px] border border-red-400/30 text-red-400 bg-red-400/10 hover:bg-red-400/20 transition"
            >
              Logout Completely
            </button>
          </>
        )}
      </div>
    </div>
  );
}