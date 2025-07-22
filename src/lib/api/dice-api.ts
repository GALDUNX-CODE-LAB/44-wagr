// api/dice-api.ts
export const placeDiceBet = async ({
  betAmount,
  target,
  betType,
}: {
  betAmount: number;
  target: number;
  betType: 'over' | 'under';
}) => {
  const token = localStorage.getItem('access-token');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_DICE_BET_ENDPOINT}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ betAmount, target, betType }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Dice bet failed');
  return data.data;
};