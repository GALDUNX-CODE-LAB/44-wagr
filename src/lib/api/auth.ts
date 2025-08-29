import { setCookie, getCookie, removeCookie } from "./cookie";

export const requestNonce = async (walletAddress: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/nonce`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch nonce");
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error while requesting nonce"
    );
  }
};

export const verifySignature = async (
  walletAddress: string,
  signature: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress, signature }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to verify signature");
  }

  return await response.json();
};

export const setAuthTokens = (
  accessToken: string,
  refreshToken?: string,
  authMethod?: "wallet" | "token",
  address?: string
) => {
  if (!accessToken) {
    return;
  }
  setCookie("access-token", accessToken, 1);
  if (refreshToken) {
    setCookie("refresh-token", refreshToken, 1);
  }
  if (authMethod) {
    setCookie("auth-method", authMethod, 1);
  }
  if (address && authMethod === "wallet") {
    setCookie("auth-address", address, 1);
  }
  window.dispatchEvent(new Event("auth-change"));
};

export const clearAuthTokens = () => {
  removeCookie("access-token");
  removeCookie("refresh-token");
  removeCookie("auth-method");
  removeCookie("auth-address");
  window.dispatchEvent(new Event("auth-change"));
};

export const logout = (disconnect?: () => void, preventRedirect = false) => {
  try {
    clearAuthTokens();
    if (disconnect) {
      disconnect();
    }
    if (!preventRedirect) {
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  } catch (err) {
    if (!preventRedirect) {
      window.location.href = "/";
    }
  }
};

export const googleLogin = async (code: string) => {
  try {
    const encodedCode = encodeURIComponent(code);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }
    const url = `${baseUrl}/auth/google/callback?code=${encodedCode}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Authentication failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    const accessToken =
      data.access_token ||
      data.accessToken ||
      data.token ||
      (data.data
        ? data.data.access_token || data.data.accessToken || data.data.token
        : null);
    const refreshToken =
      data.refresh_token ||
      data.refreshToken ||
      (data.data ? data.data.refresh_token || data.data.refreshToken : null);

    if (!accessToken) {
      throw new Error("No access token received from server");
    }

    setAuthTokens(accessToken, refreshToken);
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Cannot connect to ${process.env.NEXT_PUBLIC_API_BASE_URL}`
      );
    }
    throw new Error(
      error instanceof Error ? error.message : "Google login failed"
    );
  }
};

export const handleGoogleRedirect = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }
    const response = await fetch(`${baseUrl}/auth/google`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error("Failed to initiate Google authentication");
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("Invalid response from authentication server");
    }
  } catch (error) {
    throw error;
  }
};

export const extractCodeFromCallback = (callbackUrl: string): string | null => {
  try {
    const url = new URL(callbackUrl);
    return url.searchParams.get("code");
  } catch (error) {
    return null;
  }
};

export const handleOAuthCallback = async (callbackUrl: string) => {
  try {
    const code = extractCodeFromCallback(callbackUrl);
    if (!code) {
      throw new Error("No authorization code found in callback URL");
    }
    return await googleLogin(code);
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getCookie("access-token");
  return !!token;
};

export const getAuthMethod = (
  isWalletConnected: boolean,
  walletAddress: string | undefined
): "wallet" | "token" | null => {
  const token = getCookie("access-token");
  if (!token) return null;
  return isWalletConnected && walletAddress ? "wallet" : "token";
};
