/**
 * Resolve the live-wins WebSocket URL.
 *
 * The socket server is mounted on the same http server as the REST API, so the
 * URL is derivable from the API base — it does not need its own env var. Every
 * live-wins component used to read NEXT_PUBLIC_WS alone and `return` silently
 * when it was empty, which is a build-time inline: a deploy without that one
 * variable set left every live feed dead while REST still worked, so the tables
 * only ever updated on reload.
 *
 * Same resolution order useCrashSocket already used.
 */
export function getWsUrl(): string {
  let url = "";

  const explicitWs = (process.env.NEXT_PUBLIC_WS || "").trim();
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

  // Browsers block ws:// from HTTPS pages (mixed content).
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    url = url.replace(/^ws:\/\//, "wss://");
  }

  return url;
}
