// lib/api/auth.ts

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

// Utility functions for token management with event dispatch
export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('access-token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh-token', refreshToken);
  }
  // Notify useAuth hook immediately
  window.dispatchEvent(new Event('auth-change'));
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access-token');
  localStorage.removeItem('refresh-token');
  // Notify useAuth hook immediately
  window.dispatchEvent(new Event('auth-change'));
};

export const logout = (disconnect?: () => void) => {
  try {
    clearAuthTokens();
    if (disconnect) {
      disconnect();
    }
    window.location.href = '/';
  } catch (err) {
    console.error('Error during logout:', err);
  }
};

export const googleLogin = async (code: string) => {
  try {
    const encodedCode = encodeURIComponent(code);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseUrl}/auth/google/callback?code=${encodedCode}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle the response and set tokens
    if (data.access_token || data.accessToken) {
      const accessToken = data.access_token || data.accessToken;
      const refreshToken = data.refresh_token || data.refreshToken;
      
      // Use the utility function to set tokens and dispatch event
      setAuthTokens(accessToken, refreshToken);
      
      return data;
    }
    
    // Check nested data object
    if (data.data) {
      const accessToken = data.data.access_token || data.data.accessToken;
      const refreshToken = data.data.refresh_token || data.data.refreshToken;
      
      if (accessToken) {
        setAuthTokens(accessToken, refreshToken);
        return data.data;
      }
    }
    
    throw new Error('No access token received from server');
    
  } catch (error) {
    console.error('Google login error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
    }
    throw new Error(
      error instanceof Error ? error.message : 'Google login failed'
    );
  }
};

export const handleGoogleRedirect = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error('Failed to initiate Google authentication');
    }

    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Invalid response from authentication server');
    }
  } catch (error) {
    console.error("Google redirect error:", error);
    throw error;
  }
};

export const extractCodeFromCallback = (callbackUrl: string): string | null => {
  try {
    const url = new URL(callbackUrl);
    return url.searchParams.get('code');
  } catch (error) {
    console.error('Error parsing callback URL:', error);
    return null;
  }
};

export const handleOAuthCallback = async (callbackUrl: string) => {
  try {
    const code = extractCodeFromCallback(callbackUrl);
    
    if (!code) {
      throw new Error('No authorization code found in callback URL');
    }

    const result = await googleLogin(code);
    return result;
  } catch (error) {
    console.error('OAuth callback handling failed:', error);
    throw error;
  }
};