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
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

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
    throw error;
  }
};

export default apiHandler;
