import Cookies from "js-cookie";

export const setCookie = (name: string, value: any, EX: number = 1) => {
  Cookies.set(name, value, { expires: EX, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production', path: '/' });
};

export const getCookie = (name: string): string | undefined => {
  const value = Cookies.get(name);
  return value;
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production', path: '/' });
};