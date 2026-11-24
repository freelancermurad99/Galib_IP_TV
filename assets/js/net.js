/* =========================================================
   Network helpers
   Playlists are fetched directly when the server allows CORS,
   otherwise through public CORS proxies (configurable).
   ========================================================= */
(function (global) {
  "use strict";
  const G = (global.GTV = global.GTV || {});

  const PROXIES = {
    allorigins: {
      label: "AllOrigins",
      wrap: (url) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
    },
    codetabs: {
      label: "CodeTabs",
      wrap: (url) => "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url),
    },
    corsproxy: {
      label: "corsproxy.io",
      wrap: (url) => "https://corsproxy.io/?url=" + encodeURIComponent(url),
    },
  };

  function customWrapper(prefix) {
    const p = String(prefix || "").trim();
    if (!p) return null;
    return (url) =>
      p.includes("{url}") ? p.replace("{url}", encodeURIComponent(url)) : p + encodeURIComponent(url);
  }

  function wrap(proxyId, customPrefix) {
    if (!proxyId || proxyId === "direct" || proxyId === "none") return null;
    if (proxyId === "custom") return customWrapper(customPrefix);
    const proxy = PROXIES[proxyId];
    return proxy ? proxy.wrap : null;
  }

  function label(proxyId) {
    if (proxyId === "direct") return "direct connection";
    if (proxyId === "custom") return "custom proxy";
    return PROXIES[proxyId] ? PROXIES[proxyId].label : "proxy";
  }

  function isHtml(text) {
    const head = text.slice(0, 500).toLowerCase();
    return (
      head.startsWith("<!doctype") ||
      head.startsWith("<html") ||
      head.includes("<html") ||
      (head.includes("<head") && head.includes("<body"))
    );
  }

  async function fetchText(target, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(target, {
        signal: controller.signal,
        cache: "no-store",
        redirect: "follow",
        credentials: "omit",
        headers: { Accept: "application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*" },
      });
      if (!res.ok) throw new Error("Server responded with HTTP " + res.status);
      const text = await res.text();
      if (isHtml(text)) throw new Error("Received a web page instead of a playlist");
      if (!text || !text.trim()) throw new Error("The response was empty");
      return text;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch a playlist with automatic proxy fallback.
   * @param {string} url
   * @param {{mode?:string, custom?:string, onAttempt?:(id:string)=>void, timeout?:number}} opts
   * @returns {Promise<{text:string, via:string}>}
   */
  async function fetchPlaylist(url, opts = {}) {
    const mode = opts.mode || "auto";
    const custom = opts.custom || "";
    let chain;
    if (mode === "none") chain = ["direct"];
    else if (mode === "auto") chain = ["direct", "allorigins", "codetabs", "corsproxy"];
    else chain = [mode];

    let lastError = null;
    for (let i = 0; i < chain.length; i++) {
      const id = chain[i];
      const wrapper = wrap(id, custom);
      if (id === "custom" && !wrapper) continue;
      const target = wrapper ? wrapper(url) : url;
      if (opts.onAttempt) opts.onAttempt(id, i);
      try {
        const timeout = opts.timeout || (id === "direct" ? 12000 : 22000);
        const text = await fetchText(target, timeout);
        return { text, via: id };
      } catch (err) {
        lastError = err;
        if (err && err.name === "AbortError") lastError = new Error("Request timed out");
      }
    }
    throw lastError || new Error("Could not load the playlist");
  }

  G.net = { PROXIES, fetchPlaylist, wrap, label, customWrapper };
})(window);
