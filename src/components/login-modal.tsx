"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { SiSolana } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { getGoogleLink, requestNonce, setupProfile, verifySignature } from "../lib/api";
import { peekStoredRefCode } from "../lib/referral-utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../lib/api/cookie";
import { RiLoaderLine } from "react-icons/ri";
import SetupProfileModal from "./set-profile-modal";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  switchMode?: boolean;
}

export default function LoginModal({ open, onClose, switchMode = false }: LoginModalProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [openProfileSetup, setOpenProfileSetup] = useState(false);

  // Solana wallet hooks
  const { publicKey: solanaPublicKey, signMessage: solanaSignMessage, connected: solanaConnected } = useWallet();
  const { setVisible: openSolanaModal } = useWalletModal();

  const googleLogin = async () => {
    try {
      const res = await getGoogleLink();
      const url = res.url;
      window.location.href = url;
    } catch (error) {
      console.log(error);
    }
  };

  // EVM auth effect
  useEffect(() => {
    if (!address) return;
    const token = getCookie("access-token");
    if (token) return;
    evmAuthHandler();
  }, [address]);

  // Solana auth effect
  useEffect(() => {
    if (!solanaPublicKey || !solanaConnected) return;
    const token = getCookie("access-token");
    if (token) return;
    solanaAuthHandler();
  }, [solanaPublicKey, solanaConnected]);

  const evmAuthHandler = async () => {
    try {
      const refCode = peekStoredRefCode();
      const { message } = await requestNonce(address, refCode, "evm");
      const signature = await signMessageAsync({
        account: address as `0x${string}`,
        message,
      });
      setIsAuthenticating(true);
      verifyUserSignature(address as string, signature, "evm");
    } catch (error) {
      console.log(error, "Error in EVM auth handler");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const solanaAuthHandler = async () => {
    if (!solanaPublicKey || !solanaSignMessage) return;
    try {
      const solanaAddress = solanaPublicKey.toBase58();
      const refCode = peekStoredRefCode();
      const { message } = await requestNonce(solanaAddress, refCode, "solana");
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await solanaSignMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);
      setIsAuthenticating(true);
      verifyUserSignature(solanaAddress, signature, "solana");
    } catch (error) {
      console.log(error, "Error in Solana auth handler");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const verifyUserSignature = async (walletAddress: string, signature: string, walletType: "evm" | "solana") => {
    try {
      const res = await verifySignature(walletAddress, signature, walletType);
      console.log(res);
      setCookie("access-token", res.accessToken);

      const usernameChanged = res.user.usernameChanged;
      if (usernameChanged == false) {
        setOpenProfileSetup(true);
        return;
      }
      onClose();
      window.location.href = "/";
    } catch (err) {
      console.error("Signature verification failed:", err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const solanaAddressLabel = solanaPublicKey
    ? `${solanaPublicKey.toBase58().slice(0, 4)}...${solanaPublicKey.toBase58().slice(-4)}`
    : switchMode
      ? "Switch Solana Wallet"
      : "Connect Solana Wallet";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#212121] w-full max-w-sm rounded-[20px] border border-white/20 p-6 relative"
          >
            <SetupProfileModal
              open={openProfileSetup}
              onClose={() => {
                setOpenProfileSetup(false);
              }}
            />
            {isAuthenticating && (
              <div className="fixed bg-black/60 top-0 bottom-0 left-0 right-0 z-[10000] flex items-center justify-center">
                <RiLoaderLine color="#fff" size={30} className="animate-spin" />
              </div>
            )}

            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white mb-6">
              {switchMode ? "Switch Account" : "Login or connect wallet"}
            </h2>

            <button
              className="w-full flex items-center cursor-pointer justify-center text-sm gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 mb-3 hover:bg-white/5 transition"
              onClick={() => googleLogin()}
            >
              <FcGoogle />
              {switchMode ? "Switch to Google" : "Login with Google"}
            </button>

            {/* EVM Wallets */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/50 text-xs">EVM Wallets</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <button className="w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-white/20 text-white bg-primary transition">
              <ConnectButton showBalance={false} />
            </button>

            {/* Solana Wallets */}
            <div className="flex items-center gap-4 my-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/50 text-xs">Solana</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <button
              className="w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-[#9945FF]/40 text-white bg-[#9945FF]/10 hover:bg-[#9945FF]/20 py-3 text-sm font-medium transition"
              onClick={() => openSolanaModal(true)}
            >
              <SiSolana className="text-[#9945FF]" size={16} />
              {solanaAddressLabel}
            </button>

            {switchMode && (
              <>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/50 text-sm">Or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button className="w-full flex cursor-pointer items-center justify-center gap-2 px-3 py-2 rounded-[15px] border border-red-400/30 text-red-400 bg-red-400/10 hover:bg-red-400/20 transition">
                  Logout Completely
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
