// utils/auth.ts
// utils/auth.ts
export const requestNonce = async (walletAddress: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/nonce`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      }
    );

    if (!response.ok) {
      // Try to get error details from response
      const errorData = await response.json().catch(() => ({}));
      console.error('Nonce request failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || 'Failed to fetch nonce');
    }

    return await response.json();
  } catch (error) {
    console.error('Network error in requestNonce:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Network error while requesting nonce'
    );
  }
};

export const verifySignature = async (walletAddress: string, signature: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to verify signature');
  }
  return await response.json();
};