/* =========================================================
   Galib TV — application UI
   ========================================================= */
(function (global) {
  "use strict";
  const G = global.GTV;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ----------------------------- config ----------------------------- */

  const DEMOS = [
    { label: "Bangladesh", name: "Bangladesh TV", url: "https://iptv-org.github.io/iptv/countries/bd.m3u" },
    { label: "News", name: "News channels", url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
    { label: "Music", name: "Music channels", url: "https://iptv-org.github.io/iptv/categories/music.m3u" },
    { label: "Movies", name: "Movie channels", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
    { label: "Sports", name: "Sports channels", url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
    { label: "Kids", name: "Kids channels", url: "https://iptv-org.github.io/iptv/categories/kids.m3u" },
    { label: "All", name: "iptv-org — all channels", url: "https://iptv-org.github.io/iptv/index.m3u" },
  ];

  const PAGE_SIZE = 80;

  const ICONS = {
    tv: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 21h8M12 17.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8.4c0-.6.7-1 1.2-.7l3.9 2.5c.5.3.5 1 0 1.3l-3.9 2.5c-.5.3-1.2-.1-1.2-.7V8.4Z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5c0-.8.9-1.3 1.6-.9l8 6.5c.6.5.6 1.3 0 1.8l-8 6.5c-.7.4-1.6 0-1.6-.9v-13Z" fill="currentColor"/></svg>',
  };

  /* ----------------------------- elements ----------------------------- */

  const els = {
    video: $("#video"),
    videoWrap: $("#video-wrap"),
    idle: $("#player-idle"),
    spinner: $("#player-spinner"),
    spinnerText: $(".spinner-text"),
    errorBox: $("#player-error"),
    errorTitle: $("#error-title"),
    errorText: $("#error-text"),
    errorRetry: $("#btn-error-retry"),
    errorProxy: $("#btn-error-proxy"),
    liveBadge: $("#live-badge"),
    qualityBadge: $("#quality-badge"),
    screenTitle: $("#screen-title"),

    nowLogo: $("#now-logo"),
    nowTitle: $("#now-title"),
    nowSub: $("#now-sub"),
    favBtn: $("#btn-fav"),
    muteBtn: $("#btn-mute"),
    pipBtn: $("#btn-pip"),
    fullBtn: $("#btn-full"),
    retryBtn: $("#btn-retry"),
    streamMeta: $("#stream-meta"),
    streamUrl: $("#stream-url"),
    copyBtn: $("#btn-copy"),

    search: $("#search"),
    addBtn: $("#btn-add"),
    themeBtn: $("#btn-theme"),
    settingsBtn: $("#btn-settings"),
    demoBtn: $("#btn-demo"),
    hintNote: $("#hint-note"),
    statusPill: $("#status-pill"),
    statusText: $("#status-text"),

    tabs: $$(".rail-tabs [data-tab]"),
    groupFilter: $("#group-filter"),
    playlistSelect: $("#playlist-select"),
    reloadPlaylist: $("#btn-reload-playlist"),
    list: $("#channel-list"),
    listMore: $("#list-more"),
    moreBtn: $("#btn-more"),
    chanCount: $("#chan-count"),
    activeName: $("#active-name"),

    modalAdd: $("#modal-add"),
    modalSettings: $("#modal-settings"),
    formUrl: $("#form-url"),
    inUrl: $("#in-url"),
    inName: $("#in-name"),
    formFile: $("#form-file"),
    inFile: $("#in-file"),
    dropZone: $("#drop-zone"),
    fileName: $("#file-name"),
    formText: $("#form-text"),
    inTextName: $("#in-text-name"),
    inText: $("#in-text"),
    quickPicks: $("#quick-picks"),
    modeBtns: $$("#modal-add .seg [data-mode]"),
    panes: $$("#modal-add .pane"),

    setPlaylistProxy: $("#set-playlist-proxy"),
    setCustomProxy: $("#set-custom-proxy"),
    customProxyField: $("#custom-proxy-field"),
    setStreamProxy: $("#set-stream-proxy"),
    setAutoplay: $("#set-autoplay"),
    setLowlatency: $("#set-lowlatency"),
    resetBtn: $("#btn-reset"),
    manageList: $("#playlist-manage"),

    toasts: $("#toasts"),
  };

  /* ----------------------------- state ----------------------------- */

  const state = {
    playlists: [],
    channels: [],
    activeId: null,
    current: null,
    tab: "all",
    group: "all",
    query: "",
    filtered: [],
    rendered: 0,
    favorites: [],
    recent: [],
    settings: G.store.DEFAULT_SETTINGS,
    lastVia: "direct",
    pendingFile: null,
    loadGen: 0,
    blockedToastShown: false,
  };

  let player = null;

  /* ============================== init ============================== */

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    state.settings = G.store.getSettings();
    state.playlists = G.store.getPlaylists();
    state.favorites = G.store.getFavorites();
    state.recent = G.store.getRecent();

    applyTheme(G.store.getTheme());
    buildQuickPicks();
    renderPlaylistSelect();
    rebuildGroups();
    renderList();
    updateNowPlaying(null);
    renderManage();
    setStatus("Ready");

    player = new G.Player(els.video, {
      onState: onPlayerState,
      onQuality: onQuality,
    });

    bindEvents();

    const params = new URLSearchParams(location.search);
    const shared = params.get("playlist");
    if (shared) {
      setStatus("Loading shared playlist", "busy");
      const ok = await addPlaylistFromUrl(shared, params.get("name") || "");
      if (!ok) toast("The shared playlist could not be loaded.", "err");
      return;
    }

    const hadPlaylists = state.playlists.length > 0;
    await ensureDefaultPlaylists();

    if (hadPlaylists && state.playlists.length) {
      const saved = G.store.getActiveId();
      const meta = state.playlists.find((p) => p.id === saved) || state.playlists[0];
      await activatePlaylist(meta.id);
    }
  }

  /* ============================== default playlists ============================== */

  async function ensureDefaultPlaylists() {
    const config = global.GTV_CONFIG || {};
    const defaults = Array.isArray(config.defaultPlaylists)
      ? config.defaultPlaylists.filter((p) => p && p.url && p.enabled !== false)
      : [];
    if (!defaults.length) return false;

    const firstRun = state.playlists.length === 0;
    if (!firstRun && config.ensureDefaults !== true) return false;

    const loaded = new Map();
    const failures = [];
    let firstId = null;

    for (const item of defaults) {
      const url = normalizeUrl(item.url);
      if (!url) continue;
      if (state.playlists.some((p) => p.url === url)) continue;

      const name = (item.name || nameFromUrl(url)).trim() || "Playlist";
      try {
        setStatus("Loading " + name, "busy");
        if (firstRun && !firstId) showListLoading(name);

        const res = await G.net.fetchPlaylist(url, proxyOptions());
        const channels = G.m3u.parse(res.text);
        if (!channels.length) throw new Error("No channels were found");
        state.lastVia = res.via || state.lastVia;

        const meta = {
          id: G.store.uid(),
          name,
          url,
          count: channels.length,
          addedAt: Date.now(),
          updatedAt: Date.now(),
          source: "default",
        };
        state.playlists.push(meta);
        G.store.savePlaylists(state.playlists);
        await G.store.cacheChannels(meta.id, channels);

        loaded.set(meta.id, channels);
        if (!firstId) firstId = meta.id;
        renderPlaylistSelect();
      } catch (err) {
        console.warn("[GalibTV] default playlist failed", url, err);
        failures.push(name);
      }
    }

    if (failures.length) {
      toast(
        "Could not load " + failures.join(", ") + " — you can add a playlist manually.",
        "warn",
        8000
      );
    }

    if (firstRun) {
      if (state.playlists.length) {
        const id = firstId || state.playlists[0].id;
        await activatePlaylist(id, loaded.has(id) ? { channels: loaded.get(id) } : {});
        return true;
      }
      renderPlaylistSelect();
      renderList();
      return false;
    }

    renderPlaylistSelect();
    return state.playlists.length > 0;
  }

  /* ============================== events ============================== */

  function bindEvents() {
    els.addBtn.addEventListener("click", openAddModal);
    els.settingsBtn.addEventListener("click", openSettings);
    els.themeBtn.addEventListener("click", toggleTheme);
    els.demoBtn.addEventListener("click", loadDemo);
    $$("[data-open-add]").forEach((b) => b.addEventListener("click", openAddModal));

    els.search.addEventListener("input", () => {
      state.query = els.search.value.trim();
      debounceRender();
    });
    els.search.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = computeFiltered()[0];
        if (first) playChannel(first);
      }
      if (e.key === "Escape") {
        els.search.value = "";
        state.query = "";
        renderList();
        els.search.blur();
      }
    });

    els.tabs.forEach((btn) => {
      btn.addEventListener("click", () => setTab(btn.dataset.tab));
    });

    els.groupFilter.addEventListener("change", () => {
      state.group = els.groupFilter.value;
      renderList();
    });

    els.playlistSelect.addEventListener("change", () => {
      if (els.playlistSelect.value) activatePlaylist(els.playlistSelect.value);
    });

    els.reloadPlaylist.addEventListener("click", reloadActivePlaylist);
    els.moreBtn.addEventListener("click", appendPage);

    els.list.addEventListener("click", (e) => {
      const addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        openAddModal();
        return;
      }
      const demoBtn = e.target.closest("[data-demo-url]");
      if (demoBtn) {
        addPlaylistFromUrl(demoBtn.dataset.demoUrl, demoBtn.dataset.demoName || "");
        return;
      }
      const reloadBtn = e.target.closest('[data-action="reload"]');
      if (reloadBtn) {
        reloadActivePlaylist();
        return;
      }
      const item = e.target.closest(".ch");
      if (!item) return;
      const ch = findChannel(item.dataset.id);
      if (ch) playChannel(ch);
    });

    els.favBtn.addEventListener("click", () => toggleFavorite(state.current));
    els.retryBtn.addEventListener("click", () => {
      if (!state.current) return toast("Choose a channel first.", "warn");
      player.retry(false);
    });
    els.muteBtn.addEventListener("click", toggleMute);
    els.pipBtn.addEventListener("click", togglePip);
    els.fullBtn.addEventListener("click", toggleFullscreen);
    els.errorRetry.addEventListener("click", () => player.retry(false));
    els.errorProxy.addEventListener("click", () => player.retry(true));
    els.copyBtn.addEventListener("click", copyStreamUrl);

    els.video.addEventListener("volumechange", () => {
      els.muteBtn.classList.toggle("is-active", els.video.muted || els.video.volume === 0);
    });

    document.addEventListener("fullscreenchange", () => {
      const full = !!document.fullscreenElement;
      els.screenTitle.hidden = !(full && state.current);
    });

    /* modal wiring */
    $$(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });
    $$("[data-close]").forEach((b) =>
      b.addEventListener("click", () => closeModal(b.closest(".modal")))
    );

    els.modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => setAddMode(btn.dataset.mode));
    });

    els.formUrl.addEventListener("submit", onUrlSubmit);
    els.formFile.addEventListener("submit", onFileSubmit);
    els.formText.addEventListener("submit", onTextSubmit);

    els.inFile.addEventListener("change", () => {
      const file = els.inFile.files && els.inFile.files[0];
      setPendingFile(file || null);
    });

    ["dragenter", "dragover"].forEach((evt) =>
      els.dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        els.dropZone.classList.add("is-over");
      })
    );
    ["dragleave", "drop"].forEach((evt) =>
      els.dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        els.dropZone.classList.remove("is-over");
      })
    );
    els.dropZone.addEventListener("drop", (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        setPendingFile(file);
      }
    });

    /* settings wiring */
    els.setPlaylistProxy.addEventListener("change", () => {
      state.settings.playlistProxy = els.setPlaylistProxy.value;
      els.customProxyField.hidden = state.settings.playlistProxy !== "custom";
      saveSettings();
    });
    els.setCustomProxy.addEventListener("change", () => {
      state.settings.customProxy = els.setCustomProxy.value.trim();
      saveSettings();
    });
    els.setStreamProxy.addEventListener("change", () => {
      state.settings.streamProxy = els.setStreamProxy.value;
      saveSettings();
    });
    els.setAutoplay.addEventListener("change", () => {
      state.settings.autoplay = els.setAutoplay.checked;
      saveSettings();
    });
    els.setLowlatency.addEventListener("change", () => {
      state.settings.lowLatency = els.setLowlatency.checked;
      saveSettings();
    });
    els.resetBtn.addEventListener("click", resetEverything);

    document.addEventListener("keydown", onKeyDown);
  }

  /* ============================== playlist loading ============================== */

  function proxyOptions() {
    return {
      mode: state.settings.playlistProxy,
      custom: state.settings.customProxy,
      onAttempt: (id) => {
        setStatus(id === "direct" ? "Loading playlist…" : "Trying " + G.net.label(id) + "…", "busy");
      },
    };
  }

  async function addPlaylistFromUrl(rawUrl, name) {
    const url = normalizeUrl(rawUrl);
    if (!url) {
      toast("That doesn’t look like a valid URL.", "err");
      return false;
    }

    const existing = state.playlists.find((p) => p.url === url);
    if (existing) {
      if (existing.name !== (name || existing.name)) {
        existing.name = name || existing.name;
        G.store.savePlaylists(state.playlists);
      }
      toast("That playlist is already added — refreshing it.", "warn");
      closeModal(els.modalAdd);
      await activatePlaylist(existing.id, { force: true });
      return true;
    }

    setStatus("Loading playlist", "busy");
    try {
      const res = await G.net.fetchPlaylist(url, proxyOptions());
      const channels = G.m3u.parse(res.text);
      if (!channels.length) throw new Error("No channels were found in this playlist.");
      state.lastVia = res.via;
      await addPlaylistFromChannels(channels, name || nameFromUrl(url), "url", url);
      setHint(
        res.via === "direct"
          ? "Streams play directly from their source — nothing is stored on our side."
          : "Playlist loaded through " + G.net.label(res.via) + ". Streams use the same route as a fallback."
      );
      closeModal(els.modalAdd);
      setStatus("Ready");
      return true;
    } catch (err) {
      setStatus("Could not load", "error");
      toast(friendlyError(err), "err", 8000);
      return false;
    }
  }

  async function addPlaylistFromChannels(channels, name, source, url) {
    const meta = {
      id: G.store.uid(),
      name: name || "My playlist",
      url: url || "",
      count: channels.length,
      addedAt: Date.now(),
      updatedAt: Date.now(),
      source: source || "text",
    };
    state.playlists.push(meta);
    G.store.savePlaylists(state.playlists);
    await G.store.cacheChannels(meta.id, channels);
    await activatePlaylist(meta.id, { channels });
    toast("Loaded " + channels.length.toLocaleString() + " channels", "ok");
    return meta;
  }

  async function activatePlaylist(id, opts = {}) {
    const meta = state.playlists.find((p) => p.id === id);
    if (!meta) return;

    const gen = ++state.loadGen;
    state.activeId = id;
    G.store.setActiveId(id);
    state.group = "all";
    els.groupFilter.value = "all";
    els.activeName.textContent = meta.name;
    renderPlaylistSelect();

    let channels = opts.channels || null;

    if (!channels && !opts.force) {
      const cached = await G.store.getCachedChannels(id);
      if (gen !== state.loadGen) return;
      if (cached && cached.channels && cached.channels.length) channels = cached.channels;
    }

    if (!channels) {
      if (!meta.url) {
        channels = [];
      } else {
        setStatus("Loading " + meta.name, "busy");
        showListLoading(meta.name);
        try {
          const res = await G.net.fetchPlaylist(meta.url, proxyOptions());
          if (gen !== state.loadGen) return;
          channels = G.m3u.parse(res.text);
          state.lastVia = res.via;
          if (!channels.length) throw new Error("No channels were found in this playlist.");
          await G.store.cacheChannels(id, channels);
        } catch (err) {
          if (gen !== state.loadGen) return;
          toast(friendlyError(err), "err", 8000);
          if (opts.force && state.activeId === id && state.channels.length) {
            renderList();
            setStatus("Ready");
            return;
          }
          channels = [];
        }
      }
    }

    if (gen !== state.loadGen) return;

    state.channels = channels || [];
    meta.count = state.channels.length;
    meta.updatedAt = Date.now();
    G.store.savePlaylists(state.playlists);

    rebuildGroups();
    renderList();
    setStatus(state.channels.length ? "Ready" : "No channels");
  }

  async function reloadActivePlaylist() {
    const meta = state.playlists.find((p) => p.id === state.activeId);
    if (!meta) return toast("Add a playlist first.", "warn");
    if (!meta.url) return toast("This playlist came from a file or paste — remove and re-add it to refresh.", "warn");
    toast("Refreshing " + meta.name + "…");
    await activatePlaylist(meta.id, { force: true });
  }

  /* ============================== playback ============================== */

  function playChannel(channel) {
    if (!channel || !channel.url) return;
    state.current = channel;
    state.blockedToastShown = false;

    addRecent(channel);
    updateNowPlaying(channel);
    markActiveChannel();
    els.screenTitle.textContent = channel.name;

    const live = isLiveKind(channel.url);
    els.liveBadge.hidden = !live;
    els.qualityBadge.hidden = true;

    const wrap = streamWrapper();
    const mixedContent = location.protocol === "https:" && /^http:\/\//i.test(channel.url);
    const useProxyFirst = !!wrap && (mixedContent || state.settings.streamProxy === "always");

    player.play(channel, {
      wrap,
      useProxyFirst,
      autoplay: state.settings.autoplay,
      lowLatency: state.settings.lowLatency,
    });

    document.title = channel.name + " · Galib TV";

    if (window.matchMedia("(max-width: 1000px)").matches) {
      const card = document.querySelector(".player-card");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function streamWrapper() {
    if (state.settings.streamProxy === "never") return null;
    if (state.settings.playlistProxy === "custom" && state.settings.customProxy) {
      return G.net.wrap("custom", state.settings.customProxy);
    }
    if (["allorigins", "codetabs", "corsproxy"].includes(state.lastVia)) {
      return G.net.wrap(state.lastVia);
    }
    if (["allorigins", "codetabs", "corsproxy"].includes(state.settings.playlistProxy)) {
      return G.net.wrap(state.settings.playlistProxy);
    }
    return G.net.wrap("allorigins");
  }

  function onPlayerState(type, data) {
    switch (type) {
      case "loading":
        els.spinner.hidden = false;
        els.spinnerText.textContent = data.message || "Connecting to stream…";
        els.errorBox.hidden = true;
        els.idle.hidden = true;
        els.liveBadge.hidden = true;
        setStatus(data.proxied ? "Retrying via proxy" : "Connecting", "busy");
        break;

      case "playing":
        els.spinner.hidden = true;
        els.errorBox.hidden = true;
        els.idle.hidden = true;
        els.liveBadge.hidden = !isLiveKind(state.current && state.current.url);
        els.screenTitle.hidden = !document.fullscreenElement;
        setStatus(isLiveKind(state.current && state.current.url) ? "Live" : "Playing", "live");
        break;

      case "ready":
        els.spinner.hidden = true;
        setStatus("Ready");
        break;

      case "buffering":
        setStatus("Buffering", "busy");
        break;

      case "paused":
        els.spinner.hidden = true;
        setStatus("Paused");
        break;

      case "blocked":
        els.spinner.hidden = true;
        setStatus("Press play");
        if (!state.blockedToastShown) {
          state.blockedToastShown = true;
          toast("Autoplay was blocked — press play on the video.", "warn");
        }
        break;

      case "ended":
        setStatus("Ended");
        break;

      case "quality":
        if (data && data.label) {
          els.qualityBadge.textContent = data.label;
          els.qualityBadge.hidden = false;
        }
        break;

      case "error":
        els.spinner.hidden = true;
        els.liveBadge.hidden = true;
        els.qualityBadge.hidden = true;
        els.errorTitle.textContent = data.title || "Stream failed to load";
        els.errorText.textContent =
          data.text || "The channel may be offline, geo-blocked, or missing CORS headers.";
        els.errorBox.hidden = false;
        setStatus("Stream error", "error");
        break;

      case "idle":
        els.spinner.hidden = true;
        els.errorBox.hidden = true;
        els.liveBadge.hidden = true;
        els.qualityBadge.hidden = true;
        els.screenTitle.hidden = true;
        setIdle(true);
        setStatus("Ready");
        break;
    }
  }

  function onQuality(_type, data) {
    if (data && data.label) {
      els.qualityBadge.textContent = data.label;
      els.qualityBadge.hidden = false;
    }
  }

  function isLiveKind(url) {
    const kind = G.streamKind(url || "");
    return kind === "hls" || kind === "ts";
  }

  function setIdle(show) {
    els.idle.hidden = !show;
    if (show) els.video.removeAttribute("src");
  }

  /* ============================== now playing ============================== */

  function updateNowPlaying(channel) {
    if (!channel) {
      els.nowTitle.textContent = "Nothing playing";
      els.nowSub.textContent = "Pick a channel from the list";
      setLogo(els.nowLogo, null);
      els.favBtn.classList.remove("is-active");
      els.favBtn.title = "Add to favourites";
      els.streamMeta.hidden = true;
      els.streamUrl.textContent = "";
      return;
    }
    els.nowTitle.textContent = channel.name;
    els.nowSub.textContent = channel.group ? channel.group + " · Live TV" : "Live TV";
    setLogo(els.nowLogo, channel);
    const fav = isFavorite(channel.id);
    els.favBtn.classList.toggle("is-active", fav);
    els.favBtn.title = fav ? "Remove from favourites" : "Add to favourites";
    els.streamMeta.hidden = false;
    els.streamUrl.textContent = channel.url;
    els.streamUrl.title = channel.url;
  }

  function setLogo(el, channel) {
    el.textContent = "";
    const fallback = document.createElement("span");
    fallback.textContent = channel ? initials(channel.name) : "TV";
    el.appendChild(fallback);
    if (!channel || !channel.logo) return;
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => img.remove());
    img.src = channel.logo;
    el.appendChild(img);
  }

  function initials(name) {
    const clean = String(name || "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .trim();
    if (!clean) return "TV";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function addRecent(channel) {
    const list = [channel].concat(state.recent.filter((c) => c.id !== channel.id)).slice(0, 40);
    state.recent = list;
    G.store.saveRecent(list);
    if (state.tab === "recent") renderList();
  }

  function isFavorite(id) {
    return state.favorites.some((c) => c.id === id);
  }

  function toggleFavorite(channel) {
    if (!channel) return toast("Play or pick a channel first.", "warn");
    const idx = state.favorites.findIndex((c) => c.id === channel.id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      toast("Removed from favourites");
    } else {
      state.favorites.unshift(channel);
      state.favorites = state.favorites.slice(0, 500);
      toast("Added to favourites", "ok");
    }
    G.store.saveFavorites(state.favorites);
    const fav = isFavorite(channel.id);
    els.favBtn.classList.toggle("is-active", fav);
    els.favBtn.title = fav ? "Remove from favourites" : "Add to favourites";
    if (state.tab === "fav") renderList();
  }

  /* ============================== list rendering ============================== */

  function computeFiltered() {
    let list;
    if (state.tab === "fav") list = state.favorites.slice();
    else if (state.tab === "recent") list = state.recent.slice();
    else list = state.channels;

    const q = state.query.toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.group || "").toLowerCase().includes(q)
      );
    }
    if (state.tab === "all" && state.group !== "all") {
      list = list.filter((c) => (c.group || "General") === state.group);
    }
    return list;
  }

  function renderList() {
    state.filtered = computeFiltered();
    state.rendered = 0;
    els.list.textContent = "";
    els.list.scrollTop = 0;

    if (!state.filtered.length) {
      renderListEmpty();
      els.listMore.hidden = true;
      updateCount();
      return;
    }

    appendPage();
    updateCount();
  }

  function appendPage() {
    const end = Math.min(state.rendered + PAGE_SIZE, state.filtered.length);
    const frag = document.createDocumentFragment();
    for (let i = state.rendered; i < end; i++) frag.appendChild(buildChannelEl(state.filtered[i]));
    els.list.appendChild(frag);
    state.rendered = end;
    els.listMore.hidden = end >= state.filtered.length;
    updateCount();
  }

  function buildChannelEl(channel) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ch";
    btn.dataset.id = channel.id;
    btn.title = channel.name;

    if (state.current && state.current.id === channel.id) {
      btn.classList.add("is-active", "is-playing");
    }

    const logo = document.createElement("span");
    logo.className = "ch-logo";
    const initial = document.createElement("span");
    initial.textContent = initials(channel.name);
    logo.appendChild(initial);
    if (channel.logo) {
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => img.remove());
      img.src = channel.logo;
      logo.appendChild(img);
    }

    const text = document.createElement("span");
    text.className = "ch-text";
    const name = document.createElement("span");
    name.className = "ch-name";
    name.textContent = channel.name;
    const group = document.createElement("span");
    group.className = "ch-group";
    group.textContent = channel.group || "General";
    text.append(name, group);

    const now = document.createElement("span");
    now.className = "ch-now";
    now.textContent = "NOW";

    const play = document.createElement("span");
    play.className = "ch-play";
    play.innerHTML = ICONS.play;

    btn.append(logo, text, now, play);
    return btn;
  }

  function showListLoading(name) {
    els.list.textContent = "";
    els.listMore.hidden = true;

    const box = document.createElement("div");
    box.className = "empty";

    const art = document.createElement("div");
    art.className = "empty-art";
    const ring = document.createElement("span");
    ring.className = "ring";
    ring.style.width = "24px";
    ring.style.height = "24px";
    ring.style.borderWidth = "2px";
    art.appendChild(ring);

    const title = document.createElement("h3");
    title.textContent = "Loading " + name + "…";
    const text = document.createElement("p");
    text.textContent = "Fetching the playlist. Big lists can take a few seconds.";

    box.append(art, title, text);
    els.list.appendChild(box);
  }

  function renderListEmpty() {
    const box = document.createElement("div");
    box.className = "empty";

    const art = document.createElement("div");
    art.className = "empty-art";

    const title = document.createElement("h3");
    const text = document.createElement("p");

    let icon = ICONS.tv;
    let actions = [];

    if (state.tab === "fav") {
      icon = ICONS.star;
      title.textContent = "No favourites yet";
      text.textContent = "Tap the star in the player bar to pin channels here.";
    } else if (state.tab === "recent") {
      icon = ICONS.clock;
      title.textContent = "Nothing watched yet";
      text.textContent = "Channels you play will show up here for quick access.";
    } else if (state.query) {
      icon = ICONS.search;
      title.textContent = "No matches";
      text.textContent = "Nothing found for “" + state.query + "”. Try another name or group.";
    } else if (!state.playlists.length) {
      title.textContent = "Add your first playlist";
      text.textContent = "Paste an M3U / M3U8 URL, upload a file, or start with free public channels.";
      actions = ["add", "demos"];
    } else {
      title.textContent = "This playlist is empty";
      text.textContent = "Reload it, or add another playlist with working channels.";
      actions = ["reload", "add"];
    }

    art.innerHTML = icon;
    box.append(art, title, text);

    if (actions.length) {
      const wrap = document.createElement("div");
      wrap.className = "chips";

      if (actions.includes("add")) {
        const b = document.createElement("button");
        b.className = "btn btn-ghost";
        b.type = "button";
        b.dataset.action = "add";
        b.textContent = "Add playlist";
        wrap.appendChild(b);
      }
      if (actions.includes("reload")) {
        const b = document.createElement("button");
        b.className = "btn btn-ghost";
        b.type = "button";
        b.dataset.action = "reload";
        b.textContent = "Reload";
        wrap.appendChild(b);
      }
      if (actions.includes("demos")) {
        DEMOS.slice(0, 4).forEach((demo) => {
          const b = document.createElement("button");
          b.className = "chip";
          b.type = "button";
          b.dataset.demoUrl = demo.url;
          b.dataset.demoName = demo.name;
          b.textContent = demo.label;
          wrap.appendChild(b);
        });
      }
      box.appendChild(wrap);
    }

    els.list.appendChild(box);
  }

  function markActiveChannel() {
    $$(".ch", els.list).forEach((el) => {
      const active = state.current && el.dataset.id === state.current.id;
      el.classList.toggle("is-active", !!active);
      el.classList.toggle("is-playing", !!active);
    });
  }

  function updateCount() {
    const shown = state.filtered.length;
    const total = state.channels.length;
    let text = shown.toLocaleString() + (shown === 1 ? " channel" : " channels");
    if (state.tab === "all" && shown !== total && total) text = shown.toLocaleString() + " of " + total.toLocaleString();
    els.chanCount.textContent = text;
  }

  function rebuildGroups() {
    const counts = new Map();
    state.channels.forEach((c) => {
      const g = c.group || "General";
      counts.set(g, (counts.get(g) || 0) + 1);
    });

    const options = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    els.groupFilter.textContent = "";
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "All groups (" + state.channels.length.toLocaleString() + ")";
    els.groupFilter.appendChild(all);
    options.forEach(([group, count]) => {
      const opt = document.createElement("option");
      opt.value = group;
      opt.textContent = group + " (" + count + ")";
      els.groupFilter.appendChild(opt);
    });

    if (state.group !== "all" && !counts.has(state.group)) state.group = "all";
    els.groupFilter.value = state.group;
    els.groupFilter.disabled = !state.channels.length;
  }

  function renderPlaylistSelect() {
    els.playlistSelect.textContent = "";
    if (!state.playlists.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No playlist";
      els.playlistSelect.appendChild(opt);
      els.playlistSelect.disabled = true;
      return;
    }
    els.playlistSelect.disabled = false;
    state.playlists.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name + " (" + (p.count || 0).toLocaleString() + ")";
      if (p.id === state.activeId) opt.selected = true;
      els.playlistSelect.appendChild(opt);
    });
  }

  function setTab(tab) {
    state.tab = tab;
    els.tabs.forEach((b) => {
      const on = b.dataset.tab === tab;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.groupFilter.disabled = tab !== "all" || !state.channels.length;
    renderList();
  }

  /* ============================== searching ============================== */

  let searchTimer = 0;
  function debounceRender() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderList, 120);
  }

  function findChannel(id) {
    return (
      state.channels.find((c) => c.id === id) ||
      state.favorites.find((c) => c.id === id) ||
      state.recent.find((c) => c.id === id) ||
      null
    );
  }

  /* ============================== UI helpers ============================== */

  function setStatus(text, kind) {
    els.statusText.textContent = text;
    els.statusPill.className = "status-pill" + (kind ? " is-" + kind : "");
  }

  function setHint(text) {
    els.hintNote.textContent = text;
  }

  function setAddMode(mode) {
    els.modeBtns.forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.panes.forEach((p) => (p.hidden = p.dataset.pane !== mode));
    if (mode === "url") setTimeout(() => els.inUrl.focus(), 30);
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    if (!$(".modal:not([hidden])")) document.body.style.overflow = "";
  }

  function closeAllModals() {
    $$(".modal:not([hidden])").forEach(closeModal);
  }

  function openAddModal() {
    setAddMode("url");
    openModal(els.modalAdd);
  }

  function openSettings() {
    els.setPlaylistProxy.value = state.settings.playlistProxy;
    els.setCustomProxy.value = state.settings.customProxy || "";
    els.customProxyField.hidden = state.settings.playlistProxy !== "custom";
    els.setStreamProxy.value = state.settings.streamProxy;
    els.setAutoplay.checked = !!state.settings.autoplay;
    els.setLowlatency.checked = !!state.settings.lowLatency;
    renderManage();
    openModal(els.modalSettings);
  }

  function setBtnBusy(btn, busy, label) {
    if (!btn) return;
    if (busy) {
      btn.dataset.original = btn.textContent;
      btn.disabled = true;
      btn.textContent = label || "Loading…";
    } else {
      btn.disabled = false;
      if (btn.dataset.original) btn.textContent = btn.dataset.original;
    }
  }

  function toast(message, kind, ms) {
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " is-" + kind : "");
    el.textContent = message;
    els.toasts.appendChild(el);
    const remove = () => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 200);
    };
    el.addEventListener("click", remove);
    setTimeout(remove, ms || 4200);
  }

  function friendlyError(err) {
    const msg = (err && err.message) || String(err || "Unknown error");
    if (/failed to fetch|networkerror|load failed|network error/i.test(msg)) {
      return "Could not reach that URL. Check the link, or pick a proxy in Settings and try again.";
    }
    if (/abort|timeout/i.test(msg)) {
      return "The request timed out. The server may be slow — try again or use a proxy.";
    }
    return msg;
  }

  /* ============================== forms ============================== */

  async function onUrlSubmit(e) {
    e.preventDefault();
    const btn = els.formUrl.querySelector('button[type="submit"]');
    const url = els.inUrl.value.trim();
    if (!url) return;
    setBtnBusy(btn, true);
    const ok = await addPlaylistFromUrl(url, els.inName.value.trim());
    setBtnBusy(btn, false);
    if (ok) {
      els.inUrl.value = "";
      els.inName.value = "";
    }
  }

  function setPendingFile(file) {
    state.pendingFile = file;
    els.fileName.textContent = file ? file.name + " · " + Math.max(1, Math.round(file.size / 1024)) + " KB" : "";
  }

  async function onFileSubmit(e) {
    e.preventDefault();
    if (!state.pendingFile) {
      toast("Choose an .m3u or .m3u8 file first.", "warn");
      return;
    }
    const btn = els.formFile.querySelector('button[type="submit"]');
    setBtnBusy(btn, true);
    try {
      const text = await state.pendingFile.text();
      const channels = G.m3u.parse(text);
      if (!channels.length) throw new Error("No channels were found in that file.");
      const name = state.pendingFile.name.replace(/\.[^.]+$/, "") || "Uploaded playlist";
      await addPlaylistFromChannels(channels, name, "file");
      closeModal(els.modalAdd);
    } catch (err) {
      toast(friendlyError(err), "err", 7000);
    } finally {
      setBtnBusy(btn, false);
    }
  }

  async function onTextSubmit(e) {
    e.preventDefault();
    const text = els.inText.value.trim();
    if (!text) {
      toast("Paste some M3U content first.", "warn");
      return;
    }
    const btn = els.formText.querySelector('button[type="submit"]');
    setBtnBusy(btn, true);
    try {
      const channels = G.m3u.parse(text);
      if (!channels.length) throw new Error("No channels were found in the pasted content.");
      await addPlaylistFromChannels(channels, els.inTextName.value.trim() || "Pasted playlist", "text");
      els.inText.value = "";
      els.inTextName.value = "";
      closeModal(els.modalAdd);
    } catch (err) {
      toast(friendlyError(err), "err", 7000);
    } finally {
      setBtnBusy(btn, false);
    }
  }

  async function loadDemo() {
    const existing = state.playlists.find((p) => p.source === "demo");
    if (existing) {
      await activatePlaylist(existing.id);
      toast("Demo playlist already added.");
      return;
    }
    setStatus("Loading demo", "busy");
    try {
      const res = await fetch("sample/demo.m3u", { cache: "no-store" });
      if (!res.ok) throw new Error("Demo playlist could not be fetched (HTTP " + res.status + ")");
      const channels = G.m3u.parse(await res.text());
      if (!channels.length) throw new Error("Demo playlist is empty.");
      await addPlaylistFromChannels(channels, "Demo channels", "demo");
      setStatus("Ready");
    } catch (err) {
      setStatus("Demo unavailable");
      toast(friendlyError(err) + " — try adding a playlist URL instead.", "err", 7000);
    }
  }

  /* ============================== playlist management ============================== */

  function renderManage() {
    if (!els.manageList) return;
    els.manageList.textContent = "";
    if (!state.playlists.length) {
      const p = document.createElement("p");
      p.className = "hint";
      p.textContent = "No playlists yet.";
      els.manageList.appendChild(p);
      return;
    }
    state.playlists.forEach((pl) => {
      const row = document.createElement("div");
      row.className = "manage-item";

      const info = document.createElement("div");
      info.className = "manage-info";
      const name = document.createElement("strong");
      name.textContent = pl.name;
      const meta = document.createElement("span");
      meta.textContent =
        (pl.count || 0).toLocaleString() + " channels" + (pl.url ? " · URL" : " · local");
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "manage-actions";

      if (pl.url) {
        const refresh = document.createElement("button");
        refresh.type = "button";
        refresh.className = "mini-btn";
        refresh.textContent = "Refresh";
        refresh.addEventListener("click", () => activatePlaylist(pl.id, { force: true }));
        actions.appendChild(refresh);
      }

      const del = document.createElement("button");
      del.type = "button";
      del.className = "mini-btn danger";
      del.textContent = "Remove";
      del.addEventListener("click", () => deletePlaylist(pl.id));
      actions.appendChild(del);

      row.append(info, actions);
      els.manageList.appendChild(row);
    });
  }

  async function deletePlaylist(id) {
    const meta = state.playlists.find((p) => p.id === id);
    if (!meta) return;
    if (!confirm('Remove "' + meta.name + '" from this browser?')) return;

    state.playlists = state.playlists.filter((p) => p.id !== id);
    G.store.savePlaylists(state.playlists);
    await G.store.deleteCachedChannels(id);
    renderManage();
    renderPlaylistSelect();

    if (state.activeId === id) {
      state.activeId = null;
      state.channels = [];
      state.current = null;
      player.stop();
      updateNowPlaying(null);
      if (state.playlists.length) {
        await activatePlaylist(state.playlists[0].id);
      } else {
        G.store.setActiveId(null);
        resetPlayerView();
      }
    }
    toast("Playlist removed");
  }

  function resetPlayerView() {
    state.current = null;
    player.stop();
    updateNowPlaying(null);
    rebuildGroups();
    renderList();
    els.activeName.textContent = "No playlist loaded";
    document.title = "Galib TV — Web IPTV Player";
  }

  async function resetEverything() {
    if (!confirm("Reset all local data? This removes playlists, favourites, recents and settings.")) return;
    G.store.reset();
    await G.store.clearChannelCache();
    location.reload();
  }

  function saveSettings() {
    G.store.saveSettings(state.settings);
  }

  /* ============================== misc UI ============================== */

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === "light" ? "#f4f7fb" : "#080b10";
    G.store.setTheme(t);
  }

  function toggleTheme() {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  }

  function toggleMute() {
    els.video.muted = !els.video.muted;
  }

  async function togglePip() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && state.current) {
        await els.video.requestPictureInPicture();
      } else {
        toast("Picture-in-picture is not available here.", "warn");
      }
    } catch {
      toast("Could not open picture-in-picture.", "warn");
    }
  }

  function toggleFullscreen() {
    const wrap = els.videoWrap;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (wrap.requestFullscreen) {
      wrap.requestFullscreen().catch(() => toast("Fullscreen was blocked by the browser.", "warn"));
    } else if (wrap.webkitRequestFullscreen) {
      wrap.webkitRequestFullscreen();
    }
  }

  async function copyStreamUrl() {
    if (!state.current) return;
    try {
      await navigator.clipboard.writeText(state.current.url);
      toast("Stream link copied", "ok");
    } catch {
      const input = document.createElement("textarea");
      input.value = state.current.url;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        toast("Stream link copied", "ok");
      } catch {
        toast("Could not copy the link.", "err");
      }
      input.remove();
    }
  }

  function normalizeUrl(value) {
    let raw = String(value || "").trim();
    if (!raw) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = "https://" + raw;
    try {
      const url = new URL(raw);
      if (!/^https?:$/.test(url.protocol)) return null;
      return url.href;
    } catch {
      return null;
    }
  }

  function nameFromUrl(value) {
    try {
      const url = new URL(value);
      const last = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
      const base = last
        .replace(/\.(m3u8?|txt)$/i, "")
        .replace(/[-_]+/g, " ")
        .trim();
      return base || url.hostname.replace(/^www\./, "");
    } catch {
      return "Playlist";
    }
  }

  function buildQuickPicks() {
    if (!els.quickPicks) return;
    DEMOS.forEach((demo) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = demo.label;
      chip.addEventListener("click", async () => {
        chip.disabled = true;
        await addPlaylistFromUrl(demo.url, demo.name);
        chip.disabled = false;
      });
      els.quickPicks.appendChild(chip);
    });
  }

  function onKeyDown(e) {
    const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
    const typing =
      tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable);

    if (e.key === "Escape") {
      if ($(".modal:not([hidden])")) {
        closeAllModals();
        return;
      }
      if (typing) e.target.blur();
      return;
    }

    if (typing) return;
    if ($(".modal:not([hidden])")) return;

    if (e.key === "/") {
      e.preventDefault();
      els.search.focus();
      els.search.select();
      return;
    }

    const key = e.key.toLowerCase();
    if (key === "f") {
      e.preventDefault();
      toggleFullscreen();
    } else if (key === "m") {
      e.preventDefault();
      toggleMute();
    } else if (key === "p") {
      e.preventDefault();
      togglePip();
    }
  }

  /* expose a couple of helpers for debugging in the console */
  global.GalibTV = {
    state,
    play: playChannel,
    add: addPlaylistFromUrl,
  };
})(window);
