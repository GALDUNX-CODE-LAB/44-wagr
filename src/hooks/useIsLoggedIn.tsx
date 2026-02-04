"use client";

import { useEffect, useState } from "react";
import { getCookie } from "../lib/api/cookie";

function getIsLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!getCookie("access-token");
}

export default function useIsLoggedIn(): boolean {
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);

  useEffect(() => {
    const check = () => setIsLoggedIn(getIsLoggedIn());
    check();
    const onFocus = () => check();
    const onVis = () => check();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(check, 30000);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
    };
  }, []);

  return isLoggedIn;
}
