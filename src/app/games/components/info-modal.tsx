"use client";

import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
}

export default function InfoModal({ open, onClose, title, text }: InfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1c1c] px-5 py-6 text-white"
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/70"
              >
                Close
              </button>
            </div>

            <p className="text-sm text-white/80 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
              {text}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
