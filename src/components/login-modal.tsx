"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  switchMode?: boolean;
}

export default function LoginModal({ open, onClose, switchMode = false }: LoginModalProps) {
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
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">{switchMode ? "Switch Account" : "Login!"}</h2>

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

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/50 text-sm">Or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              </>
            )}

            <button className="w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 mb-3 hover:bg-white/5 transition">
              <FcGoogle />
              {switchMode ? "Switch to Google" : "Login with Google"}
            </button>

            <button className="w-full flex items-center cursor-pointer justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 hover:bg-white/5 transition">
              <Image src="/assets/metamask.svg" alt="MetaMask" width={16} height={16} />
              {switchMode ? "Switch to MetaMask" : "Login with MetaMask"}
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
