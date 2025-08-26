"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "connecting" | "open" | "closed" | "error";

export default function useCrashSocket(
  onMessage: (msg: any) => void,
  opts?: {
    heartbeatMs?: number;
    maxRetries?: number;
    url?: string;
  }
) {
  const heartbeatMs = opts?.heartbeatMs ?? 25000;
  const maxRetries = opts?.maxRetries ?? 5;

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const resolveUrl = useCallback(() => {
    const raw = opts?.url || process.env.NEXT_PUBLIC_WS || "";
    if (raw) {
      if (raw.startsWith("http")) return raw.replace(/^http/, "ws");
      return raw;
    }
    if (typeof window !== "undefined") {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${proto}//${window.location.host}/ws`;
    }
    return "";
  }, [opts?.url]);

  const cleanup = useCallback(() => {
    if (hbRef.current) {
      clearInterval(hbRef.current);
      hbRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null as any;
        wsRef.current.onclose = null as any;
        wsRef.current.onmessage = null as any;
        wsRef.current.onerror = null as any;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();
    const url = resolveUrl();
    if (!url) {
      setStatus("error");
      setError("Missing NEXT_PUBLIC_WS or url");
      return;
    }

    setStatus("connecting");
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("open");
        setRetries(0);
        if (hbRef.current) clearInterval(hbRef.current);
        hbRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: "ping" }));
            } catch {}
          }
        }, heartbeatMs);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          console.log(msg);
          onMessage(msg);
        } catch (err: any) {
          setError(err?.message || "parse error");
        }
      };

      ws.onerror = () => {
        setStatus("error");
        setError("socket error");
      };

      ws.onclose = () => {
        setStatus("closed");
        if (retries < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retries), 10000);
          reconnectRef.current = setTimeout(() => {
            setRetries((r) => r + 1);
            connect();
          }, delay);
        }
      };
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "connect error");
    }
  }, [cleanup, heartbeatMs, maxRetries, onMessage, resolveUrl, retries]);

  useEffect(() => {
    connect();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manualReconnect = useCallback(() => {
    setRetries(0);
    connect();
  }, [connect]);

  return { status, error, retries, manualReconnect };
}
