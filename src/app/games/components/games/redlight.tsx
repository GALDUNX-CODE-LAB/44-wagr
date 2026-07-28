"use client";

import { useState } from "react";
import RedLightGame from "../redlight-game";
import RedlightHistoryTable from "../redlight-history";
import LiveRedlightWins from "../../../../components/live-wins-redlight";
import FairnessModal from "../fairness-modal";
import { FaShieldAlt } from "react-icons/fa";

const tabs: { id: string; label: string }[] = [
  { id: "my-bets", label: "My Bets" },
  { id: "live-games", label: "Live Games" },
];

export default function RedLightPage() {
  const [activeTab, setActiveTab] = useState("my-bets");
  const [openFairness, setOpenFairness] = useState(false);

  return (
    <div>
      <RedLightGame />

      <div className="w-full mt-10 space-y-4">
        <div className="flex w-full justify-between items-center">
          <div className="inline-flex items-center rounded-full bg-black/40 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition ${
                  activeTab === tab.id ? "bg-[#1d2023] text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            className="rounded-lg text-sm flex justify-center items-center gap-2 px-4 p-2 bg-black/70 hover:bg-black/30 transition text-white/50 hover:text-white"
            onClick={() => setOpenFairness(true)}
          >
            Fairness
            <FaShieldAlt size={12} />
          </button>

          <FairnessModal open={openFairness} onClose={() => setOpenFairness(false)} />
        </div>

        {activeTab === "my-bets" && <RedlightHistoryTable />}
        {activeTab === "live-games" && <LiveRedlightWins />}
      </div>
    </div>
  );
}
