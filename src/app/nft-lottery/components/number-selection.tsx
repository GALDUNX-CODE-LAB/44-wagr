"use client";

interface NumberSelectionProps {
  selectedNumbers: number[];
  availableNumbers: number[];
  onNumberSelect: (number: number) => void;
  maxSelections: number;
  isOpen: boolean;
  onClose: () => void;
  lotteryName: string;
  onQuickPick: (count: number) => void;
  onClear: () => void;
}

const GRID_MAX = 49;

export default function NumberSelection({
  selectedNumbers,
  availableNumbers,
  onNumberSelect,
  maxSelections,
  isOpen,
  onClose,
  lotteryName,
  onQuickPick,
  onClear,
}: NumberSelectionProps) {
  if (!isOpen) return null;

  const left = maxSelections - selectedNumbers.length;
  const sorted = [...selectedNumbers].sort((a, b) => a - b);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:z-40" onClick={onClose} aria-hidden />
      <div
        className="fixed left-0 right-0 bottom-0 lg:inset-0 lg:bottom-auto z-50 bg-[#1c1c1c] text-[#ededed] rounded-t-2xl lg:rounded-2xl lg:m-4 lg:max-w-lg lg:max-h-[90vh] lg:mx-auto shadow-2xl flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Pick numbers"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-semibold truncate pr-2">{lotteryName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#c8a2ff] text-black text-sm flex items-center justify-center font-bold shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-xs font-medium text-white/70 mb-3">Pick {maxSelections} numbers</p>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: GRID_MAX }, (_, i) => i + 1).map((number) => {
              const isAvailable = availableNumbers.includes(number);
              const isSelected = selectedNumbers.includes(number);

              return (
                <button
                  key={number}
                  type="button"
                  onClick={() => isAvailable && onNumberSelect(number)}
                  disabled={!isAvailable}
                  className={`aspect-square max-w-[44px] w-full rounded-full border-2 text-xs font-semibold transition-all touch-manipulation ${
                    isSelected
                      ? "bg-[#c8a2ff] border-[#c8a2ff] text-black"
                      : isAvailable
                        ? "bg-[#212121] border-white/15 text-white hover:border-[#c8a2ff]"
                        : "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {number}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 bg-[#1c1c1c] rounded-b-2xl">
          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-xl text-white/60 hover:bg-white/5"
            aria-label="Clear selection"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <div className="flex-1 flex justify-center">
            <span className="text-xs font-medium">
              {left > 0 ? `Left ${left} number${left !== 1 ? "s" : ""}` : "Done"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onQuickPick(maxSelections)}
            className="p-2 rounded-xl text-white/60 hover:bg-white/5"
            aria-label="Quick pick"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
