/* =========================================================
   Galib TV — application
   Home + watch views, merged playlists, favourites, backups,
   PWA updates and version-based hard reload.
   ========================================================= */
(function (global) {
  "use strict";
  const G = global.GTV;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const CFG = global.GTV_CONFIG || {};
  const APP_VERSION = global.GTV_APP_VERSION || "0.0.0";
  const BUILD_DATE = global.GTV_BUILD_DATE || "";
  const VERSION_FILE = "assets/js/version.js";
  const PAGE_HOME = 60;
  const PAGE_RAIL = 60;

  const DEMOS = [
    { label: "Bangladesh", name: "Bangladesh TV", url: "https://iptv-org.github.io/iptv/countries/bd.m3u" },
    { label: "News", name: "News channels", url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
    { label: "Music", name: "Music channels", url: "https://iptv-org.github.io/iptv/categories/music.m3u" },
    { label: "Movies", name: "Movie channels", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
    { label: "Sports", name: "Sports channels", url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
    { label: "Kids", name: "Kids channels", url: "https://iptv-org.github.io/iptv/categories/kids.m3u" },
    { label: "All", name: "iptv-org — all channels", url: "https://iptv-org.github.io/iptv/index.m3u" },
  ];

  const ICONS = {
    tv: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 21h8M12 17.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8.4c0-.6.7-1 1.2-.7l3.9 2.5c.5.3.5 1 0 1.3l-3.9 2.5c-.5.3-1.2-.1-1.2-.7V8.4Z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5c0-.8.9-1.3 1.6-.9l8 6.5c.6.5.6 1.3 0 1.8l-8 6.5c-.7.4-1.6 0-1.6-.9v-13Z" fill="currentColor"/></svg>',
  };

  const els = {
    homeView: $("#home-view"),
    watchView: $("#watch-view"),
    backBtn: $("#btn-back"),
    brand: $("#brand"),
    search: $("#search"),
    statusPill: $("#status-pill"),
    statusText: $("#status-text"),
    installBtn: $("#btn-install"),
    addBtn: $("#btn-add"),
    themeBtn: $("#btn-theme"),
    settingsBtn: $("#btn-settings"),
    refreshAppBtn: $("#btn-refresh-app"),

    heroStats: $("#hero-stats"),
    resumeBtn: $("#btn-resume"),
    homeDemoBtn: $("#btn-home-demo"),
    favSection: $("#fav-section"),
    favCount: $("#fav-count"),
    favRow: $("#fav-row"),
    browseCount: $("#browse-count"),
    playlistFilter: $("#playlist-filter"),
    refreshAllBtn: $("#btn-refresh-all"),
    catBar: $("#cat-bar"),
    channelGrid: $("#channel-grid"),
    gridMore: $("#grid-more"),
    gridMoreBtn: $("#btn-grid-more"),

    video: $("#video"),
    videoWrap: $("#video-wrap"),
    idle: $("#player-idle"),
    idleHome: $("#btn-idle-home"),
    spinner: $("#player-spinner"),
    spinnerText: $(".spinner-text"),
    errorBox: $("#player-error"),
    errorTitle: $("#error-title"),
    errorText: $("#error-text"),
    errorRetry: $("#btn-error-retry"),
    errorProxy: $("#btn-error-proxy"),
    errorBackup: $("#btn-error-backup"),
    liveBadge: $("#live-badge"),
    qualityBadge: $("#quality-badge"),
    backupBadge: $("#backup-badge"),
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
    backupBtn: $("#btn-backup"),
    copyBtn: $("#btn-copy"),

    hintHome: $("#btn-hint-home"),
    hintNote: $("#hint-note"),

    railLabel: $("#rail-label"),
    railTabs: $$(".rail-tabs [data-tab]"),
    groupFilter: $("#group-filter"),
    playlistSelect: $("#playlist-select"),
    reloadPlaylist: $("#btn-reload-playlist"),
    list: $("#channel-list"),
    listMore: $("#list-more"),
    moreBtn: $("#btn-more"),
    chanCount: $("#chan-count"),
    activeName: $("#active-name"),

    modalAdd: $("#modal-add"),
    modeBtns: $$("#modal-add .seg [data-mode]"),
    panes: $$("#modal-add .pane"),
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

    modalSettings: $("#modal-settings"),
    setPlaylistProxy: $("#set-playlist-proxy"),
    setCustomProxy: $("#set-custom-proxy"),
    customProxyField: $("#custom-proxy-field"),
    setStreamProxy: $("#set-stream-proxy"),
    setAutoplay: $("#set-autoplay"),
    setLowlatency: $("#set-lowlatency"),
    setDark: $("#set-dark"),
    versionLabel: $("#version-label"),
    appVersion: $("#app-version"),
    checkUpdateBtn: $("#btn-check-update"),
    manageList: $("#playlist-manage"),
    resetBtn: $("#btn-reset"),

    modalBackup: $("#modal-backup"),
    backupChannel: $("#backup-channel"),
    formBackup: $("#form-backup"),
    inBackup: $("#in-backup"),
    backupSaveBtn: $("#btn-backup-save"),
    backupList: $("#backup-list"),

    toasts: $("#toasts"),
  };

  const state = {
    playlists: [],
    cache: new Map(),
    channels: [],
    byId: new Map(),
    favorites: [],
    recent: [],
    backups: {},
    settings: G.store.DEFAULT_SETTINGS,

    current: null,
    playingUrl: "",
    usingBackup: false,
    backupIndex: 0,
    fallbackBusy: false,
    playGen: 0,
    blockedToastShown: false,

    view: "home",
    query: "",
    group: "all",
    playlistFilter: "all",
    railTab: "all",
    catExpanded: false,

    homeList: [],
    homeShown: 0,
    railList: [],
    railShown: 0,

    loading: true,
    refreshing: false,
    lastRefreshAt: 0,
    lastUpdateCheck: 0,
    updateChecking: false,
    hardReloading: false,
    deferredInstall: null,
    swReg: null,
    pendingFile: null,
  };

  let player = null;
  let searchTimer = 0;

  /* ============================== init ============================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  async function init() {
    hydrate();
    migrateSaved();
    applyTheme(G.store.getTheme());
    setVersionLabel();
    player = new G.Player(els.video, { onState: onPlayerState, onQuality: onQuality });
    bindEvents();
    buildQuickPicks();
    setupPWA();

    rebuildMerged();
    renderAll();
    setStatus("Ready");

    await ensureDefaults();
    await loadCachedAll();
    state.loading = false;
    rebuildMerged();
    renderAll();

    const versionChanged =
      !!G.store.getSeenVersion() && G.store.getSeenVersion() !== APP_VERSION;

    if (!state.channels.length) {
      state.loading = true;
      renderHome();
      setStatus("Loading channels", "busy");
      await refreshAll({ force: true, initial: true, silent: true });
      state.loading = false;
    } else {
      refreshAll({ force: versionChanged, background: true, silent: true });
    }

    G.store.setSeenVersion(APP_VERSION);
    renderAll();
    openFromHash();
    startUpdateChecks();
  }

  function hydrate() {
    state.playlists = G.store.getPlaylists();
    state.favorites = G.store.getFavorites();
    state.recent = G.store.getRecent();
    state.backups = G.store.getBackups();
    state.settings = G.store.getSettings();
  }

  /* Keep favourites/recents stable: URL-based channel ids. */
  function migrateSaved() {
    const fix = (list) => {
      const seen = new Set();
      const out = [];
      list.forEach((c) => {
        if (!c || !c.url) return;
        const id = "c_" + G.m3u.hash(c.url);
        if (seen.has(id)) return;
        seen.add(id);
        out.push(Object.assign({}, c, { id }));
      });
      return out;
    };
    const favs = fix(state.favorites);
    const recent = fix(state.recent);
    if (favs.length !== state.favorites.length || favs.some((c, i) => c.id !== state.favorites[i].id)) {
      state.favorites = favs;
      G.store.saveFavorites(favs);
    }
    if (recent.length !== state.recent.length || recent.some((c, i) => c.id !== state.recent[i].id)) {
      state.recent = recent;
      G.store.saveRecent(recent);
    }
  }

  /* ============================== default playlists ============================== */

  async function ensureDefaults() {
    const defs = Array.isArray(CFG.defaultPlaylists)
      ? CFG.defaultPlaylists.filter((p) => p && p.url && p.enabled !== false)
      : [];
    if (!defs.length) return false;
    if (state.playlists.length && CFG.ensureDefaults !== true) return false;

    let changed = false;
    for (const item of defs) {
      const url = normalizeUrl(item.url);
      if (!url) continue;
      const name = (item.name || nameFromUrl(url)).trim() || "Playlist";
      const configId = item.id ? String(item.id) : "";

      let meta =
        (configId && state.playlists.find((p) => p.configId === configId)) ||
        state.playlists.find((p) => p.url === url) ||
        state.playlists.find((p) => p.source === "default" && p.name === name);

      if (!meta) {
        meta = {
          id: G.store.uid(),
          name,
          url,
          configId,
          count: 0,
          addedAt: Date.now(),
          updatedAt: 0,
          source: "default",
        };
        state.playlists.push(meta);
        changed = true;
      } else {
        if (configId && meta.configId !== configId) {
          meta.configId = configId;
          changed = true;
        }
        if (meta.url !== url) {
          meta.url = url;
          meta.updatedAt = 0;
          meta.count = 0;
          state.cache.delete(meta.id);
          G.store.deleteCachedChannels(meta.id);
          changed = true;
        }
        if (item.name && meta.name !== name) {
          meta.name = name;
          changed = true;
        }
        if (meta.source !== "default") {
          meta.source = "default";
          changed = true;
        }
      }
    }

    if (changed) {
      G.store.savePlaylists(state.playlists);
      renderPlaylistSelects();
    }
    return changed;
  }

  async function loadCachedAll() {
    await Promise.all(
      state.playlists.map(async (pl) => {
        if (state.cache.has(pl.id)) return;
        const cached = await G.store.getCachedChannels(pl.id);
        if (cached && Array.isArray(cached.channels)) {
          state.cache.set(pl.id, cached.channels);
          if (!pl.count) pl.count = cached.channels.length;
        }
      })
    );
    rebuildMerged();
  }

  function rebuildMerged() {
    const seen = new Set();
    const list = [];
    state.playlists.forEach((pl) => {
      const channels = state.cache.get(pl.id) || [];
      channels.forEach((raw) => {
        const url = raw && raw.url;
        if (!url || seen.has(url)) return;
        seen.add(url);
        list.push({
          id: "c_" + G.m3u.hash(url),
          name: raw.name || G.m3u.guessName(url),
          url,
          logo: raw.logo || "",
          group: raw.group || "General",
          tvgId: raw.tvgId || "",
          playlistId: pl.id,
          playlistName: pl.name,
        });
      });
    });
    state.channels = list;
    state.byId = new Map(list.map((c) => [c.id, c]));
  }

  /* ============================== refresh ============================== */

  function autoRefreshMs() {
    const minutes = Number(CFG.autoRefreshMinutes);
    return (Number.isFinite(minutes) && minutes > 0 ? minutes : 20) * 60000;
  }

  function shouldRefresh(pl) {
    if (!pl.url) return false;
    const cached = state.cache.get(pl.id);
    if (!cached || !cached.length) return true;
    return Date.now() - (pl.updatedAt || 0) > autoRefreshMs();
  }

  function proxyOptions(quiet) {
    return {
      mode: state.settings.playlistProxy,
      custom: state.settings.customProxy,
      onAttempt: (id) => {
        if (!quiet) {
          setStatus(id === "direct" ? "Fetching playlist…" : "Trying " + G.net.label(id) + "…", "busy");
        }
      },
    };
  }

  async function loadPlaylist(pl, opts = {}) {
    if (!pl || !pl.url) throw new Error("This playlist has no URL.");
    const res = await G.net.fetchPlaylist(pl.url, proxyOptions(opts.quiet));
    const channels = G.m3u.parse(res.text);
    if (!channels.length) throw new Error("This playlist has no channels.");

    state.cache.set(pl.id, channels);
    pl.count = channels.length;
    pl.updatedAt = Date.now();
    pl.lastVia = res.via;
    G.store.savePlaylists(state.playlists);
    await G.store.cacheChannels(pl.id, channels);
    return channels;
  }

  async function refreshAll(opts = {}) {
    const { force = false, background = false, silent = false, ids = null } = opts;
    if (state.refreshing) {
      if (!background) toast("A refresh is already running…", "warn");
      return false;
    }

    const targets = state.playlists.filter(
      (p) => p.url && (!ids || ids.includes(p.id)) && (force || shouldRefresh(p))
    );

    state.lastRefreshAt = Date.now();
    if (!targets.length) {
      if (!silent && !background) toast("Channel lists are already up to date.", "ok");
      return true;
    }

    state.refreshing = true;
    els.refreshAllBtn.classList.add("is-busy");
    els.reloadPlaylist.classList.add("is-busy");

    let ok = 0;
    let fail = 0;

    for (let i = 0; i < targets.length; i++) {
      const pl = targets[i];
      if (!background) setStatus("Refreshing " + (i + 1) + "/" + targets.length + "…", "busy");
      try {
        await loadPlaylist(pl, { quiet: background });
        ok++;
      } catch (err) {
        fail++;
        console.warn("[GalibTV] playlist refresh failed", pl.name, err);
        if (!background && !silent) toast(pl.name + ": " + friendlyError(err), "err", 8000);
      }
      if (!background) {
        rebuildMerged();
        renderAll();
      }
    }

    rebuildMerged();
    renderAll();
    state.refreshing = false;
    els.refreshAllBtn.classList.remove("is-busy");
    els.reloadPlaylist.classList.remove("is-busy");

    if (!background) {
      if (ok && !fail) {
        setStatus("Ready");
        if (!silent) {
          toast(
            "Updated " + ok + " playlist" + (ok === 1 ? "" : "s") + " · " +
              state.channels.length.toLocaleString() + " channels",
            "ok"
          );
        }
      } else if (fail && !ok) {
        setStatus("Refresh failed", "error");
        if (!silent) toast("Could not refresh the channel lists.", "err");
      } else {
        setStatus("Ready");
        if (!silent) toast("Updated " + ok + ", failed " + fail + ".", "warn");
      }
    } else if (ok) {
      setStatus("Ready");
    }

    return fail === 0;
  }

  /* ============================== events ============================== */

  function bindEvents() {
    els.addBtn.addEventListener("click", openAddModal);
    $$("[data-open-add]").forEach((b) => b.addEventListener("click", openAddModal));
    els.settingsBtn.addEventListener("click", openSettings);
    els.themeBtn.addEventListener("click", toggleTheme);
    els.refreshAppBtn.addEventListener("click", () => checkForUpdate(true));
    els.checkUpdateBtn.addEventListener("click", () => checkForUpdate(true));
    els.installBtn.addEventListener("click", installApp);
    els.brand.addEventListener("click", (e) => {
      e.preventDefault();
      showHome(true);
    });
    els.backBtn.addEventListener("click", () => showHome(true));
    els.hintHome.addEventListener("click", () => showHome(true));
    els.idleHome.addEventListener("click", () => showHome(true));
    els.resumeBtn.addEventListener("click", resumeLast);
    els.homeDemoBtn.addEventListener("click", loadDemo);

    els.search.addEventListener("input", onSearchInput);
    els.search.addEventListener("keydown", onSearchKey);

    els.refreshAllBtn.addEventListener("click", () => refreshAll({ force: true }));
    els.gridMoreBtn.addEventListener("click", appendHomePage);
    els.moreBtn.addEventListener("click", appendRailPage);

    els.catBar.addEventListener("click", onCatClick);
    els.channelGrid.addEventListener("click", onGridClick);
    els.favRow.addEventListener("click", onGridClick);
    els.list.addEventListener("click", onRailClick);
    els.list.addEventListener("keydown", onRailKey);

    els.railTabs.forEach((btn) => btn.addEventListener("click", () => setRailTab(btn.dataset.tab)));
    els.groupFilter.addEventListener("change", () => {
      state.group = els.groupFilter.value;
      renderCatBar();
      renderHomeGrid(true);
      renderRail(true);
      updateBrowseCount();
    });
    els.playlistFilter.addEventListener("change", () => setPlaylistFilter(els.playlistFilter.value));
    els.playlistSelect.addEventListener("change", () => setPlaylistFilter(els.playlistSelect.value));
    els.reloadPlaylist.addEventListener("click", refreshCurrentFilter);

    els.favBtn.addEventListener("click", () => {
      if (!state.current) return toast("Play or pick a channel first.", "warn");
      toggleFavoriteById(state.current.id);
    });
    els.retryBtn.addEventListener("click", () => retryPrimary(false));
    els.muteBtn.addEventListener("click", toggleMute);
    els.pipBtn.addEventListener("click", togglePip);
    els.fullBtn.addEventListener("click", toggleFullscreen);
    els.errorRetry.addEventListener("click", () => retryPrimary(false));
    els.errorProxy.addEventListener("click", () => retryCurrentWithProxy());
    els.errorBackup.addEventListener("click", openBackupModal);
    els.backupBtn.addEventListener("click", openBackupModal);
    els.copyBtn.addEventListener("click", copyStreamUrl);
    els.video.addEventListener("volumechange", () => {
      els.muteBtn.classList.toggle("is-active", els.video.muted || els.video.volume === 0);
    });

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    window.addEventListener("popstate", onPopState);

    $$(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });
    $$("[data-close]").forEach((b) =>
      b.addEventListener("click", () => closeModal(b.closest(".modal")))
    );

    els.modeBtns.forEach((btn) => btn.addEventListener("click", () => setAddMode(btn.dataset.mode)));
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
      if (file) setPendingFile(file);
    });

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
    els.setDark.addEventListener("change", () => {
      applyTheme(els.setDark.checked ? "dark" : "light");
    });
    els.resetBtn.addEventListener("click", resetEverything);

    els.formBackup.addEventListener("submit", (e) => {
      e.preventDefault();
      if (saveBackup(els.inBackup.value, true)) els.inBackup.value = "";
    });
    els.backupSaveBtn.addEventListener("click", () => {
      if (saveBackup(els.inBackup.value, false)) els.inBackup.value = "";
    });
    els.backupList.addEventListener("click", onBackupListClick);

    document.addEventListener("keydown", onKeyDown);
  }

  /* ============================== views ============================== */

  function showWatch(pushHistory, id) {
    const changed = state.view !== "watch";
    state.view = "watch";
    els.homeView.hidden = true;
    els.watchView.hidden = false;
    els.backBtn.hidden = false;
    document.body.classList.add("is-watch");
    if (pushHistory !== false && id) {
      history.pushState({ gtv: "watch", id }, "", "#ch=" + encodeURIComponent(id));
    }
    if (changed) window.scrollTo({ top: 0, behavior: "auto" });
  }

  function showHome(pushHistory) {
    const wasWatch = state.view === "watch";
    state.view = "home";
    els.watchView.hidden = true;
    els.homeView.hidden = false;
    els.backBtn.hidden = true;
    document.body.classList.remove("is-watch");

    if (wasWatch && els.video && !els.video.paused) {
      try {
        els.video.pause();
      } catch {}
    }

    if (pushHistory !== false && wasWatch) {
      history.pushState({ gtv: "home" }, "", location.pathname + location.search);
    }

    state.group = "all";
    state.catExpanded = false;
    renderHome();
    setStatus("Ready");
    document.title = "Galib TV — Web IPTV Player";
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function parseHashId() {
    if (!location.hash) return "";
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    return params.get("ch") || "";
  }

  function openFromHash() {
    const id = parseHashId();
    if (!id) return;
    const ch = findChannel(id);
    if (ch) {
      playChannel(ch, { history: false });
    } else {
      history.replaceState({ gtv: "home" }, "", location.pathname + location.search);
    }
  }

  function onPopState() {
    const id = parseHashId();
    if (id) {
      const ch = findChannel(id);
      if (ch) {
        playChannel(ch, { history: false });
        return;
      }
    }
    showHome(false);
  }

  function resumeLast() {
    if (state.current) {
      showWatch(true, state.current.id);
      const p = els.video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          setStatus("Press play");
          toast("Press play on the video to resume.", "warn");
        });
      }
      return;
    }
    const last = state.recent[0];
    const ch = last ? findChannel(last.id) || last : null;
    if (ch) playChannel(ch);
    else toast("Nothing to resume yet.", "warn");
  }

  /* ============================== playback ============================== */

  function playChannel(channel, opts = {}) {
    if (!channel || !channel.url) return;
    const canonical = state.byId.get(channel.id);
    const ch = canonical ? Object.assign({}, channel, canonical) : channel;

    state.current = ch;
    state.playingUrl = ch.url;
    state.usingBackup = false;
    state.backupIndex = 0;
    state.fallbackBusy = false;
    state.blockedToastShown = false;

    addRecent(ch);
    showWatch(opts.history !== false, ch.id);

    els.screenTitle.textContent = ch.name;
    state.railTab = "all";
    if (ch.group) state.group = ch.group;
    els.railTabs.forEach((b) => {
      const on = b.dataset.tab === "all";
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    syncGroupFilter();
    renderRail(true);
    updateCurrentUI();
    updateNowPlaying(ch);
    updateBackupButton();
    startCurrent(ch.url, { backup: false, proxyFirst: false });
  }

  function retryPrimary(proxyFirst) {
    if (!state.current) return toast("Choose a channel first.", "warn");
    state.backupIndex = 0;
    startCurrent(state.current.url, { backup: false, proxyFirst: !!proxyFirst });
  }

  function retryCurrentWithProxy() {
    if (!state.current) return;
    state.backupIndex = 0;
    startCurrent(state.playingUrl || state.current.url, {
      backup: state.usingBackup,
      proxyFirst: true,
    });
  }

  function startCurrent(url, opts = {}) {
    if (!state.current || !url) return;
    state.playingUrl = url;
    state.usingBackup = !!opts.backup;
    state.fallbackBusy = false;

    const channel = Object.assign({}, state.current, { url });
    const live = isLiveKind(url);

    els.errorBox.hidden = true;
    els.idle.hidden = true;
    els.spinner.hidden = false;
    els.spinnerText.textContent = state.usingBackup ? "Trying backup stream…" : "Connecting to stream…";
    els.liveBadge.hidden = !live;
    els.qualityBadge.hidden = true;
    els.backupBadge.hidden = !state.usingBackup;
    els.streamUrl.textContent = url;
    els.streamUrl.title = url;
    els.screenTitle.textContent = state.current.name;
    updateBackupButton();

    const wrap = streamWrapper();
    const mixedContent = location.protocol === "https:" && /^http:\/\//i.test(url);
    const useProxyFirst =
      !!opts.proxyFirst || (!!wrap && (mixedContent || state.settings.streamProxy === "always"));

    state.playGen++;
    player.play(channel, {
      wrap,
      useProxyFirst,
      autoplay: state.settings.autoplay,
      lowLatency: state.settings.lowLatency,
    });

    setStatus(state.usingBackup ? "Backup stream" : "Connecting", "busy");
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
        els.liveBadge.hidden = !isLiveKind(state.playingUrl);
        els.backupBadge.hidden = !state.usingBackup;
        els.screenTitle.hidden = !isFullscreen();
        if (state.current) document.title = state.current.name + " · Galib TV";
        setStatus(isLiveKind(state.playingUrl) ? "Live" : "Playing", "live");
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
        if (state.view === "watch") setStatus("Paused");
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
        if (maybeTryBackup()) return;
        showPlayerError(data);
        break;

      case "idle":
        els.spinner.hidden = true;
        els.errorBox.hidden = true;
        els.liveBadge.hidden = true;
        els.qualityBadge.hidden = true;
        els.backupBadge.hidden = true;
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

  function maybeTryBackup() {
    if (!state.current || state.fallbackBusy) return false;
    const list = state.backups[state.current.id] || [];
    if (!list.length || state.backupIndex >= list.length) return false;

    const next = list[state.backupIndex];
    state.backupIndex++;
    state.fallbackBusy = true;

    toast(
      "“" + state.current.name + "” failed — trying backup " + state.backupIndex + "/" + list.length + "…",
      "warn",
      4500
    );
    setStatus("Trying backup", "busy");

    setTimeout(() => {
      state.fallbackBusy = false;
      if (state.current) startCurrent(next, { backup: true });
    }, 280);
    return true;
  }

  function showPlayerError(data) {
    const tried = state.backupIndex;
    els.errorTitle.textContent = tried ? "Stream and backups failed" : data.title || "Stream failed to load";
    els.errorText.textContent = tried
      ? "Tried " + tried + " backup stream" + (tried === 1 ? "" : "s") + " without success. The channel may be offline or geo-blocked."
      : data.text || "The channel may be offline, geo-blocked, or missing CORS headers.";
    els.errorBox.hidden = false;
    els.spinner.hidden = true;
    setStatus("Stream error", "error");
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
      document.title = "Galib TV — Web IPTV Player";
      return;
    }
    els.nowTitle.textContent = channel.name;
    els.nowSub.textContent = [channel.group, channel.playlistName].filter(Boolean).join(" · ") || "Live TV";
    setLogo(els.nowLogo, channel);
    const fav = isFavorite(channel.id);
    els.favBtn.classList.toggle("is-active", fav);
    els.favBtn.title = fav ? "Remove from favourites" : "Add to favourites";
    els.streamMeta.hidden = false;
    els.streamUrl.textContent = state.playingUrl || channel.url;
    els.streamUrl.title = state.playingUrl || channel.url;
    updateBackupButton();
  }

  function setLogo(el, channel) {
    if (!el) return;
    el.textContent = "";
    const fallback = document.createElement("span");
    fallback.textContent = channel ? initials(channel.name) : "TV";
    el.appendChild(fallback);
    if (!channel || !channel.logo) return;
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => img.remove());
    img.src = channel.logo;
    el.appendChild(img);
  }

  function initials(name) {
    const clean = String(name || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
    if (!clean) return "TV";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function findChannel(id) {
    if (!id) return null;
    return (
      state.byId.get(id) ||
      state.favorites.find((c) => c.id === id) ||
      state.recent.find((c) => c.id === id) ||
      null
    );
  }

  function channelSnapshot(ch) {
    return {
      id: ch.id,
      name: ch.name,
      url: ch.url,
      logo: ch.logo || "",
      group: ch.group || "General",
      tvgId: ch.tvgId || "",
      playlistId: ch.playlistId || "",
      playlistName: ch.playlistName || "",
    };
  }

  function addRecent(channel) {
    const snap = channelSnapshot(channel);
    state.recent = [snap].concat(state.recent.filter((c) => c.id !== snap.id)).slice(0, 40);
    G.store.saveRecent(state.recent);
    if (state.railTab === "recent" && state.view === "watch") renderRail(true);
  }

  function isFavorite(id) {
    return state.favorites.some((c) => c.id === id);
  }

  function toggleFavoriteById(id) {
    const ch = findChannel(id);
    if (!ch) return;
    const idx = state.favorites.findIndex((c) => c.id === id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      toast("Removed from favourites");
    } else {
      state.favorites.unshift(channelSnapshot(ch));
      state.favorites = state.favorites.slice(0, 500);
      toast("Added to favourites", "ok");
    }
    G.store.saveFavorites(state.favorites);
    renderFavourites();
    updateFavUI();
    updateNowPlaying(state.current);
    if (state.railTab === "fav" && state.view === "watch") renderRail(true);
  }

  function updateFavUI() {
    const ids = new Set(state.favorites.map((c) => c.id));
    $$("[data-fav]").forEach((btn) => {
      const on = ids.has(btn.dataset.fav);
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.title = on ? "Remove from favourites" : "Add to favourites";
    });
    if (state.current) {
      const on = ids.has(state.current.id);
      els.favBtn.classList.toggle("is-active", on);
      els.favBtn.title = on ? "Remove from favourites" : "Add to favourites";
    }
  }

  function updateCurrentUI() {
    $$(".card[data-channel]").forEach((el) => {
      el.classList.toggle("is-current", !!state.current && el.dataset.channel === state.current.id);
    });
    $$(".ch[data-channel]").forEach((el) => {
      el.classList.toggle("is-active", !!state.current && el.dataset.channel === state.current.id);
    });
  }

  /* ============================== backups ============================== */

  function openBackupModal() {
    if (!state.current) {
      toast("Play a channel first, then add a backup link.", "warn");
      return;
    }
    els.backupChannel.textContent =
      state.current.name + (state.current.group ? " · " + state.current.group : "");
    els.inBackup.value = "";
    renderBackupList();
    openModal(els.modalBackup);
    setTimeout(() => els.inBackup.focus(), 40);
  }

  function saveBackup(rawUrl, playNow) {
    if (!state.current) {
      toast("Play a channel first.", "warn");
      return false;
    }
    const url = normalizeUrl(rawUrl);
    if (!url) {
      toast("Enter a valid http(s) stream link.", "warn");
      return false;
    }
    if (url === state.current.url) {
      toast("That is already the main stream link.", "warn");
      return false;
    }

    const id = state.current.id;
    const list = (state.backups[id] || []).slice();
    if (!list.includes(url)) list.push(url);
    state.backups[id] = list.slice(0, 8);
    G.store.saveBackups(state.backups);
    toast("Backup link saved", "ok");
    renderBackupList();
    updateBackupButton();

    if (playNow) {
      closeModal(els.modalBackup);
      state.backupIndex = Math.max(0, state.backups[id].indexOf(url) + 1);
      startCurrent(url, { backup: true });
    }
    return true;
  }

  function renderBackupList() {
    els.backupList.textContent = "";
    const list = state.current ? state.backups[state.current.id] || [] : [];
    if (!list.length) {
      const p = document.createElement("p");
      p.className = "hint";
      p.textContent = "No backup links saved for this channel yet.";
      els.backupList.appendChild(p);
      return;
    }
    list.forEach((url, index) => {
      const row = document.createElement("div");
      row.className = "backup-item";

      const code = document.createElement("code");
      code.className = "backup-url";
      code.textContent = url;
      code.title = url;

      const actions = document.createElement("div");
      actions.className = "backup-actions-row";

      const play = document.createElement("button");
      play.type = "button";
      play.className = "mini-btn";
      play.dataset.backupPlay = String(index);
      play.textContent = "Play";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "mini-btn danger";
      remove.dataset.backupRemove = String(index);
      remove.textContent = "Remove";

      actions.append(play, remove);
      row.append(code, actions);
      els.backupList.appendChild(row);
    });
  }

  function onBackupListClick(e) {
    if (!state.current) return;
    const list = state.backups[state.current.id] || [];

    const playBtn = e.target.closest("[data-backup-play]");
    if (playBtn) {
      const index = Number(playBtn.dataset.backupPlay);
      const url = list[index];
      if (!url) return;
      closeModal(els.modalBackup);
      state.backupIndex = index + 1;
      startCurrent(url, { backup: true });
      return;
    }

    const removeBtn = e.target.closest("[data-backup-remove]");
    if (removeBtn) {
      const index = Number(removeBtn.dataset.backupRemove);
      list.splice(index, 1);
      if (list.length) state.backups[state.current.id] = list;
      else delete state.backups[state.current.id];
      G.store.saveBackups(state.backups);
      renderBackupList();
      updateBackupButton();
      toast("Backup link removed");
    }
  }

  function updateBackupButton() {
    const n = state.current ? (state.backups[state.current.id] || []).length : 0;
    if (els.backupBtn) {
      els.backupBtn.textContent = n ? "Backups (" + n + ")" : "Backup";
      els.backupBtn.title = n ? n + " saved backup stream(s)" : "Add a backup stream";
    }
  }

  /* ============================== render: all ============================== */

  function renderAll() {
    renderPlaylistSelects();
    renderCatBar();
    syncGroupFilter();
    renderFavourites();
    renderHomeGrid(true);
    renderRail(true);
    updateHero();
    updateNowPlaying(state.current);
    updateFavUI();
    updateBackupButton();
  }

  function renderHome() {
    renderCatBar();
    syncGroupFilter();
    renderFavourites();
    renderHomeGrid(true);
    updateHero();
  }

  /* ============================== categories ============================== */

  function renderCatBar() {
    const base = state.channels.filter((c) => {
      if (state.playlistFilter !== "all" && c.playlistId !== state.playlistFilter) return false;
      if (!state.query) return true;
      const q = state.query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.group || "").toLowerCase().includes(q) ||
        (c.playlistName || "").toLowerCase().includes(q)
      );
    });

    const counts = new Map();
    base.forEach((c) => {
      const g = c.group || "General";
      counts.set(g, (counts.get(g) || 0) + 1);
    });

    if (state.group !== "all" && !counts.has(state.group)) state.group = "all";

    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const max = state.catExpanded ? entries.length : 18;
    const shown = entries.slice(0, max);

    els.catBar.textContent = "";
    if (!state.channels.length) {
      els.catBar.hidden = true;
      return;
    }
    els.catBar.hidden = false;

    els.catBar.appendChild(catChip("All", base.length, "all", state.group === "all"));

    shown.forEach(([group, count]) => {
      els.catBar.appendChild(catChip(group, count, group, state.group === group));
    });

    if (!state.catExpanded && entries.length > max) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "cat cat-more";
      more.dataset.group = "__more";
      more.textContent = "+" + (entries.length - max) + " more";
      els.catBar.appendChild(more);
    }
  }

  function catChip(label, count, value, active) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat" + (active ? " is-active" : "");
    btn.dataset.group = value;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", active ? "true" : "false");
    const text = document.createElement("span");
    text.textContent = label;
    const num = document.createElement("span");
    num.className = "cat-count";
    num.textContent = Number(count || 0).toLocaleString();
    btn.append(text, num);
    return btn;
  }

  function onCatClick(e) {
    const btn = e.target.closest("[data-group]");
    if (!btn) return;
    const group = btn.dataset.group;
    if (group === "__more") {
      state.catExpanded = true;
      renderCatBar();
      return;
    }
    state.group = group;
    renderCatBar();
    syncGroupFilter();
    renderHomeGrid(true);
    renderRail(true);
  }

  /* ============================== channel lists ============================== */

  function computeHomeList() {
    let list = state.channels;
    if (state.playlistFilter !== "all") {
      list = list.filter((c) => c.playlistId === state.playlistFilter);
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.group || "").toLowerCase().includes(q) ||
          (c.playlistName || "").toLowerCase().includes(q)
      );
    }
    if (state.group !== "all") list = list.filter((c) => (c.group || "General") === state.group);
    return list;
  }

  function renderHomeGrid(reset) {
    state.homeList = computeHomeList();
    if (reset) {
      els.channelGrid.textContent = "";
      state.homeShown = 0;
    }

    if (state.loading && !state.channels.length) {
      renderSkeletons();
      els.gridMore.hidden = true;
      updateBrowseCount();
      return;
    }

    if (!state.homeList.length) {
      renderHomeEmpty();
      els.gridMore.hidden = true;
      updateBrowseCount();
      return;
    }

    if (state.homeShown === 0) appendHomePage();
    els.gridMore.hidden = state.homeShown >= state.homeList.length;
    updateBrowseCount();
  }

  function appendHomePage() {
    if (!state.homeList.length) return;
    const end = Math.min(state.homeShown + PAGE_HOME, state.homeList.length);
    const frag = document.createDocumentFragment();
    for (let i = state.homeShown; i < end; i++) {
      frag.appendChild(buildCard(state.homeList[i]));
    }
    els.channelGrid.appendChild(frag);
    state.homeShown = end;
    els.gridMore.hidden = end >= state.homeList.length;
    updateBrowseCount();
  }

  function buildCard(ch) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.channel = ch.id;
    if (state.current && state.current.id === ch.id) card.classList.add("is-current");

    const main = document.createElement("button");
    main.type = "button";
    main.className = "card-main";
    main.dataset.play = ch.id;
    main.setAttribute("aria-label", "Play " + ch.name);

    const logo = document.createElement("span");
    logo.className = "card-logo";
    const initial = document.createElement("span");
    initial.className = "initial";
    initial.textContent = initials(ch.name);
    logo.appendChild(initial);
    if (ch.logo) {
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => img.remove());
      img.src = ch.logo;
      logo.appendChild(img);
    }

    const play = document.createElement("span");
    play.className = "card-play";
    play.innerHTML = ICONS.play;
    logo.appendChild(play);

    const info = document.createElement("span");
    info.className = "card-info";
    const name = document.createElement("span");
    name.className = "card-name";
    name.textContent = ch.name;
    const group = document.createElement("span");
    group.className = "card-group";
    group.textContent = ch.group || "General";
    info.append(name, group);

    main.append(logo, info);

    const star = document.createElement("button");
    star.type = "button";
    star.className = "card-star";
    star.dataset.fav = ch.id;
    star.setAttribute("aria-pressed", isFavorite(ch.id) ? "true" : "false");
    star.title = isFavorite(ch.id) ? "Remove from favourites" : "Add to favourites";
    star.innerHTML = ICONS.star;
    if (isFavorite(ch.id)) star.classList.add("is-active");

    card.append(main, star);
    return card;
  }

  function renderFavourites() {
    const items = state.favorites
      .map((fav) => state.byId.get(fav.id) || fav)
      .filter((c) => c && c.url);

    els.favSection.hidden = !items.length;
    els.favRow.textContent = "";
    els.favCount.textContent = items.length ? items.length + " saved" : "";

    items.forEach((ch) => els.favRow.appendChild(buildCard(ch)));
  }

  function computeRailList() {
    let list;
    if (state.railTab === "fav") list = state.favorites.map((f) => state.byId.get(f.id) || f);
    else if (state.railTab === "recent") list = state.recent.map((f) => state.byId.get(f.id) || f);
    else list = state.channels;

    list = list.filter((c) => c && c.url);

    if (state.playlistFilter !== "all") {
      list = list.filter((c) => c.playlistId === state.playlistFilter);
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.group || "").toLowerCase().includes(q) ||
          (c.playlistName || "").toLowerCase().includes(q)
      );
    }
    if (state.railTab === "all" && state.group !== "all") {
      list = list.filter((c) => (c.group || "General") === state.group);
    }
    return list;
  }

  function renderRail(reset) {
    state.railList = computeRailList();

    els.railTabs.forEach((b) => {
      const on = b.dataset.tab === state.railTab;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.groupFilter.disabled = state.railTab !== "all" || !state.channels.length;

    if (reset) {
      els.list.textContent = "";
      els.list.scrollTop = 0;
      state.railShown = 0;
    }

    if (state.loading && !state.channels.length) {
      renderRailEmpty(true);
      els.listMore.hidden = true;
    } else if (!state.railList.length) {
      renderRailEmpty(false);
      els.listMore.hidden = true;
    } else {
      if (state.railShown === 0) appendRailPage();
      els.listMore.hidden = state.railShown >= state.railList.length;
    }

    updateRailHead();
  }

  function appendRailPage() {
    if (!state.railList.length) return;
    const end = Math.min(state.railShown + PAGE_RAIL, state.railList.length);
    const frag = document.createDocumentFragment();
    for (let i = state.railShown; i < end; i++) {
      frag.appendChild(buildRailRow(state.railList[i]));
    }
    els.list.appendChild(frag);
    state.railShown = end;
    els.listMore.hidden = end >= state.railList.length;
  }

  function buildRailRow(ch) {
    const row = document.createElement("div");
    row.className = "ch";
    row.dataset.channel = ch.id;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", "Play " + ch.name);
    if (state.current && state.current.id === ch.id) row.classList.add("is-active");

    const logo = document.createElement("span");
    logo.className = "ch-logo";
    const initial = document.createElement("span");
    initial.textContent = initials(ch.name);
    logo.appendChild(initial);
    if (ch.logo) {
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => img.remove());
      img.src = ch.logo;
      logo.appendChild(img);
    }

    const text = document.createElement("span");
    text.className = "ch-text";
    const name = document.createElement("span");
    name.className = "ch-name";
    name.textContent = ch.name;
    const group = document.createElement("span");
    group.className = "ch-group";
    group.textContent = ch.group || "General";
    text.append(name, group);

    const now = document.createElement("span");
    now.className = "ch-now";
    now.textContent = "NOW";

    const star = document.createElement("button");
    star.type = "button";
    star.className = "ch-star";
    star.dataset.fav = ch.id;
    star.title = isFavorite(ch.id) ? "Remove from favourites" : "Add to favourites";
    star.innerHTML = ICONS.star;
    if (isFavorite(ch.id)) star.classList.add("is-active");

    row.append(logo, text, now, star);
    return row;
  }

  function updateRailHead() {
    let label = "More channels";
    let context = "All channels";

    if (state.railTab === "fav") {
      label = "Your favourites";
      context = "Favourites";
    } else if (state.railTab === "recent") {
      label = "Recently watched";
      context = "Recent";
    } else if (state.group !== "all") {
      label = "More in " + state.group;
      context = state.group;
    } else if (state.playlistFilter !== "all") {
      const pl = state.playlists.find((p) => p.id === state.playlistFilter);
      if (pl) {
        label = "From " + pl.name;
        context = pl.name;
      }
    }

    els.railLabel.textContent = label;
    const count = state.railList.length;
    els.chanCount.textContent = count.toLocaleString() + (count === 1 ? " channel" : " channels");
    els.activeName.textContent = context;
  }

  function renderRailEmpty(loading) {
    els.list.textContent = "";

    let block;
    if (loading) {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "Loading channels…",
        text: "Fetching your playlists. Large lists can take a few seconds.",
      });
    } else if (state.railTab === "fav") {
      block = emptyBlock({
        icon: ICONS.star,
        title: "No favourites yet",
        text: "Tap the star on any channel to pin it here and at the top of the home page.",
      });
    } else if (state.railTab === "recent") {
      block = emptyBlock({
        icon: ICONS.clock,
        title: "Nothing watched yet",
        text: "Channels you play will show up here for quick access.",
      });
    } else if (state.query) {
      block = emptyBlock({
        icon: ICONS.search,
        title: "No matches",
        text: "Nothing found for “" + state.query + "”. Try another name or category.",
        actions: [{ label: "Clear search", action: "clear-search" }],
      });
    } else if (state.group !== "all") {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "No channels in this category",
        text: "Try another category or show all channels.",
        actions: [{ label: "Show all channels", action: "clear-group" }],
      });
    } else if (!state.playlists.length) {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "Add your first playlist",
        text: "Paste an M3U / M3U8 URL, upload a file, or load the demo.",
        actions: [
          { label: "Add playlist", action: "add", primary: true },
          { label: "Load demo", action: "demo" },
        ],
      });
    } else {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "No channels yet",
        text: "Your playlists are empty or still loading. Try refreshing them.",
        actions: [
          { label: "Refresh channels", action: "refresh", primary: true },
          { label: "Add playlist", action: "add" },
        ],
      });
    }

    els.list.appendChild(block);
    els.chanCount.textContent = "0 channels";
    els.activeName.textContent = "No channels";
  }

  function renderHomeEmpty() {
    els.channelGrid.textContent = "";
    let block;

    if (state.query) {
      block = emptyBlock({
        icon: ICONS.search,
        title: "No channels match",
        text: "Nothing found for “" + state.query + "”. Try a different name or category.",
        actions: [{ label: "Clear search", action: "clear-search" }],
      });
    } else if (state.group !== "all") {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "This category is empty",
        text: "No channels in “" + state.group + "” right now.",
        actions: [{ label: "Show all channels", action: "clear-group" }],
      });
    } else if (!state.playlists.length) {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "Add your first playlist",
        text: "Paste an M3U / M3U8 URL, upload a file, or start with the demo channels.",
        actions: [
          { label: "Add playlist", action: "add", primary: true },
          { label: "Load demo", action: "demo" },
        ],
      });
    } else {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "No channels loaded",
        text: "The playlist may be empty or temporarily unreachable. Try refreshing.",
        actions: [
          { label: "Refresh channels", action: "refresh", primary: true },
          { label: "Add playlist", action: "add" },
        ],
      });
    }

    els.channelGrid.appendChild(block);
  }

  function renderSkeletons() {
    els.channelGrid.textContent = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 12; i++) {
      const card = document.createElement("div");
      card.className = "card skeleton";
      const logo = document.createElement("div");
      logo.className = "sk-logo";
      const line = document.createElement("div");
      line.className = "sk-line";
      const short = document.createElement("div");
      short.className = "sk-line short";
      card.append(logo, line, short);
      frag.appendChild(card);
    }
    els.channelGrid.appendChild(frag);
  }

  function emptyBlock({ icon, title, text, actions }) {
    const box = document.createElement("div");
    box.className = "empty";

    const art = document.createElement("div");
    art.className = "empty-art";
    art.innerHTML = icon || ICONS.tv;

    const h = document.createElement("h3");
    h.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;

    box.append(art, h, p);

    if (actions && actions.length) {
      const wrap = document.createElement("div");
      wrap.className = "empty-actions";
      actions.forEach((a) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = a.primary ? "btn btn-primary" : "btn btn-ghost";
        if (a.action) btn.dataset.action = a.action;
        btn.textContent = a.label;
        wrap.appendChild(btn);
      });
      box.appendChild(wrap);
    }

    return box;
  }

  /* ============================== selects / filters ============================== */

  function setPlaylistFilter(value) {
    state.playlistFilter = value || "all";
    if (!state.playlists.some((p) => p.id === state.playlistFilter)) state.playlistFilter = "all";
    state.group = "all";
    state.catExpanded = false;
    renderPlaylistSelects();
    renderCatBar();
    syncGroupFilter();
    renderHomeGrid(true);
    renderRail(true);
    updateHero();
  }

  function renderPlaylistSelects() {
    const total = state.channels.length;
    const build = (select) => {
      if (!select) return;
      select.textContent = "";
      const all = document.createElement("option");
      all.value = "all";
      all.textContent = "All playlists (" + total.toLocaleString() + ")";
      select.appendChild(all);
      state.playlists.forEach((pl) => {
        const opt = document.createElement("option");
        opt.value = pl.id;
        opt.textContent = pl.name + " (" + (pl.count || 0).toLocaleString() + ")";
        select.appendChild(opt);
      });
      if (!state.playlists.some((p) => p.id === state.playlistFilter)) state.playlistFilter = "all";
      select.value = state.playlistFilter;
      select.disabled = !state.playlists.length;
    };
    build(els.playlistFilter);
    build(els.playlistSelect);
  }

  function syncGroupFilter() {
    const base = state.channels.filter(
      (c) => state.playlistFilter === "all" || c.playlistId === state.playlistFilter
    );
    const counts = new Map();
    base.forEach((c) => {
      const g = c.group || "General";
      counts.set(g, (counts.get(g) || 0) + 1);
    });

    if (state.group !== "all" && !counts.has(state.group)) state.group = "all";

    els.groupFilter.textContent = "";
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = "All groups (" + base.length.toLocaleString() + ")";
    els.groupFilter.appendChild(all);

    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .forEach(([group, count]) => {
        const opt = document.createElement("option");
        opt.value = group;
        opt.textContent = group + " (" + count + ")";
        els.groupFilter.appendChild(opt);
      });

    els.groupFilter.value = state.group;
    els.groupFilter.disabled = state.railTab !== "all" || !base.length;
  }

  function setRailTab(tab) {
    state.railTab = tab;
    els.groupFilter.disabled = tab !== "all" || !state.channels.length;
    renderRail(true);
  }

  function updateHero() {
    const groups = new Set(state.channels.map((c) => c.group || "General"));
    const playlists = state.playlists.length;

    if (state.loading && !state.channels.length) {
      els.heroStats.textContent = "Loading your channel library…";
    } else if (!state.channels.length) {
      els.heroStats.textContent = playlists
        ? playlists + " playlist" + (playlists === 1 ? "" : "s") + " connected — waiting for channels."
        : "No playlists yet — add one or load the demo.";
    } else {
      els.heroStats.textContent =
        state.channels.length.toLocaleString() +
        " live channels · " +
        groups.size +
        " categories · " +
        playlists +
        " playlist" +
        (playlists === 1 ? "" : "s");
    }

    updateResume();
  }

  function updateResume() {
    const target = state.current || state.recent[0];
    if (!target) {
      els.resumeBtn.hidden = true;
      return;
    }
    els.resumeBtn.hidden = false;
    els.resumeBtn.textContent = "▶ Resume " + target.name;
  }

  function updateBrowseCount() {
    const total = state.channels.length;
    const shown = state.homeList.length;
    if (!total) {
      els.browseCount.textContent = "";
      return;
    }
    els.browseCount.textContent =
      shown === total
        ? total.toLocaleString() + " channels"
        : shown.toLocaleString() + " of " + total.toLocaleString();
  }

  /* ============================== search ============================== */

  function onSearchInput() {
    state.query = els.search.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (state.view === "home") {
        renderCatBar();
        renderHomeGrid(true);
        updateHero();
      } else {
        renderRail(true);
      }
    }, 120);
  }

  function onSearchKey(e) {
    if (e.key === "Enter") {
      const first = state.view === "home" ? computeHomeList()[0] : computeRailList()[0];
      if (first) playChannel(first);
    } else if (e.key === "Escape") {
      clearSearch();
      els.search.blur();
    }
  }

  function clearSearch() {
    state.query = "";
    els.search.value = "";
    if (state.view === "home") {
      renderCatBar();
      renderHomeGrid(true);
      updateHero();
    } else {
      renderRail(true);
    }
  }

  /* ============================== delegated clicks ============================== */

  function onGridClick(e) {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavoriteById(fav.dataset.fav);
      return;
    }
    const play = e.target.closest("[data-play]");
    if (play) {
      const ch = findChannel(play.dataset.play);
      if (ch) playChannel(ch);
      return;
    }
    const action = e.target.closest("[data-action]");
    if (action) {
      handleAction(action.dataset.action);
      return;
    }
    const demo = e.target.closest("[data-demo]");
    if (demo) loadDemo();
  }

  function onRailClick(e) {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavoriteById(fav.dataset.fav);
      return;
    }
    const action = e.target.closest("[data-action]");
    if (action) {
      handleAction(action.dataset.action);
      return;
    }
    const row = e.target.closest(".ch[data-channel]");
    if (row) {
      const ch = findChannel(row.dataset.channel);
      if (ch) playChannel(ch);
    }
  }

  function onRailKey(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest(".ch[data-channel]");
    if (!row || e.target.closest("[data-fav]")) return;
    e.preventDefault();
    const ch = findChannel(row.dataset.channel);
    if (ch) playChannel(ch);
  }

  function handleAction(action) {
    switch (action) {
      case "add":
        openAddModal();
        break;
      case "demo":
        loadDemo();
        break;
      case "refresh":
        refreshAll({ force: true });
        break;
      case "clear-search":
        clearSearch();
        break;
      case "clear-group":
        state.group = "all";
        renderCatBar();
        syncGroupFilter();
        renderHomeGrid(true);
        renderRail(true);
        break;
      case "clear-playlist":
        setPlaylistFilter("all");
        break;
    }
  }

  async function refreshCurrentFilter() {
    if (state.playlistFilter !== "all") {
      const pl = state.playlists.find((p) => p.id === state.playlistFilter);
      if (pl) return refreshPlaylist(pl);
    }
    return refreshAll({ force: true });
  }

  /* ============================== fullscreen ============================== */

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function onFullscreenChange() {
    const full = isFullscreen();
    els.screenTitle.hidden = !(full && state.current);
    if (full && state.current) els.screenTitle.textContent = state.current.name;
  }

  /* ============================== add playlists ============================== */

  function openAddModal() {
    setAddMode("url");
    openModal(els.modalAdd);
  }

  function setAddMode(mode) {
    els.modeBtns.forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.panes.forEach((p) => (p.hidden = p.dataset.pane !== mode));
    if (mode === "url") setTimeout(() => els.inUrl.focus(), 40);
  }

  async function addPlaylistFromUrl(rawUrl, name) {
    const url = normalizeUrl(rawUrl);
    if (!url) {
      toast("That doesn’t look like a valid URL.", "err");
      return false;
    }

    const existing = state.playlists.find((p) => p.url === url);
    if (existing) {
      if (name && existing.name !== name) {
        existing.name = name;
        G.store.savePlaylists(state.playlists);
      }
      toast("That playlist is already added — refreshing it.", "warn");
      closeModal(els.modalAdd);
      await refreshPlaylist(existing);
      return true;
    }

    setStatus("Loading playlist", "busy");
    try {
      const res = await G.net.fetchPlaylist(url, proxyOptions(false));
      const channels = G.m3u.parse(res.text);
      if (!channels.length) throw new Error("No channels were found in this playlist.");
      state.lastVia = res.via;
      const meta = await addPlaylistFromChannels(channels, name || nameFromUrl(url), "url", url);
      closeModal(els.modalAdd);
      toast("Added " + meta.name + " · " + channels.length.toLocaleString() + " channels", "ok");
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
    state.cache.set(meta.id, channels);
    G.store.savePlaylists(state.playlists);
    await G.store.cacheChannels(meta.id, channels);
    state.group = "all";
    rebuildMerged();
    renderAll();
    return meta;
  }

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
    els.fileName.textContent = file
      ? file.name + " · " + Math.max(1, Math.round(file.size / 1024)) + " KB"
      : "";
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
      const meta = await addPlaylistFromChannels(channels, name, "file");
      closeModal(els.modalAdd);
      toast("Added " + meta.name + " · " + channels.length.toLocaleString() + " channels", "ok");
      setPendingFile(null);
      els.inFile.value = "";
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
      const meta = await addPlaylistFromChannels(
        channels,
        els.inTextName.value.trim() || "Pasted playlist",
        "text"
      );
      els.inText.value = "";
      els.inTextName.value = "";
      closeModal(els.modalAdd);
      toast("Added " + meta.name + " · " + channels.length.toLocaleString() + " channels", "ok");
    } catch (err) {
      toast(friendlyError(err), "err", 7000);
    } finally {
      setBtnBusy(btn, false);
    }
  }

  async function loadDemo() {
    closeModal(els.modalAdd);
    const existing = state.playlists.find((p) => p.source === "demo");
    if (existing) {
      setPlaylistFilter(existing.id);
      if (state.view === "watch") showHome(true);
      toast("Demo playlist is already added.", "ok");
      return;
    }

    setStatus("Loading demo", "busy");
    try {
      const url = new URL("sample/demo.m3u", location.href).href;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Demo playlist could not be fetched (HTTP " + res.status + ")");
      const channels = G.m3u.parse(await res.text());
      if (!channels.length) throw new Error("Demo playlist is empty.");
      const meta = await addPlaylistFromChannels(channels, "Demo channels", "demo", url);
      setPlaylistFilter(meta.id);
      if (state.view === "watch") showHome(true);
      setStatus("Ready");
      toast("Demo channels loaded", "ok");
    } catch (err) {
      setStatus("Demo unavailable", "error");
      toast(friendlyError(err) + " — try adding a playlist URL instead.", "err", 7000);
    }
  }

  /* ============================== playlist management ============================== */

  async function refreshPlaylist(pl) {
    if (!pl || !pl.url) {
      toast("File and pasted playlists can’t be refreshed — remove and re-add them.", "warn");
      return false;
    }
    setStatus("Refreshing " + pl.name, "busy");
    try {
      await loadPlaylist(pl, { quiet: false });
      rebuildMerged();
      renderAll();
      renderManage();
      setStatus("Ready");
      toast("Updated " + pl.name + " · " + (pl.count || 0).toLocaleString() + " channels", "ok");
      return true;
    } catch (err) {
      setStatus("Ready");
      toast(pl.name + ": " + friendlyError(err), "err", 8000);
      return false;
    }
  }

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
        (pl.count || 0).toLocaleString() +
        " channels · " +
        (pl.url ? (pl.source === "default" ? "default" : "URL") : "local");
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "manage-actions";

      if (pl.url) {
        const refresh = document.createElement("button");
        refresh.type = "button";
        refresh.className = "mini-btn";
        refresh.textContent = "Refresh";
        refresh.addEventListener("click", () => refreshPlaylist(pl));
        actions.appendChild(refresh);
      }

      const del = document.createElement("button");
      del.type = "button";
      del.className = "mini-btn danger";
      del.textContent = "Remove";
      del.addEventListener("click", () => deletePlaylist(pl));
      actions.appendChild(del);

      row.append(info, actions);
      els.manageList.appendChild(row);
    });
  }

  async function deletePlaylist(pl) {
    if (!pl) return;
    if (!confirm('Remove "' + pl.name + '" from this browser?')) return;

    state.playlists = state.playlists.filter((p) => p.id !== pl.id);
    state.cache.delete(pl.id);
    G.store.savePlaylists(state.playlists);
    await G.store.deleteCachedChannels(pl.id);

    if (state.playlistFilter === pl.id) state.playlistFilter = "all";
    if (state.current && state.current.playlistId === pl.id) {
      state.current = null;
      state.playingUrl = "";
      state.usingBackup = false;
      player.stop();
      updateNowPlaying(null);
      showHome(false);
    }

    rebuildMerged();
    renderAll();
    renderManage();
    toast(
      pl.source === "default" && CFG.ensureDefaults === true
        ? "Playlist removed. Default playlists return on the next visit."
        : "Playlist removed"
    );
  }

  /* ============================== settings / theme ============================== */

  function openSettings() {
    els.setPlaylistProxy.value = state.settings.playlistProxy;
    els.setCustomProxy.value = state.settings.customProxy || "";
    els.customProxyField.hidden = state.settings.playlistProxy !== "custom";
    els.setStreamProxy.value = state.settings.streamProxy;
    els.setAutoplay.checked = !!state.settings.autoplay;
    els.setLowlatency.checked = !!state.settings.lowLatency;
    els.setDark.checked = document.documentElement.dataset.theme !== "light";
    renderManage();
    openModal(els.modalSettings);
  }

  function saveSettings() {
    G.store.saveSettings(state.settings);
  }

  async function resetEverything() {
    if (!confirm("Reset all local data? This removes playlists, favourites, backups, recents and settings.")) return;
    G.store.reset();
    await G.store.clearChannelCache();
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
    location.reload();
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === "light" ? "#f3f7fb" : "#080b10";
    G.store.setTheme(t);
    if (els.setDark) els.setDark.checked = t === "dark";
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
    const video = els.video;
    if (isFullscreen()) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (ios && video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }
    if (wrap.requestFullscreen) {
      wrap.requestFullscreen().catch(() => toast("Fullscreen was blocked by the browser.", "warn"));
    } else if (wrap.webkitRequestFullscreen) {
      wrap.webkitRequestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else {
      toast("Fullscreen is not available here.", "warn");
    }
  }

  async function copyStreamUrl() {
    if (!state.current) return;
    const url = state.playingUrl || state.current.url;
    try {
      await navigator.clipboard.writeText(url);
      toast("Stream link copied", "ok");
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
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

  /* ============================== ui helpers ============================== */

  function setStatus(text, kind) {
    if (!els.statusText || !els.statusPill) return;
    els.statusText.textContent = text;
    els.statusPill.className = "status-pill" + (kind ? " is-" + kind : "");
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

  function toast(message, kind, ms) {
    if (!els.toasts) return;
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

  function friendlyError(err) {
    const msg = (err && err.message) || String(err || "Unknown error");
    if (/failed to fetch|networkerror|load failed|network error/i.test(msg)) {
      return "Could not reach that URL. Check the link, or choose a proxy in Settings and try again.";
    }
    if (/abort|timeout/i.test(msg)) {
      return "The request timed out. The server may be slow — try again or use a proxy.";
    }
    return msg;
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
    els.quickPicks.textContent = "";
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

  /* ============================== PWA + updates ============================== */

  function setupPWA() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredInstall = e;
      els.installBtn.hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      state.deferredInstall = null;
      els.installBtn.hidden = true;
      toast("Galib TV installed on your device", "ok");
    });

    const ua = navigator.userAgent || "";
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios && !navigator.standalone) {
      els.installBtn.hidden = false;
      els.installBtn.dataset.ios = "1";
    }

    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;

    const start = () => {
      navigator.serviceWorker
        .register("sw.js", { scope: "./", updateViaCache: "none" })
        .then((reg) => {
          state.swReg = reg;
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                worker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });
          setTimeout(() => reg.update().catch(() => {}), 5000);
        })
        .catch((err) => console.warn("[GalibTV] service worker registration failed", err));
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  }

  async function installApp() {
    const ios = els.installBtn.dataset.ios === "1" || /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (ios) {
      toast("iPhone/iPad: tap Share → Add to Home Screen.", "ok", 7000);
      return;
    }
    if (!state.deferredInstall) {
      toast("Open your browser menu → Install app / Add to Home screen.", "ok", 6000);
      return;
    }
    state.deferredInstall.prompt();
    try {
      await state.deferredInstall.userChoice;
    } catch {}
    state.deferredInstall = null;
    els.installBtn.hidden = true;
  }

  function setVersionLabel() {
    if (els.versionLabel) {
      els.versionLabel.textContent = "v" + APP_VERSION + (BUILD_DATE ? " · " + BUILD_DATE : "");
    }
    if (els.appVersion) els.appVersion.textContent = "Galib TV v" + APP_VERSION;
  }

  function startUpdateChecks() {
    if (!/^https?:$/.test(location.protocol)) return;
    setTimeout(() => checkForUpdate(false), 6000);
    setInterval(() => {
      if (!document.hidden) checkForUpdate(false);
    }, 180000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - state.lastUpdateCheck > 120000) checkForUpdate(false);
      if (now - state.lastRefreshAt > autoRefreshMs()) {
        refreshAll({ background: true, silent: true });
      }
    });
  }

  async function fetchRemoteVersion() {
    const url = new URL(VERSION_FILE, location.href);
    url.searchParams.set("t", String(Date.now()));
    const res = await fetch(url.href, { cache: "no-store", credentials: "omit" });
    if (!res.ok) throw new Error("Version check failed with HTTP " + res.status);
    const text = await res.text();
    const match = /GTV_APP_VERSION\s*=\s*["']([^"']+)["']/.exec(text);
    return match ? match[1].trim() : null;
  }

  async function checkForUpdate(manual) {
    if (state.updateChecking) return false;
    state.updateChecking = true;
    if (manual) els.refreshAppBtn.classList.add("is-busy");

    try {
      if (state.swReg && state.swReg.update) state.swReg.update().catch(() => {});
      const remote = await fetchRemoteVersion();
      state.lastUpdateCheck = Date.now();

      if (remote && remote !== APP_VERSION) {
        await hardReload(remote);
        return true;
      }

      if (manual) {
        const ok = await refreshAll({ force: true, silent: true });
        toast(
          ok
            ? "You’re on the latest version · channel lists refreshed."
            : "You’re on the latest version, but the channel refresh failed.",
          ok ? "ok" : "warn",
          5000
        );
      }
      return false;
    } catch (err) {
      console.warn("[GalibTV] update check failed", err);
      if (manual) toast("Could not check for updates. Check your connection.", "warn");
      return false;
    } finally {
      state.updateChecking = false;
      els.refreshAppBtn.classList.remove("is-busy");
    }
  }

  async function hardReload(remoteVersion) {
    if (state.hardReloading) return;
    state.hardReloading = true;

    const guardKey = "gtv.reload." + remoteVersion;
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(guardKey) || 0);
    } catch {}
    if (last && Date.now() - last < 30000) {
      state.hardReloading = false;
      toast("Update found but this page is still cached. Close and reopen the app.", "warn", 9000);
      return;
    }
    try {
      sessionStorage.setItem(guardKey, String(Date.now()));
    } catch {}

    setStatus("Updating…", "busy");
    toast("New version " + remoteVersion + " found — reloading…", "ok", 3000);

    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {}
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 450));

    const url = new URL(location.href);
    url.searchParams.set("v", remoteVersion);
    url.searchParams.set("t", String(Date.now()));
    location.replace(url.href);
  }

  /* ============================== keyboard ============================== */

  function onKeyDown(e) {
    const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
    const typing =
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      (e.target && e.target.isContentEditable);

    if (e.key === "Escape") {
      if ($(".modal:not([hidden])")) {
        closeAllModals();
        return;
      }
      if (isFullscreen()) return;
      if (state.query) {
        clearSearch();
        return;
      }
      if (typing) {
        e.target.blur();
        return;
      }
      if (state.view === "watch") {
        showHome(true);
      }
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

  /* ============================== expose ============================== */

  global.GalibTV = {
    state,
    version: APP_VERSION,
    play: playChannel,
    add: addPlaylistFromUrl,
    refresh: () => refreshAll({ force: true }),
    checkUpdate: () => checkForUpdate(true),
    openBackup: openBackupModal,
  };
})(window);
