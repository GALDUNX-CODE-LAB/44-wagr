export type DynamicSegment = {
  color: string;
  multiplier: number;
};

// ✅ Hardcoded segments to match backend (do not change this order)
export const HARD_CODED_SEGMENTS: DynamicSegment[] = [
  { color: "green", multiplier: 2 },
  { color: "yellow", multiplier: 1.5 },
  { color: "lightgray", multiplier: 0 },
  { color: "blue", multiplier: 3 },
  { color: "lightgray", multiplier: 0 },
  { color: "red", multiplier: 2.5 },
  { color: "lightgray", multiplier: 0 },
  { color: "purple", multiplier: 1.2 },
];

// ✅ No longer fetches from backend — returns fixed config
export const fetchSegments = async (): Promise<DynamicSegment[]> => {
  return HARD_CODED_SEGMENTS;
};

// ✅ Places a bet using hardcoded segments
export const placeWheelBet = async ({
  betAmount,
  selectedColorIndex,
  
}: {
  betAmount: number;
  selectedColorIndex: number;
}) => {
  const token = localStorage.getItem('access-token');

  const segments = HARD_CODED_SEGMENTS;
  const chosenColor = getColorNameFromIndex(selectedColorIndex, segments);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_WHEEL_BET_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stake: betAmount,
          chosenColor,
          segments, // Send the same fixed segments to backend
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Bet placement failed. Please try again.');
  }
};

// ✅ Utility: maps selected index to color
const getColorNameFromIndex = (
  index: number,
  segments: DynamicSegment[]
): string => {
  const segment = segments[index];
  return segment ? segment.color : 'lightgray'; // fallback
};
