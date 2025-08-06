export const placeCoinflipBet = async ({
  betAmount,
  choice,
}: {
  betAmount: number;
  choice: 'heads' | 'tails';
}) => {
  const token = localStorage.getItem('access-token');

  const normalizedChoice = choice.toLowerCase(); 



  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_COINFLIP_BET_ENDPOINT}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ betAmount, choice: normalizedChoice }),
    }
  );

  const data = await res.json().catch(() => ({
    message: 'Failed to parse JSON response',
  }));

 

  if (!res.ok) throw new Error(data.message || 'Coinflip bet failed');

  return data.data;
};
