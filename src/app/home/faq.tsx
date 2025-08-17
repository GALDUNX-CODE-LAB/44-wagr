"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const cardData = [
  {
    q: "What is 44-wagr?",
    a: "44-wagr is a gaming platform that enhances your gaming experience with social and competitive features.",
  },
  {
    q: "Why should I use 44-wagr?",
    a: "It offers secure gaming, better community engagement, and fun reward systems to keep you motivated.",
  },
  { q: "Is there a free trial?", a: "Yes, you can start with a free trial to explore all features before upgrading." },
  { q: "Can I use it on mobile?", a: "Absolutely! 44-wagr is optimized for both desktop and mobile devices." },
];

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="mt-20 flex flex-col md:flex-row gap-12 py-6 lg:p-6">
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-primary text-xs max-w-fit text-black font-medium px-3 py-1 rounded mb-4">FAQs</div>
        <h3 className="text-3xl font-bold mb-4 leading-snug">
          Why use <span className="text-primabg-primary">44-wagr</span> for gaming
        </h3>
        <p className="text-gray-400 text-base mb-8 max-w-md">
          Get answers to the most common questions about 44-wagr, our features, and how it can improve your gaming
          journey.
        </p>
        <button className="w-fit px-6 py-3 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-[#D5B3FF] transition">
          Start Gaming
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {cardData.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div key={index} className="w-full bg-[#212121] rounded-[10px] border border-white/10 shadow-sm">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-white text-left"
                onClick={() => setActiveIndex(isActive ? null : index)}
              >
                <span className="text-sm font-medium">{item.q}</span>
                <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-3 text-gray-300 text-sm"
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
