"use client";

import { useState } from "react";

type CoinSide = "heads" | "tails";

interface FairnessModalProps {
  open: boolean;
  onClose: () => void;
  game: {
    result: CoinSide;
    clientSeed: string;
    nonce: number;
    serverSeed?: string;
    serverSeedHash: string;
  };
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  const msgData = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const bytes = new Uint8Array(signature);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function FairnessModal({ open, onClose, game }: FairnessModalProps) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    computedResult: CoinSide;
    rollFloat: number;
    hmac: string;
  } | null>(null);

  if (!open) return null;
  if (!game.serverSeed) return null;

  const handleVerify = async () => {
    setVerifying(true);
    const hmac = await hmacSha256(game.serverSeed!, `${game.clientSeed}:${game.nonce}`);
    const intVal = parseInt(hmac.slice(0, 8), 16);
    const rollFloat = intVal / 0xffffffff;
    const computedResult: CoinSide = rollFloat < 0.5 ? "heads" : "tails";
    const ok = computedResult === game.result;
    setVerifyResult({ ok, computedResult, rollFloat, hmac });
    setVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1c1c] p-5 text-white">
        <h2 className="text-lg font-semibold mb-4">Verify Game Fairness</h2>

        <div className="space-y-2 text-xs">
          <div>
            <p className="text-white/60">Server Seed</p>
            <p className="break-all font-mono text-[11px]">{game.serverSeed}</p>
          </div>
          <div>
            <p className="text-white/60">Server Seed Hash</p>
            <p className="break-all font-mono text-[11px]">{game.serverSeedHash}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-white/60">Client Seed</p>
              <p className="break-all font-mono text-[11px]">{game.clientSeed}</p>
            </div>
            <div>
              <p className="text-white/60">Nonce</p>
              <p className="font-mono text-[11px]">{game.nonce}</p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-white/60 text-xs">Claimed Result</p>
            <p className="font-semibold text-sm capitalize">{game.result}</p>
          </div>
        </div>

        {verifyResult && (
          <div className="mt-4 rounded-xl bg-black/40 p-3 text-xs space-y-1">
            <p className={verifyResult.ok ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
              {verifyResult.ok ? "Result is provably fair" : "Result does not match the seeds"}
            </p>
            <p>
              Computed result: <span className="font-mono">{verifyResult.computedResult}</span>
            </p>
            <p>
              Roll value: <span className="font-mono">{verifyResult.rollFloat.toFixed(8)}</span>
            </p>
            <p className="break-all">
              HMAC: <span className="font-mono">{verifyResult.hmac}</span>
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/15 bg-transparent py-2 text-sm"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="flex-1 rounded-xl bg-[#C8A2FF] py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
