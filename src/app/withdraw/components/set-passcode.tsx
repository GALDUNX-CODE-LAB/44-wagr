"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, LoaderCircle } from "lucide-react";
import { setUserPasscode } from "../../../lib/api";

interface SetPasscodeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SetPasscodeModal({ open, onClose }: SetPasscodeModalProps) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || passcode.length < 4) {
      setError("Passcode must be at least 4 digits");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await setUserPasscode(Number(passcode));
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(res.message || "Failed to set passcode");
      }
    } catch (err: any) {
      setError("Unable to set passcode");
    } finally {
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
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1C1C1C] text-white rounded-2xl border border-white/10 w-full max-w-sm p-6 relative shadow-xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-1 text-primary">Set Withdrawal Passcode</h2>
            <p className="text-xs text-gray-400 mb-5">
              Enter a 4–6 digit passcode you’ll use to authorize withdrawals.{" "}
              <span className="text-red-400">it cannot be reset</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Passcode</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 4–6 digit code"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
              {success && <p className="text-xs text-green-400">Passcode saved successfully</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-secondary py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition flex justify-center items-center"
              >
                {loading ? <LoaderCircle size={16} className="animate-spin" /> : "Save Passcode"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
