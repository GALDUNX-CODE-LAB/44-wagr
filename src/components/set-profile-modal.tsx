"use client";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { setupProfile } from "../lib/api";

interface SetupProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SetupProfileModal({ open, onClose }: SetupProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const username = form.get("username")?.toString().trim() || "";
    const referralCode = form.get("referralCode")?.toString().trim() || "";

    if (!username) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    try {
      await setupProfile({ username, referralCode });
      window.location.href = "/";
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong";
      setError(message);
      setLoading(false);
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
            className="bg-secondary text-gray-200 w-full max-w-sm rounded-[20px] border border-white/10 p-6 relative shadow-xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-200">
              <X size={18} />
            </button>
            <h2 className="text-base font-semibold mb-1 text-primary">Setup Profile</h2>
            <p className="text-xs text-gray-400 mb-5">
              Choose a username and optionally enter a referral code. This can only be done once.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Referral Code (optional)</label>
                <input
                  name="referralCode"
                  type="text"
                  placeholder="Enter referral code"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-secondary py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition flex justify-center items-center"
              >
                {loading ? <LoaderCircle size={16} className="animate-spin" /> : "Save Profile"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
