"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FairnessGame } from "../../../interfaces/interface";
import { getUserSeeds, verifyFairness } from "../../../lib/api";

interface FairnessModalProps {
  open: boolean;
  onClose: () => void;
}

const tabs = ["overview", "seeds", "verify"] as const;
type FairnessTab = (typeof tabs)[number];

export default function FairnessModal({ open, onClose }: FairnessModalProps) {
  const [activeTab, setActiveTab] = useState<FairnessTab>("overview");
  const [game, setGame] = useState<FairnessGame>("coinflip");
  const [clientSeed, setClientSeed] = useState("");
  const [serverSeed, setServerSeed] = useState("");
  const [nonce, setNonce] = useState(0);
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceBetType, setDiceBetType] = useState<"over" | "under">("over");
  const [coinChoice, setCoinChoice] = useState<"heads" | "tails">("heads");
  const [plinkoRows, setPlinkoRows] = useState(16);
  const [plinkoDifficulty, setPlinkoDifficulty] = useState<"low" | "medium" | "high">("medium");
  const [minesCount, setMinesCount] = useState(3);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const seedsQuery = useQuery({
    queryKey: ["fairness-seeds"],
    queryFn: getUserSeeds,
    enabled: open,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyFairness,
    onSuccess: (data) => setVerifyResult(data),
  });

  const handleUseActiveSeeds = () => {
    if (!seedsQuery.data) return;
    setClientSeed(seedsQuery.data.clientSeed || "");
    setNonce(seedsQuery.data.nonce || 0);
  };

  const handleVerify = () => {
    const base = { game, clientSeed, serverSeed, nonce };
    let body: any = base;
    if (game === "coinflip") body = { ...base, choice: coinChoice };
    if (game === "dice") body = { ...base, target: diceTarget, betType: diceBetType };
    if (game === "plinko") body = { ...base, rows: plinkoRows, difficulty: plinkoDifficulty };
    if (game === "mines") body = { ...base, mineCount: minesCount };
    verifyMutation.mutate(body);
  };

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
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#141920] text-white shadow-xl"
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                <h2 className="text-sm md:text-base font-semibold">Fairness</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/70"
              >
                Close
              </button>
            </div>

            <div className="px-5 pt-3">
              <div className="inline-flex items-center rounded-full bg-[#10151c] p-1 mb-4">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
                      activeTab === t ? "bg-[#232c38] text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {t === "overview" ? "Overview" : t === "seeds" ? "Seeds" : "Verify"}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="px-5 pb-5 space-y-3 text-xs md:text-sm text-white/80">
                <p>
                  Every game result is generated using a provably fair system based on a secret server seed, your client
                  seed, and a nonce that increases after each bet.
                </p>
                <p>
                  The casino commits to the server seed by publishing its hash in advance. After the seed is revealed,
                  you can recompute the HMAC and verify that the result matches what was played.
                </p>
              </div>
            )}

            {activeTab === "seeds" && (
              <div className="px-5 pb-5 space-y-4 text-xs md:text-sm">
                <div className="space-y-1">
                  <p className="text-white/60">Active Client Seed</p>
                  <div className="flex items-center gap-2 rounded-lg bg-[#10151c] px-3 py-2 text-[11px] md:text-xs">
                    <span className="truncate">{seedsQuery.data?.clientSeed || "Not set yet"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white/60">Active Server Seed (Hashed)</p>
                  <div className="flex items-center gap-2 rounded-lg bg-[#10151c] px-3 py-2 text-[11px] md:text-xs">
                    <span className="truncate">{seedsQuery.data?.serverSeedHash || "Hidden until rotated"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white/60">Current Nonce</p>
                  <div className="rounded-lg bg-[#10151c] px-3 py-2 text-[11px] md:text-xs">
                    {seedsQuery.data?.nonce ?? 0}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "verify" && (
              <div className="px-5 pb-5 space-y-4 text-xs md:text-sm">
                <div className="rounded-xl border border-dashed border-white/10 bg-[#10151c] px-4 py-6 text-center text-white/60 text-[11px] md:text-xs mb-3">
                  {verifyResult
                    ? "Result computed with the provided seeds:"
                    : "More inputs are required to verify result"}
                </div>

                {verifyResult && (
                  <div className="rounded-xl bg-[#181f29] px-4 py-3 text-[11px] md:text-xs space-y-1">
                    <p>
                      <span className="text-white/60">Game:</span> {verifyResult.game}
                    </p>
                    {verifyResult.game === "coinflip" && (
                      <>
                        <p>
                          <span className="text-white/60">Result:</span> {verifyResult.result}
                        </p>
                        <p>
                          <span className="text-white/60">Roll:</span> {verifyResult.rollFloat.toFixed(8)}
                        </p>
                      </>
                    )}
                    {verifyResult.game === "dice" && (
                      <>
                        <p>
                          <span className="text-white/60">Roll:</span> {verifyResult.roll.toFixed(4)}
                        </p>
                        <p>
                          <span className="text-white/60">Win chance:</span> {verifyResult.winChance.toFixed(2)}%
                        </p>
                        <p>
                          <span className="text-white/60">Multiplier:</span> {verifyResult.multiplier.toFixed(4)}x
                        </p>
                      </>
                    )}
                    {verifyResult.game === "wheel" && (
                      <>
                        <p>
                          <span className="text-white/60">Index:</span> {verifyResult.resultIndex}
                        </p>
                        <p>
                          <span className="text-white/60">Color:</span> {verifyResult.resultColor}
                        </p>
                        <p>
                          <span className="text-white/60">Multiplier:</span> {verifyResult.multiplier}x
                        </p>
                      </>
                    )}
                    {verifyResult.game === "plinko" && (
                      <>
                        <p>
                          <span className="text-white/60">Bucket Index:</span> {verifyResult.bucketIndex}
                        </p>
                        <p>
                          <span className="text-white/60">Rows:</span> {verifyResult.rows}
                        </p>
                        <p>
                          <span className="text-white/60">Difficulty:</span> {verifyResult.difficulty}
                        </p>
                        <p>
                          <span className="text-white/60">Multiplier:</span> {verifyResult.multiplier}x
                        </p>
                      </>
                    )}
                    {verifyResult.game === "mines" && (
                      <>
                        <p>
                          <span className="text-white/60">Mine Count:</span> {verifyResult.mineCount}
                        </p>
                        <p className="text-white/60">Mine Positions (0–24):</p>
                        <div className="grid grid-cols-5 gap-1 mt-1">
                          {Array.from({ length: 25 }, (_, i) => (
                            <div
                              key={i}
                              className={`h-6 w-full rounded text-[10px] flex items-center justify-center font-semibold ${
                                verifyResult.minePositions?.includes(i)
                                  ? "bg-red-500/80 text-white"
                                  : "bg-white/5 text-white/40"
                              }`}
                            >
                              {i}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <p className="break-all">
                      <span className="text-white/60">HMAC:</span> {verifyResult.hmac}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 mt-4">
                  <div className="space-y-1">
                    <p className="text-white/60">Game</p>
                    <select
                      value={game}
                      onChange={(e) => setGame(e.target.value as FairnessGame)}
                      className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                    >
                      <option value="coinflip">Coin Flip</option>
                      <option value="dice">Dice</option>
                      <option value="wheel">Wheel</option>
                      <option value="plinko">Plinko</option>
                      <option value="mines">Mines</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white/60">Client Seed</p>
                      <button
                        type="button"
                        onClick={handleUseActiveSeeds}
                        className="text-[10px] text-[#C8A2FF] hover:text-white"
                      >
                        Use active
                      </button>
                    </div>
                    <input
                      value={clientSeed}
                      onChange={(e) => setClientSeed(e.target.value)}
                      className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-white/60">Server Seed</p>
                    <input
                      value={serverSeed}
                      onChange={(e) => setServerSeed(e.target.value)}
                      className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-white/60">Nonce</p>
                    <input
                      type="number"
                      value={nonce}
                      onChange={(e) => setNonce(Number(e.target.value) || 0)}
                      className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                    />
                  </div>

                  {game === "coinflip" && (
                    <div className="space-y-1">
                      <p className="text-white/60">Your Choice</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCoinChoice("heads")}
                          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                            coinChoice === "heads" ? "bg-[#C8A2FF] text-black" : "bg-[#10151c] text-white/70"
                          }`}
                        >
                          Heads
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoinChoice("tails")}
                          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                            coinChoice === "tails" ? "bg-[#C8A2FF] text-black" : "bg-[#10151c] text-white/70"
                          }`}
                        >
                          Tails
                        </button>
                      </div>
                    </div>
                  )}

                  {game === "dice" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-white/60">Target</p>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={diceTarget}
                          onChange={(e) => setDiceTarget(Number(e.target.value) || 0)}
                          className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60">Bet Type</p>
                        <select
                          value={diceBetType}
                          onChange={(e) => setDiceBetType(e.target.value as "over" | "under")}
                          className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                        >
                          <option value="over">Roll Over</option>
                          <option value="under">Roll Under</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {game === "plinko" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-white/60">Rows</p>
                        <input
                          type="number"
                          min={8}
                          max={16}
                          value={plinkoRows}
                          onChange={(e) => setPlinkoRows(Math.max(8, Math.min(16, Number(e.target.value) || 16)))}
                          className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60">Difficulty</p>
                        <select
                          value={plinkoDifficulty}
                          onChange={(e) => setPlinkoDifficulty(e.target.value as "low" | "medium" | "high")}
                          className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {game === "mines" && (
                    <div className="space-y-1">
                      <p className="text-white/60">Mine Count</p>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={minesCount}
                        onChange={(e) => setMinesCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                        className="w-full rounded-lg bg-[#10151c] px-3 py-2 text-xs outline-none border border-white/5"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending || !clientSeed || !serverSeed}
                    className="rounded-xl bg-[#C8A2FF] px-5 py-2 text-xs font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyMutation.isPending ? "Verifying..." : "Verify Result"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
