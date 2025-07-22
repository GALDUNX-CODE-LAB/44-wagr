export const placeWheelBet = async ({
  betAmount,
  segment,
}: {
  betAmount: number;
  segment: number; // 0-11 for 12 segments
}) => {
  const token = localStorage.getItem('access-token');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_WHEEL_ENDPOINT}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ betAmount, segment }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Wheel bet failed');
  return data.data;
};