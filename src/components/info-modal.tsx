"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InfoModal({ open, onClose }: InfoModalProps) {
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
            <h2 className="text-xl font-semibold mb-1 text-primary">How the NFT Game Works</h2>
            <div className="text-sm text-gray-300 space-y-3 mt-3">
              <p>
                There’s a <span className="text-primary font-medium">prize pool</span> that collects all entries for
                each round.
              </p>
              <p>
                Every player selects a <span className="text-primary font-medium">fixed lottery price</span> and joins
                the pool.
              </p>
              <p>
                When the draw happens, random winning numbers are selected. The{" "}
                <span className="text-primary font-medium">top 3 players</span> whose numbers match the most wins
                receive the prizes from the pool.
              </p>
              <p>
                The more your selected numbers match the winning set, the higher your rank — and the bigger your reward.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-secondary rounded-lg text-sm font-medium hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
