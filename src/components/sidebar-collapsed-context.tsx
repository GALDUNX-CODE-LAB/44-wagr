"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

const SIDEBAR_EXPANDED_PX = 220;
const SIDEBAR_COLLAPSED_PX = 72;
const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

type SidebarCollapsedContextValue = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  sidebarReady: boolean;
};

const SidebarCollapsedContext = createContext<SidebarCollapsedContextValue | null>(null);

export function SidebarCollapsedProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      const nextCollapsed = stored === "1";
      setCollapsed(nextCollapsed);
      document.documentElement.style.setProperty(
        "--sidebar-width",
        nextCollapsed ? `${SIDEBAR_COLLAPSED_PX}px` : `${SIDEBAR_EXPANDED_PX}px`,
      );
    } catch {
      document.documentElement.style.setProperty("--sidebar-width", `${SIDEBAR_EXPANDED_PX}px`);
    }
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarReady) return;
    const w = collapsed ? `${SIDEBAR_COLLAPSED_PX}px` : `${SIDEBAR_EXPANDED_PX}px`;
    document.documentElement.style.setProperty("--sidebar-width", w);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed, sidebarReady]);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, sidebarReady }),
    [collapsed, sidebarReady],
  );

  return <SidebarCollapsedContext.Provider value={value}>{children}</SidebarCollapsedContext.Provider>;
}

export function useSidebarCollapsed() {
  const ctx = useContext(SidebarCollapsedContext);
  if (!ctx) {
    throw new Error("useSidebarCollapsed must be used within SidebarCollapsedProvider");
  }
  return ctx;
}
