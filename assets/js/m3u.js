/* =========================================================
   M3U / M3U8 parser
   Exposes: GTV.m3u.parse(text) -> Channel[]
   ========================================================= */
(function (global) {
  "use strict";
  const G = (global.GTV = global.GTV || {});

  const ATTR_RE = /([\w-]+)\s*=\s*"([^"]*)"/g;

  /* Small, fast 53-bit string hash -> base36 id */
  function hash(str) {
    let h1 = 0xdeadbeef ^ str.length;
    let h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function parseExtinf(line) {
    const attrs = {};
    const meta = line.replace(/^#EXTINF:\s*/i, "");
    let m;
    ATTR_RE.lastIndex = 0;
    while ((m = ATTR_RE.exec(meta)) !== null) attrs[m[1].toLowerCase()] = m[2];

    // The channel name is everything after the first comma that is not
    // inside a quoted attribute value.
    let inQuote = false;
    let cut = -1;
    for (let i = 0; i < meta.length; i++) {
      const c = meta[i];
      if (c === '"') inQuote = !inQuote;
      else if (c === "," && !inQuote) {
        cut = i;
        break;
      }
    }

    return {
      name: cut >= 0 ? meta.slice(cut + 1).trim() : "",
      logo: (attrs["tvg-logo"] || attrs["logo"] || "").trim(),
      group: (attrs["group-title"] || "").trim(),
      tvgId: (attrs["tvg-id"] || "").trim(),
      tvgName: (attrs["tvg-name"] || "").trim(),
    };
  }

  function guessName(url) {
    try {
      const u = new URL(url);
      const last = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || u.hostname);
      return last.replace(/\.(m3u8?|ts|mp4|mpd)$/i, "").replace(/[_-]+/g, " ").slice(0, 60) || u.hostname;
    } catch {
      return "Channel";
    }
  }

  function cleanName(name) {
    return String(name || "")
      .replace(/\s+/g, " ")
      .replace(/^[\s|•>-]+/, "")
      .trim();
  }

  function parse(text) {
    const channels = [];
    if (!text || typeof text !== "string") return channels;

    const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
    const seen = new Set();
    let pending = null;
    let extGroup = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#EXTINF/i.test(line)) {
        pending = parseExtinf(line);
        continue;
      }

      if (/^#EXTGRP:/i.test(line)) {
        extGroup = line.slice(8).trim();
        continue;
      }

      if (line.charAt(0) === "#") continue;

      if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(line)) continue;

      if (pending) {
        const name = cleanName(pending.name || pending.tvgName) || guessName(line);
        const group = cleanName(pending.group || extGroup) || "General";
        const dedupeKey = line + "|" + name;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          channels.push({
            id: hash(dedupeKey),
            name,
            url: line,
            logo: pending.logo,
            group,
            tvgId: pending.tvgId,
          });
        }
        pending = null;
        extGroup = "";
      } else {
        const name = guessName(line);
        const dedupeKey = line + "|" + name;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          channels.push({
            id: hash(dedupeKey),
            name,
            url: line,
            logo: "",
            group: "General",
            tvgId: "",
          });
        }
      }
    }

    return channels;
  }

  G.m3u = { parse, hash, guessName };
})(window);
