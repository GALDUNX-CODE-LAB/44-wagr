// lib/api/dev-auth.ts
export async function devLogin(walletAddress: string) {
  const res = await fetch('http://localhost:8000/auth/dev-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!res.ok) {
    throw new Error('Dev login failed');
  }

  const data = await res.json();

  // Correct keys from the actual response
  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;

  // Store the token(s)
  localStorage.setItem('access-token', accessToken);
  localStorage.setItem('refresh-token', refreshToken); // optional

  return {
    accessToken,
    refreshToken,
    user: data.user,
  };
}
