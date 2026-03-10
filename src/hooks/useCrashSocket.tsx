"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "connecting" | "open" | "closed" | "error";

export default function useCrashSocket(
  onMessage: (msg: any) => void,
  opts?: {
    heartbeatMs?: number;
    maxRetries?: number;
    url?: string;
  },
) {
  const heartbeatMs = opts?.heartbeatMs ?? 25000;
  const maxRetries = opts?.maxRetries ?? 5;

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);
  const retriesRef = useRef(0);

  onMessageRef.current = onMessage;
  retriesRef.current = retries;

  const resolveUrl = useCallback(() => {
    let url = "";

    const explicitWs = (opts?.url || process.env.NEXT_PUBLIC_WS || "").trim();
    if (explicitWs) {
      url = explicitWs.startsWith("http") ? explicitWs.replace(/^http/, "ws") : explicitWs;
    } else {
      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
      if (apiBase) {
        url = apiBase.startsWith("http") ? apiBase.replace(/^http/, "ws") : `ws://${apiBase}`;
      } else if (typeof window !== "undefined") {
        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        url = `${proto}//${window.location.host}`;
      }
    }

    // Browsers block ws:// connections from HTTPS pages (mixed content).
    // Always upgrade to wss:// when the page is served over HTTPS.
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      url = url.replace(/^ws:\/\//, "wss://");
    }

    return url;
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
      setError("Missing NEXT_PUBLIC_WS or NEXT_PUBLIC_API_BASE_URL");
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
          onMessageRef.current?.(msg);
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
        const currentRetries = retriesRef.current;
        if (currentRetries < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, currentRetries), 10000);
          reconnectRef.current = setTimeout(() => {
            retriesRef.current += 1;
            setRetries((r) => r + 1);
            connect();
          }, delay);
        }
      };
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "connect error");
    }
  }, [cleanup, heartbeatMs, maxRetries, resolveUrl]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  const manualReconnect = useCallback(() => {
    retriesRef.current = 0;
    setRetries(0);
    connect();
  }, [connect]);

  return { status, error, retries, manualReconnect };
}
