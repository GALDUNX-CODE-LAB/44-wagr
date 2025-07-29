import axios, { AxiosRequestConfig } from "axios";

const apiHandler = async <T = any>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> => {
  const token = localStorage.getItem("access-token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await axios({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    url: endpoint,
    ...options,
    headers,
  });
  return response.data;
};

export default apiHandler;
