"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { handleGoogleRedirect } from "../lib/api/auth";
import { FcGoogle } from "react-icons/fc";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");

  if (!open) return null;

  const handleEmailLogin = () => {
    console.log("Logging in with email:", email);
    // Future implementation
  };

   const handleMetamaskLogin = () => {
    console.log("Login with MetaMask");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#212121] w-full max-w-sm rounded-[20px] border border-white/20 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500">
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-6">Login!</h2>

        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="text-sm text-white mb-2 block">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@example.com"
            className="w-full px-4 py-2 rounded-[15px] border border-white/20 bg-[#212121] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C8A2FF]"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleEmailLogin}
          className="w-full bg-[#C8A2FF] hover:bg-[#b389ff] text-white font-medium py-2 rounded-[15px] transition mb-6"
        >
          Login
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/50 text-sm">Or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleRedirect}
          className="w-full flex items-center justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 mb-3 "
        >
          <FcGoogle />
          Login with Google
        </button>

        <button
          onClick={handleMetamaskLogin}
          className="w-full  flex items-center justify-center gap-3 rounded-[15px] border border-white/20 bg-[#212121] text-white py-2 "
        >
          <Image src="/assets/metamask.svg" alt="MetaMask" width={16} height={16} />
          Login with MetaMask
        </button>
      </div>
    </div>
  );
}
