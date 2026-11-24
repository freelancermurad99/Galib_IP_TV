/* =========================================================
   Player engine
   HLS via hls.js (with an optional CORS-proxy loader),
   MPEG-TS via mpegts.js, everything else natively.
   ========================================================= */
(function (global) {
  "use strict";
  const G = (global.GTV = global.GTV || {});

  function streamKind(url) {
    const clean = String(url || "").split("?")[0].split("#")[0].toLowerCase();
    if (/\.m3u8?$/.test(clean)) return "hls";
    if (/\.mpd$/.test(clean)) return "dash";
    if (/\.ts$/.test(clean)) return "ts";
    if (/\.(mp4|webm|ogv|ogg|m4v|mov)$/.test(clean)) return "video";
    // Most IPTV endpoints without a file extension are HLS.
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
      this.hooks = hooks;
      this.hls = null;
      this.mpegts = null;
      this.channel = null;
      this.wrap = null;
      this.autoplay = true;
      this.lowLatency = true;
      this.usedProxy = false;
      this.mediaRecovered = false;
      this.nativeErrorHandler = null;

      video.addEventListener("playing", () => {
        if (this.channel) this.emit("playing", {});
      });
      video.addEventListener("waiting", () => {
        if (this.channel) this.emit("buffering", {});
      });
      video.addEventListener("pause", () => {
        if (this.channel && !video.ended && !video.seeking) this.emit("paused", {});
      });
      video.addEventListener("ended", () => {
        if (this.channel) this.emit("ended", {});
      });
    }

    emit(type, data) {
      try {
        if (this.hooks.onState) this.hooks.onState(type, data || {});
      } catch (err) {
        console.error("[GalibTV] player hook error", err);
      }
    }

    play(channel, opts = {}) {
      if (!channel || !channel.url) return;
      this.stopEngines();
      this.channel = channel;
      this.wrap = opts.wrap || null;
      this.autoplay = opts.autoplay !== false;
      this.lowLatency = opts.lowLatency !== false;
      this.mediaRecovered = false;
      this.usedProxy = false;
      this.emit("loading", { message: "Connecting to stream…" });

      const kind = streamKind(channel.url);
      const proxyFirst = !!opts.useProxyFirst && !!this.wrap;

      if (kind === "hls") this.startHls(proxyFirst ? this.wrap : null);
      else if (kind === "ts") this.startMpegts();
      else if (kind === "dash") {
        this.emit("error", {
          title: "DASH streams are not supported",
          text: "This player handles HLS (m3u8), MPEG-TS and direct video files. Look for an HLS version of this channel.",
        });
      } else this.startNative();
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
