interface NumberSelectionProps {
  selectedNumbers: number[];
  availableNumbers: number[];
  onNumberSelect: (number: number) => void;
  maxSelections: number;
}

export default function NumberSelection({
  selectedNumbers,
  availableNumbers,
  onNumberSelect,
  maxSelections,
}: NumberSelectionProps) {
  return (
    <div className="w-full max-w-[556px] min-h-[433px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-4 lg:p-6">
      <h3 className="text-base font-medium mb-6">Choose Your Numbers</h3>

      <div className="w-full max-w-[516px] min-h-[353px] bg-[#1C1C1C] border border-white/[0.1] rounded-[16px] p-5">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xs font-medium">
            Choose {maxSelections} numbers
          </h4>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 49 }, (_, i) => i + 1).map((number) => {
            const isAvailable = availableNumbers.includes(number);
            const isSelected = selectedNumbers.includes(number);

            return (
              <button
                key={number}
                onClick={() => isAvailable && onNumberSelect(number)}
                disabled={!isAvailable}
                className={`md:w-[41px] w-[36px] h-[36px] md:h-[41px] rounded-full border text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-[#C8A2FF] border-[#C8A2FF] text-black"
                    : isAvailable
                    ? "bg-[#212121] border-white/[0.1] text-white hover:border-white/20"
                    : "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-white/60">
          Selected: {selectedNumbers.sort((a, b) => a - b).join(", ")}
        </div>
      </div>
    </div>
  );
}