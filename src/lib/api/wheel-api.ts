// wheel-api.ts
export type DynamicSegment = {
  color: string;
  multiplier: number;
};

export const placeWheelBet = async ({
  betAmount,
  selectedColorIndex,
  segments,
}: {
  betAmount: number;
  selectedColorIndex: number;
  segments: DynamicSegment[];
}) => {
  const token = localStorage.getItem('access-token');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/spin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stake: betAmount,
        chosenColor: getColorNameFromIndex(selectedColorIndex, segments),
        segments,
      }),
    });

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

const getColorNameFromIndex = (
  index: number,
  segments: DynamicSegment[]
): string => {
  const segment = segments[index];
  return segment ? segment.color : 'lightgray'; // fallback
};
