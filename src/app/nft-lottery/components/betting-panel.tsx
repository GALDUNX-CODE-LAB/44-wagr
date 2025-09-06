import { Lottery } from "../../../interfaces/interface";

interface BettingPanelProps {
  drawAmount: string;
  setDrawAmount: (value: string) => void;
  betAmount: string;
  setBetAmount: (value: string) => void;
  selectedNumbers: number[];
  lotteryData: Lottery;
  onPlaceBet: () => void;
  betting: boolean;
  maxSelections: number;
  calculatePotentialReturn: () => string;
}

export default function BettingPanel({
  drawAmount,
  setDrawAmount,
  betAmount,
  setBetAmount,
  selectedNumbers,
  lotteryData,
  onPlaceBet,
  betting,
  maxSelections,
  calculatePotentialReturn,
}: BettingPanelProps) {
  const getButtonText = () => {
    if (betting) return "Placing Bet...";
    if (lotteryData.isCompleted) return "Lottery Ended";
    if (selectedNumbers.length !== maxSelections) {
      return `Select ${maxSelections - selectedNumbers.length} more numbers`;
    }
    return "Place Bet";
  };

  const isButtonDisabled = () => {
    return (
      selectedNumbers.length !== maxSelections ||
      !betAmount ||
      Number.parseFloat(betAmount) < lotteryData.ticketPrice ||
      betting ||
      lotteryData.isCompleted
    );
  };

  return (
    <div className="w-full max-w-[556px] min-h-[433px] lg:bg-[#212121] border border-white/[0.1] rounded-[20px] pb-16 p-4 lg:p-6">
      <h3 className="text-base font-medium mb-4">Place Your Bet</h3>
      <div className="w-full h-[1px] bg-white/10 mb-8"></div>

      <div className="space-y-4 flex lg:block gap-3">
        <div>
          <label className="block text-xs lg:text-sm text-white mb-3">
            Draw
          </label>
          <input
            type="text"
            value={drawAmount}
            onChange={(e) => setDrawAmount(e.target.value)}
            className="w-full text-xs lg:text-sm max-w-[516px] h-[45px] bg-[#1C1C1C] border border-white/[0.1] rounded-[10px] px-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            placeholder="Draw"
          />
        </div>

        <div>
          <label className="block text-xs lg:text-sm text-white mb-3">
            Bet Amount
          </label>
          <div className="relative w-full max-w-[516px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              $
            </span>
            <input
              type="number"
              min={lotteryData.ticketPrice}
              step="0.01"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full text-xs lg:text-sm h-[45px] bg-[#1C1C1C] border border-white/[0.1] rounded-[10px] pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
              placeholder={`Minimum $${lotteryData.ticketPrice}`}
            />
          </div>
          <p className="text-xs text-white/50 mt-1">
            Minimum bet: ${lotteryData.ticketPrice}
          </p>
        </div>
      </div>

      <div className="w-full h-[1px] bg-white/10 my-8"></div>

      <div className="space-y-3 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-white/65">Potential Return</span>
          <span className="text-white font-medium">
            ${calculatePotentialReturn()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/65">Total Bet Amount</span>
          <span className="font-medium text-white">
            ${betAmount || "0.00"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/65">Numbers Selected</span>
          <span className="font-medium text-white">
            {selectedNumbers.length}/{maxSelections}
          </span>
        </div>
      </div>

      <button
        onClick={onPlaceBet}
        disabled={isButtonDisabled()}
        className="w-full p-3 lg:h-[50px] bg-[#C8A2FF] mt-2 text-black font-bold text-sm lg:text-base rounded-[10px] hover:bg-[#B891FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {betting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Placing Bet...
          </div>
        ) : (
          getButtonText()
        )}
      </button>
    </div>
  );
}