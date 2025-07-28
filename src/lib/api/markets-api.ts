import { Market } from "../../interfaces/interface";

export const fetchMarkets = async () => {
  const token = localStorage.getItem('access-token');
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_META_MARKET_ENDPOINT}`;
  
  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await res.json();
    
    if (!res.ok) throw new Error(data.message || 'Failed to fetch markets');

    // Handle both array and object responses
    return Array.isArray(data) ? { success: true, markets: data } : data;
  } catch (error) {
    console.error('Error fetching markets:', error);
    throw error;
  }
};




export const fetchMarketById = async (id: string): Promise<Market> => {
  const token = localStorage.getItem('access-token');
  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta-market/${id}`;
  
  try {
    console.log('🌐 Endpoint:', endpoint);
    console.log('🆔 Market ID:', id);

    const startTime = performance.now();
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const responseTime = performance.now() - startTime;

    console.log('⚡ Response Time:', `${responseTime.toFixed(2)}ms`);
    console.log('✅ Status:', res.status);

    const data = await res.json();
    console.log('📦 Full Response:', data); // Log the complete response
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch market');
    }

    // Ensure we return the market object from the response
    if (!data.market) {
      throw new Error('Market data not found in response');
    }

    console.log('📦 Market Data:', data.market);
    return data.market;
  } catch (error) {
    console.error('💥 Fetch Error:', error);
    throw error;
  }
};


export const placeMarketBet = async (
  marketId: string,
  side: 'YES' | 'NO',
  stake: number
) => {
  const token = localStorage.getItem('access-token');
  
  const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta-market/${marketId}/bet`;

  console.log('🎯 Placing market bet:', { marketId, side, stake });
  console.log('📡 Endpoint:', endpoint);
  console.log('🔑 Token present:', !!token);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ side, stake }),
  });

  const resBody = await response.json();
  console.log('📦 Response:', resBody);

  if (!response.ok) {
    throw new Error(resBody.message || 'Failed to place bet');
  }

  return resBody;
};
