import Cookies from "js-cookie";

// setting cookies
export const setCookie = (name: string, value: any, EX: number = 1) => {
  Cookies.set(name, value, { expires: EX });
};

export const getCookie = (name: string) => {
  if (name) return Cookies.get(name);
  return Cookies.get();
};

export const removeCookie = (name: string) => {
  if (name) return Cookies.remove(name);
  return Cookies.remove("");
};
