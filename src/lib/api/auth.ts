import { setCookie, getCookie, removeCookie } from './cookie';

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
        errorData,
      });
      throw new Error(errorData.message || 'Failed to fetch nonce');
    }

    const data = await response.json();
    console.log('Nonce response:', data);
    return data;
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
    const errorData = await response.json().catch(() => ({}));
    console.error('Verify signature failed:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
    });
    throw new Error(errorData.message || 'Failed to verify signature');
  }

  const data = await response.json();
  console.log('Verify signature response:', data);
  return data;
};

export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  console.log('Setting auth tokens:', { accessToken, refreshToken });
  if (!accessToken) {
    console.error('No access token provided to setAuthTokens');
    return;
  }
  setCookie('access-token', accessToken, 7);
  if (refreshToken) {
    setCookie('refresh-token', refreshToken, 30);
  }
  window.dispatchEvent(new Event('auth-change'));
};

export const clearAuthTokens = () => {
  console.log('Clearing auth tokens');
  removeCookie('access-token');
  removeCookie('refresh-token');
  window.dispatchEvent(new Event('auth-change'));
};

export const logout = (disconnect?: () => void, preventRedirect = false) => {
  try {
    console.log('🔄 Starting logout process');
    clearAuthTokens();
    if (disconnect) {
      console.log('🔌 Disconnecting wallet');
      disconnect();
    }
    if (!preventRedirect) {
      setTimeout(() => {
        console.log('🏠 Redirecting to home page');
        window.location.href = '/';
      }, 100);
    }
    console.log('✅ Logout process completed');
  } catch (err) {
    console.error('Error during logout:', err);
    if (!preventRedirect) {
      window.location.href = '/';
    }
  }
};

export const googleLogin = async (code: string) => {
  try {
    const encodedCode = encodeURIComponent(code);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
    }
    const url = `${baseUrl}/auth/google/callback?code=${encodedCode}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google login failed:', { status: response.status, statusText: response.statusText, errorText });
      throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Google login response:', data);

    const accessToken = data.access_token || data.accessToken || data.token || (data.data ? data.data.access_token || data.data.accessToken || data.data.token : null);
    const refreshToken = data.refresh_token || data.refreshToken || (data.data ? data.data.refresh_token || data.data.refreshToken : null);

    if (!accessToken) {
      console.error('No access token found in response:', data);
      throw new Error('No access token received from server');
    }

    setAuthTokens(accessToken, refreshToken);
    return data;
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
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
    }
    const response = await fetch(`${baseUrl}/auth/google`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google redirect failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error('Failed to initiate Google authentication');
    }

    const data = await response.json();
    console.log('Google redirect response:', data);

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

export const isAuthenticated = (): boolean => {
  const token = getCookie('access-token');
  return !!token;
};

export const getAuthMethod = (isWalletConnected: boolean, walletAddress: string | undefined): 'wallet' | 'token' | null => {
  const token = getCookie('access-token');
  if (!token) return null;
  return (isWalletConnected && walletAddress) ? 'wallet' : 'token';
};