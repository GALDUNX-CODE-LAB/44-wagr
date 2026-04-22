"use client";

import { useRef, useCallback, useEffect } from "react";

export function useGameLoop(tick: (dt: number) => void, running: boolean) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  const loop = useCallback((time: number) => {
    const dt = Math.min(time - lastTimeRef.current, 32); // cap at 32ms
    lastTimeRef.current = time;
    tickRef.current(dt);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame((t) => {
        lastTimeRef.current = t;
        rafRef.current = requestAnimationFrame(loop);
      });
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, loop]);
}
