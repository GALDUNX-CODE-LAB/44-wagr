import Cookies from "js-cookie";

export const setCookie = (name: string, value: any, EX: number = 1) => {
  console.log(`Setting cookie: ${name}`, { value, expires: EX, path: '/', secure: process.env.NODE_ENV === 'production' });
  Cookies.set(name, value, { expires: EX, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production', path: '/' });
};

export const getCookie = (name: string): string | undefined => {
  const value = Cookies.get(name);
  console.log(`Getting cookie: ${name}`, { value });
  return value;
};

export const removeCookie = (name: string) => {
  console.log(`Removing cookie: ${name}`);
  Cookies.remove(name, { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production', path: '/' });
};