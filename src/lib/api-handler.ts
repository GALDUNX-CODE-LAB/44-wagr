import axios, { AxiosRequestConfig } from "axios";
import { getCookie, removeCookie } from "./api/cookie";

interface AxiosOptions {
  method?: string;
  headers?: any;
  body?: any | null;
  [key: string]: any;
}

const apiHandler = async <T = any>(
  endpoint: string,
  options: AxiosOptions = {}
): Promise<T> => {
  const token = getCookie("access-token");
  const isFormData = options.data instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else if ("Content-Type" in headers) {
    delete headers["Content-Type"];
  }

  try {
    const response = await axios({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      url: endpoint,
      ...options,
      headers,
    });
    return response.data;
  } catch (error: any) {
    if (token && error.response?.status === 401) {
      removeCookie("access-token");
      if (typeof window !== "undefined") window.location.reload();
    }
    // Surface what the server actually said. Every caller shows `err.message`,
    // which is axios's generic "Request failed with status code 403" — so a
    // deliberate response like "Dice is currently unavailable" was invisible.
    // Mutating in place keeps .response/.status intact for callers that use them.
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage) error.message = serverMessage;
    throw error;
  }
};

export default apiHandler;
