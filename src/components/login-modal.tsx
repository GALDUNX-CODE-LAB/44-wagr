"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { getGoogleLink, requestNonce, verifySignature } from "../lib/api";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../lib/api/cookie";
import { RiLoaderLine } from "react-icons/ri";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  switchMode?: boolean;
}

export default function LoginModal({ open, onClose, switchMode = false }: LoginModalProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const googleLogin = async () => {
    try {
      const res = await getGoogleLink();
      const url = res.url;
      window.location.href = url;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!address) return;

    const token = getCookie("access-token");
    if (token) return;
    nounceHandler();
  }, [address]);

  const nounceHandler = async () => {
    try {
      setIsAuthenticating(true);
      const { message } = await requestNonce(address);
      const signature = await signMessageAsync({
        account: address as `0x${string}`,
        message,
      });

      verifyUserSignature(signature);
    } catch (error) {
      console.log(error, "Error in nounce handler");
    }
  };

  const verifyUserSignature = async (signature: string) => {
    try {
      const res = await verifySignature(address, signature);
      console.log(res);
      setCookie("access-token", res.accessToken);
      alert("✅ Login success:");
      console.log(res, "Verification data");
      onClose();
    } catch (err) {
      console.error("Signature verification failed:", err);
    } finally {
      setIsAuthenticating(false);
    }
  };

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
            {isAuthenticating && (
              <div className="fixed bg-black/90 top-0 bottom-0 left-0 right-0 z-[10000] flex items-center justify-center">
                <RiLoaderLine size={30} className="animate-spin" />
              </div>
            )}

            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base  font-bold text-white mb-6">
              {switchMode ? "Switch Account" : "Login or connect wallet"}
            </h2>
            {/* 
            {!switchMode && (
              <>
                <div className="mb-4">
                  <label htmlFor="email" className="text-sm text-white mb-2 block">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@example.com"
                    className="w-full px-4 py-2 rounded-[15px] border border-white/20 bg-[#212121] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C8A2FF]"
                  />
                </div>

                <button className="w-full bg-[#C8A2FF] hover:bg-[#b389ff] cursor-pointer text-white font-medium py-2 rounded-[15px] transition mb-6">
                  Login
                </button>
              </>
            )} */}

            <button
              className="w-full flex items-center cursor-pointer justify-center text-sm gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 mb-3 hover:bg-white/5 transition"
              onClick={() => googleLogin()}
            >
              <FcGoogle />
              {switchMode ? "Switch to Google" : "Login with Google"}
            </button>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/50 text-sm">Or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <button className="w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-white/20 text-white bg-primary transition">
              <ConnectButton showBalance={false} />
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
