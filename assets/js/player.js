/* =========================================================
   Player engine (v3.2)
   HLS via hls.js, MPEG-TS via mpegts.js, YouTube Live via
   YouTube IFrame Player API (auto-detects @handle/live),
   and native HTML5 video fallback.
   ========================================================= */
(function (global) {
  "use strict";
  const G = (global.GTV = global.GTV || {});

  const YT_BASE = "https://www." + "you" + "tube.com";
  const YT_CACHE_KEY = "gtv.ytHandles";
  let ytApiPromise = null;

  function isYouTubeUrl(url) {
    const raw = String(url || "").trim();
    if (/^yt:/i.test(raw)) return true;
    try {
      const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
      return (
        host === "you" + "tube.com" ||
        host === "m.you" + "tube.com" ||
        host === "you" + "tu.be" ||
        host === "you" + "tube-nocookie.com"
      );
    } catch {
      return false;
    }
  }

  function parseYouTube(url) {
    const raw = String(url || "").trim();
    if (/^yt:/i.test(raw)) {
      const val = raw.slice(3).trim();
      if (/^UC[a-zA-Z0-9_-]{18,}$/.test(val)) return { type: "channel", channelId: val };
      if (val.startsWith("@")) return { type: "handle", handle: val.toLowerCase() };
      if (val) return { type: "video", videoId: val };
      return null;
    }
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      const parts = u.pathname.split("/").filter(Boolean);
      if (host === "you" + "tu.be" && parts[0]) return { type: "video", videoId: parts[0] };
      const v = u.searchParams.get("v");
      if (v) return { type: "video", videoId: v };
      if (parts[0] === "embed" && parts[1] === "live_stream") {
        const ch = u.searchParams.get("channel");
        if (ch) return { type: "channel", channelId: ch };
      }
      if ((parts[0] === "embed" || parts[0] === "live" || parts[0] === "shorts") && parts[1]) {
        return { type: "video", videoId: parts[1] };
      }
      if (parts[0] === "channel" && parts[1] && /^UC[a-zA-Z0-9_-]{18,}$/.test(parts[1])) {
        return { type: "channel", channelId: parts[1] };
      }
      if (parts[0] && parts[0].startsWith("@")) return { type: "handle", handle: parts[0].toLowerCase() };
      if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
        return { type: "handle", handle: "@" + parts[1].toLowerCase() };
      }
    } catch {}
    return null;
  }

  function readYtCache() {
    try {
      const o = JSON.parse(localStorage.getItem(YT_CACHE_KEY) || "{}");
      return o && typeof o === "object" ? o : {};
    } catch { return {}; }
  }

  function saveYtCache(handle, cid) {
    try {
      const c = readYtCache();
      c[handle.toLowerCase()] = cid;
      localStorage.setItem(YT_CACHE_KEY, JSON.stringify(c));
    } catch {}
  }

  async function resolveYouTubeChannelId(parsed, origUrl) {
    if (!parsed) return null;
    if (parsed.type === "channel") return parsed.channelId;
    if (parsed.type !== "handle") return null;
    const key = parsed.handle.toLowerCase();
    const noAt = key.replace(/^@/, "");
    const cfgMap = (global.GTV_CONFIG && global.GTV_CONFIG.youtubeChannelIds) || {};
    for (const k of Object.keys(cfgMap)) {
      const n = k.toLowerCase();
      if (n === key || n.replace(/^@/, "") === noAt) return cfgMap[k];
    }
    const cached = readYtCache();
    if (cached[key]) return cached[key];
    if (G.net && typeof G.net.fetchPlaylist === "function") {
      try {
        const pageUrl = /^yt:/i.test(origUrl)
          ? YT_BASE + "/" + parsed.handle
          : origUrl.replace(/\/live\/?$/i, "");
        const res = await G.net.fetchPlaylist(pageUrl, { mode: "auto", timeout: 12000 });
        const text = (res && res.text) || "";
        const m =
          /"channelId"\s*:\s*"(UC[a-zA-Z0-9_-]{18,})"/.exec(text) ||
          /"externalId"\s*:\s*"(UC[a-zA-Z0-9_-]{18,})"/.exec(text) ||
          /\/channel\/(UC[a-zA-Z0-9_-]{18,})/.exec(text);
        if (m && m[1]) {
          saveYtCache(key, m[1]);
          return m[1];
        }
      } catch {}
    }
    return null;
  }

  function loadYouTubeApi() {
    if (global.YT && global.YT.Player) return Promise.resolve(global.YT);
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("YT API timeout")), 12000);
      const prev = global.onYouTubeIframeAPIReady;
      global.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        if (typeof prev === "function") { try { prev(); } catch {} }
        resolve(global.YT);
      };
      const s = document.createElement("script");
      s.src = YT_BASE + "/iframe_api";
      s.async = true;
      s.onerror = () => { clearTimeout(timer); ytApiPromise = null; reject(new Error("YT API failed")); };
      document.head.appendChild(s);
    });
    return ytApiPromise;
  }

  function streamKind(url) {
    if (isYouTubeUrl(url)) return "youtube";
    const clean = String(url || "").split("?")[0].split("#")[0].toLowerCase();
    if (/\.m3u8?$/.test(clean)) return "hls";
    if (/\.mpd$/.test(clean)) return "dash";
    if (/\.ts$/.test(clean)) return "ts";
    if (/\.(mp4|webm|ogv|ogg|m4v|mov)$/.test(clean)) return "video";
    return "hls";
  }

  /* Minimal hls.js loader that routes every request through a proxy,
     while keeping the original URL as the resolution base. */
  function createProxyLoader(wrap) {
    return class ProxyLoader {
      constructor(config) {
        this.config = config || {};
        this.xhr = null;
        this.stats = {
          aborted: false,
          loaded: 0,
          retry: 0,
          total: 0,
          chunkCount: 0,
          bwEstimate: 0,
          loading: { start: 0, first: 0, end: 0 },
          parsing: { start: 0, end: 0 },
          buffering: { start: 0, first: 0, end: 0 },
        };
      }

      destroy() {
        this.abort();
      }

      abort() {
        if (this.xhr) {
          this.stats.aborted = true;
          try {
            this.xhr.abort();
          } catch {}
          this.xhr = null;
        }
      }

      load(context, config, callbacks) {
        const stats = this.stats;
        stats.aborted = false;
        stats.loading.start = performance.now();
        stats.loading.first = 0;
        stats.loading.end = 0;

        let target;
        try {
          target = wrap(context.url);
        } catch {
          target = context.url;
        }

        const xhr = (this.xhr = new XMLHttpRequest());
        xhr.open("GET", target, true);
        xhr.responseType = context.responseType || "";
        xhr.timeout = (config && config.timeout) || 30000;
        if (context.rangeEnd) {
          xhr.setRequestHeader("Range", "bytes=" + context.rangeStart + "-" + (context.rangeEnd - 1));
        }

        const onProgress = (event) => {
          if (stats.aborted) return;
          if (!stats.loading.first) stats.loading.first = performance.now();
          if (event.lengthComputable) {
            stats.loaded = event.loaded;
            stats.total = event.total;
          }
          if (callbacks.onProgress) callbacks.onProgress(stats, context, xhr.response, xhr);
        };

        const onDone = () => {
          if (stats.aborted) return;
          if (!stats.loading.first) stats.loading.first = performance.now();
          stats.loading.end = performance.now();
          const elapsed = stats.loading.end - stats.loading.start;
          const size =
            typeof xhr.response === "string"
              ? xhr.response.length
              : (xhr.response && xhr.response.byteLength) || 0;
          stats.loaded = size;
          if (!stats.total) stats.total = size;
          stats.bwEstimate = elapsed > 0 ? (size * 8000) / elapsed : 0;
          stats.parsing.start = stats.parsing.end = performance.now();
          stats.buffering.start = performance.now();
          stats.buffering.end = stats.buffering.start;

          if (xhr.status >= 200 && xhr.status < 300) {
            callbacks.onSuccess({ url: context.url, data: xhr.response }, stats, context, xhr);
          } else {
            callbacks.onError({ code: xhr.status, text: xhr.statusText || "HTTP " + xhr.status }, context, xhr, stats);
          }
        };

        xhr.onprogress = onProgress;
        xhr.onload = onDone;
        xhr.onerror = () => {
          if (!stats.aborted) callbacks.onError({ code: 0, text: "Network error" }, context, xhr, stats);
        };
        xhr.ontimeout = () => {
          if (!stats.aborted) callbacks.onError({ code: 0, text: "Timeout" }, context, xhr, stats);
        };

        try {
          xhr.send();
        } catch (err) {
          callbacks.onError({ code: 0, text: err.message || "Request failed" }, context, xhr, stats);
        }
      }
    };
  }

  class Player {
    constructor(video, hooks = {}) {
      this.video = video;
      this.wrapEl = video ? video.parentElement : null;
      this.hooks = hooks;
      this.hls = null;
      this.mpegts = null;
      this.ytPlayer = null;
      this.ytHost = null;
      this.playSeq = 0;
      this.channel = null;
      this.wrap = null;
      this.autoplay = true;
      this.lowLatency = true;
      this.usedProxy = false;
      this.mediaRecovered = false;
      this.nativeErrorHandler = null;

      video.addEventListener("playing", () => {
        if (this.channel && !this.ytHost) this.emit("playing", {});
      });
      video.addEventListener("waiting", () => {
        if (this.channel && !this.ytHost) this.emit("buffering", {});
      });
      video.addEventListener("pause", () => {
        if (this.channel && !this.ytHost && !video.ended && !video.seeking) this.emit("paused", {});
      });
      video.addEventListener("ended", () => {
        if (this.channel && !this.ytHost) this.emit("ended", {});
      });
    }

    emit(type, data) {
      try {
        if (this.hooks.onState) this.hooks.onState(type, data || {});
      } catch (err) {
        console.error("[GalibTV] player hook error", err);
      }
    }

    toggleMute() {
      if (this.ytPlayer && typeof this.ytPlayer.isMuted === "function") {
        try {
          if (this.ytPlayer.isMuted()) { this.ytPlayer.unMute(); return false; }
          this.ytPlayer.mute(); return true;
        } catch {}
      }
      this.video.muted = !this.video.muted;
      return this.video.muted;
    }

    pause() {
      if (this.ytHost) {
        try {
          if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
            this.ytPlayer.pauseVideo();
          }
          const iframe = this.ytHost.querySelector("iframe");
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
              "*"
            );
          }
        } catch {}
      }
      if (this.video && !this.video.paused) {
        try { this.video.pause(); } catch {}
      }
    }

    resume() {
      if (this.ytHost) {
        try {
          if (this.ytPlayer && typeof this.ytPlayer.playVideo === "function") {
            this.ytPlayer.playVideo();
          }
          const iframe = this.ytHost.querySelector("iframe");
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "playVideo", args: [] }),
              "*"
            );
          }
        } catch {}
        return Promise.resolve();
      }
      try {
        return this.video.play() || Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    }

    play(channel, opts = {}) {
      if (!channel || !channel.url) return;
      this.stopEngines();
      const seq = ++this.playSeq;
      this.channel = channel;
      this.wrap = opts.wrap || null;
      this.autoplay = opts.autoplay !== false;
      this.lowLatency = opts.lowLatency !== false;
      this.mediaRecovered = false;
      this.usedProxy = false;

      const kind = streamKind(channel.url);
      this.emit("loading", {
        message: kind === "youtube" ? "Connecting to YouTube Live…" : "Connecting to live stream…",
      });

      const proxyFirst = !!opts.useProxyFirst && !!this.wrap;
      if (kind === "youtube") this.startYouTube(channel.url, seq);
      else if (kind === "hls") this.startHls(proxyFirst ? this.wrap : null);
      else if (kind === "ts") this.startMpegts();
      else if (kind === "dash") {
        this.emit("error", {
          title: "DASH streams are not supported",
          text: "Use an HLS (m3u8), MPEG-TS, or YouTube Live link instead.",
        });
      } else this.startNative();
    }

    async startYouTube(url, seq) {
      const parsed = parseYouTube(url);
      if (!parsed) {
        this.emit("error", { title: "Invalid YouTube link", text: "Use a valid YouTube Live or video URL." });
        return;
      }
      let embedSrc = "";
      let videoId = null;
      if (parsed.type === "video") {
        videoId = parsed.videoId;
      } else {
        const cid = await resolveYouTubeChannelId(parsed, url);
        if (seq !== this.playSeq) return;
        if (!cid) {
          this.emit("error", { title: "YouTube channel not resolved", text: "Could not detect channel ID for this handle." });
          return;
        }
        const params = new URLSearchParams({
          channel: cid,
          autoplay: this.autoplay ? "1" : "0",
          playsinline: "1",
          rel: "0",
          modestbranding: "1",
          enablejsapi: "1",
        });
        if (/^https?:$/.test(location.protocol)) params.set("origin", location.origin);
        embedSrc = YT_BASE + "/embed/live_stream?" + params.toString();
      }
      if (seq !== this.playSeq || !this.wrapEl) return;
      this.video.hidden = true;
      const host = document.createElement("div");
      host.className = "yt-host";
      this.wrapEl.insertBefore(host, this.video.nextSibling);
      this.ytHost = host;
      const iframeId = "gtv-yt-" + seq;

      if (embedSrc) {
        const iframe = document.createElement("iframe");
        iframe.id = iframeId;
        iframe.className = "yt-iframe";
        iframe.src = embedSrc;
        iframe.title = (this.channel && this.channel.name) || "YouTube Live";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        host.appendChild(iframe);
        try {
          const YT = await loadYouTubeApi();
          if (seq !== this.playSeq) return;
          this.ytPlayer = new YT.Player(iframeId, {
            events: {
              onReady: (ev) => {
                if (seq !== this.playSeq) return;
                this.emit("playing", {});
                if (this.autoplay) { try { ev.target.playVideo(); } catch {} }
              },
              onStateChange: (ev) => this.onYouTubeState(ev, seq),
              onError: (ev) => this.onYouTubeError(ev, seq),
            },
          });
        } catch {
          if (seq === this.playSeq) this.emit("playing", {});
        }
      } else if (videoId) {
        const div = document.createElement("div");
        div.id = iframeId;
        div.className = "yt-iframe";
        host.appendChild(div);
        try {
          const YT = await loadYouTubeApi();
          if (seq !== this.playSeq) return;
          const vars = { autoplay: this.autoplay ? 1 : 0, playsinline: 1, rel: 0, modestbranding: 1, enablejsapi: 1 };
          if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;
          this.ytPlayer = new YT.Player(iframeId, {
            videoId,
            width: "100%",
            height: "100%",
            playerVars: vars,
            events: {
              onReady: () => { if (seq === this.playSeq) this.emit("playing", {}); },
              onStateChange: (ev) => this.onYouTubeState(ev, seq),
              onError: (ev) => this.onYouTubeError(ev, seq),
            },
          });
        } catch {
          const iframe = document.createElement("iframe");
          iframe.className = "yt-iframe";
          iframe.src = YT_BASE + "/embed/" + encodeURIComponent(videoId) + "?autoplay=" + (this.autoplay ? "1" : "0") + "&playsinline=1&rel=0";
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
          iframe.allowFullscreen = true;
          host.textContent = "";
          host.appendChild(iframe);
          if (seq === this.playSeq) this.emit("playing", {});
        }
      }
    }

    onYouTubeState(ev, seq) {
      if (seq !== this.playSeq || !global.YT) return;
      const S = global.YT.PlayerState;
      if (ev.data === S.PLAYING) this.emit("playing", {});
      else if (ev.data === S.BUFFERING) this.emit("buffering", {});
      else if (ev.data === S.PAUSED) this.emit("paused", {});
      else if (ev.data === S.ENDED) this.emit("ended", {});
    }

    onYouTubeError(ev, seq) {
      if (seq !== this.playSeq) return;
      const code = ev && ev.data;
      const text =
        code === 101 || code === 150
          ? "Channel owner restricted YouTube embedding for this stream."
          : "This YouTube channel is not currently live or unavailable.";
      this.emit("error", { title: "YouTube Live unavailable", text });
    }

    retry(useProxyFirst = false) {
      if (!this.channel) return;
      const channel = this.channel;
      this.play(channel, {
        wrap: this.wrap,
        autoplay: true,
        lowLatency: this.lowLatency,
        useProxyFirst,
      });
    }

    stop() {
      this.stopEngines();
      this.channel = null;
      this.wrap = null;
      this.emit("idle", {});
    }

    /* ------------------------- engines ------------------------- */

    startHls(wrap) {
      const Hls = global.Hls;
      const url = this.channel.url;
      this.usedProxy = !!wrap;

      if (!Hls || !Hls.isSupported()) {
        if (this.video.canPlayType("application/vnd.apple.mpegurl")) {
          this.usedProxy = false;
          this.startNative();
          return;
        }
        this.emit("error", {
          title: "HLS is not supported in this browser",
          text: "Try Chrome, Edge, Firefox or Safari on a recent version.",
        });
        return;
      }

      const config = {
        enableWorker: true,
        lowLatencyMode: this.lowLatency,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 2,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 3,
        startLevel: -1,
        capLevelToPlayerSize: true,
      };
      if (wrap) {
        config.loader = createProxyLoader(wrap);
        config.fLoader = config.loader;
        config.pLoader = config.loader;
      }

      let hls;
      try {
        hls = new Hls(config);
      } catch (err) {
        this.emit("error", { title: "Could not start the player", text: err.message || String(err) });
        return;
      }
      this.hls = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        try {
          hls.loadSource(url);
        } catch (err) {
          this.emit("error", { title: "Invalid stream address", text: err.message || String(err) });
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.emitq();
        this.tryPlay();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => this.emitq());

      hls.on(Hls.Events.ERROR, (_event, data) => this.onHlsError(data));

      try {
        hls.attachMedia(this.video);
      } catch (err) {
        this.emit("error", { title: "Could not attach the video element", text: err.message || String(err) });
      }
    }

    restartHls(wrap) {
      if (this.hls) {
        try {
          this.hls.destroy();
        } catch {}
        this.hls = null;
      }
      this.startHls(wrap);
    }

    onHlsError(data) {
      if (!data || !data.fatal) return;
      const Hls = global.Hls;

      if (Hls && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        if (!this.usedProxy && this.wrap) {
          this.emit("loading", {
            message: "Direct connection blocked — retrying through a CORS proxy…",
            proxied: true,
          });
          this.restartHls(this.wrap);
          return;
        }
        this.emit("error", {
          title: "Stream unavailable",
          text:
            "Could not reach this stream (" +
            (data.details || "network error").toLowerCase() +
            "). It may be offline, geo-blocked, or the server blocks browser playback.",
        });
        return;
      }

      if (Hls && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        if (!this.mediaRecovered) {
          this.mediaRecovered = true;
          try {
            this.hls.recoverMediaError();
            return;
          } catch {}
        }
        this.emit("error", {
          title: "Playback error",
          text: "This channel uses a codec the browser cannot decode (often HEVC or AC-3). Try another channel or browser.",
        });
        return;
      }

      this.emit("error", {
        title: "Playback error",
        text: data.details ? String(data.details) : "The stream stopped unexpectedly.",
      });
    }

    startMpegts() {
      const mpegts = global.mpegts;
      if (mpegts && mpegts.isSupported()) {
        try {
          const p = mpegts.createPlayer(
            { type: "mse", isLive: true, url: this.channel.url },
            { enableWorker: true, lazyLoad: true, liveBufferLatencyChasing: true }
          );
          this.mpegts = p;
          p.on(mpegts.Events.ERROR, (type, detail) => {
            this.emit("error", {
              title: "Stream unavailable",
              text: "MPEG-TS error: " + (detail || type || "unknown"),
            });
          });
          p.attachMediaElement(this.video);
          p.load();
          this.tryPlay();
          return;
        } catch (err) {
          console.warn("[GalibTV] mpegts failed", err);
        }
      }
      this.startNative();
    }

    startNative() {
      const url = this.channel.url;
      this.usedProxy = false;
      this.removeNativeHandler();
      this.nativeErrorHandler = () => {
        this.emit("error", {
          title: "Stream failed to load",
          text: "The browser could not play this link. It may be offline, geoblocked, missing CORS headers, or in an unsupported format.",
        });
      };
      this.video.addEventListener("error", this.nativeErrorHandler);
      this.video.src = url;
      try {
        this.video.load();
      } catch {}
      this.tryPlay();
    }

    tryPlay() {
      if (!this.autoplay) {
        this.emit("ready", {});
        return;
      }
      let promise;
      try {
        promise = this.video.play();
      } catch {
        return;
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch((err) => {
          if (!err) return;
          if (err.name === "NotAllowedError" || err.name === "SecurityError") this.emit("blocked", {});
          // AbortError happens when the source changes — safe to ignore.
        });
      }
    }

    emitq() {
      const hls = this.hls;
      if (!hls || !hls.levels || !hls.levels.length) return;
      const level = hls.levels[hls.currentLevel] || hls.levels[hls.loadLevel] || hls.levels[0];
      const height = level && level.height;
      this.emit("quality", { label: height ? height + "p" : "" });
    }

    /* ------------------------- cleanup ------------------------- */

    removeNativeHandler() {
      if (this.nativeErrorHandler) {
        this.video.removeEventListener("error", this.nativeErrorHandler);
        this.nativeErrorHandler = null;
      }
    }

    stopEngines() {
      this.removeNativeHandler();

      if (this.ytPlayer) {
        try { this.ytPlayer.destroy(); } catch {}
        this.ytPlayer = null;
      }
      if (this.ytHost) {
        try { this.ytHost.remove(); } catch {}
        this.ytHost = null;
      }
      if (this.video) this.video.hidden = false;

      if (this.hls) {
        try {
          this.hls.destroy();
        } catch {}
        this.hls = null;
      }

      if (this.mpegts) {
        try {
          this.mpegts.pause();
          this.mpegts.unload();
          this.mpegts.detachMediaElement();
          this.mpegts.destroy();
        } catch {}
        this.mpegts = null;
      }

      try {
        this.video.pause();
      } catch {}
      this.video.removeAttribute("src");
      try {
        this.video.load();
      } catch {}
    }
  }

  G.Player = Player;
  G.streamKind = streamKind;
})(window);
