/* =========================================================
   Galib TV — OTT Application Engine (v3.0)
   Admin-first lineup sync, multi-backup auto-fallback,
   OTT server switcher, favourites/recent rails, Show All,
   mobile bottom nav, and version-based PWA hard reload.
   ========================================================= */
(function (global) {
  "use strict";
  const G = global.GTV;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const CFG = global.GTV_CONFIG || {};
  const APP_VERSION = global.GTV_APP_VERSION || "3.0.0";
  const BUILD_DATE = global.GTV_BUILD_DATE || "";
  const VERSION_FILE = "assets/js/version.js";
  const PAGE_HOME = 60;
  const PAGE_RAIL = 60;

  const ICONS = {
    tv: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 21h8M12 17.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8.4c0-.6.7-1 1.2-.7l3.9 2.5c.5.3.5 1 0 1.3l-3.9 2.5c-.5.3-1.2-.1-1.2-.7V8.4Z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
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
    bottomNavBtns: $$("[data-bnav]"),

    heroTitle: $("#hero-title"),
    heroSub: $("#hero-sub"),
    heroStats: $("#hero-stats"),
    resumeBtn: $("#btn-resume"),
    favSection: $("#fav-section"),
    favCount: $("#fav-count"),
    favRow: $("#fav-row"),
    featuredSection: $("#featured-section"),
    featuredCount: $("#featured-count"),
    featuredRow: $("#featured-row"),
    recentSection: $("#recent-section"),
    recentCount: $("#recent-count"),
    recentRow: $("#recent-row"),
    browseTitleText: $("#browse-title-text"),
    browseCount: $("#browse-count"),
    allCatsBtn: $("#btn-all-cats"),
    playlistFilterWrap: $("#playlist-filter-wrap"),
    playlistFilter: $("#playlist-filter"),
    refreshAllBtn: $("#btn-refresh-all"),
    catBar: $("#cat-bar"),
    catShelves: $("#cat-shelves"),
    channelGrid: $("#channel-grid"),
    gridMore: $("#grid-more"),
    gridMoreBtn: $("#btn-grid-more"),
    gridAllBtn: $("#btn-grid-all"),
    footerVersion: $("#footer-version"),

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
    rotateBtn: $("#btn-rotate"),
    rotateExitBtn: $("#btn-rotate-exit"),
    fullBtn: $("#btn-full"),
    retryBtn: $("#btn-retry"),
    sourceBar: $("#source-bar"),
    sourcePills: $("#source-pills"),
    backupBtn: $("#btn-backup"),
    copyBtn: $("#btn-copy"),
    hintHome: $("#btn-hint-home"),

    railLabel: $("#rail-label"),
    railTabs: $$(".rail-tabs [data-tab]"),
    groupFilter: $("#group-filter"),
    railPlaylistWrap: $("#rail-playlist-wrap"),
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
    featured: [],
    favorites: [],
    recent: [],
    backups: {},
    settings: G.store.DEFAULT_SETTINGS,

    current: null,
    servers: [],
    serverIndex: 0,
    failedServers: new Set(),
    playingUrl: "",
    usingBackup: false,
    fallbackBusy: false,
    lastVia: "",
    blockedToastShown: false,
    rotated: false,
    orientationLocked: false,

    view: "home",
    query: "",
    group: "all",
    playlistFilter: "all",
    railTab: "all",
    catExpanded: false,

    homeList: [],
    homeShown: 0,
    homeRenderToken: 0,
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
    applyBrandConfig();
    setVersionLabel();
    player = new G.Player(els.video, { onState: onPlayerState });
    bindEvents();
    setupPWA();

    if (CFG.allowUserPlaylists === false && els.addBtn) {
      els.addBtn.hidden = true;
    }

    rebuildMerged();
    renderAll();
    setStatus("Ready");

    const defaultsChanged = await ensureDefaults();
    await loadCachedAll();
    state.loading = false;
    rebuildMerged();
    renderAll();

    const versionChanged =
      !!G.store.getSeenVersion() && G.store.getSeenVersion() !== APP_VERSION;

    if (!state.channels.length || defaultsChanged) {
      state.loading = !state.channels.length;
      renderHome();
      setStatus("Loading lineup", "busy");
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

  function applyBrandConfig() {
    const b = CFG.brand || {};
    if (b.subtitle && els.heroSub) els.heroSub.textContent = b.subtitle;
  }

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

  /* ============================== admin default sync ============================== */

  async function ensureDefaults() {
    const defs = Array.isArray(CFG.defaultPlaylists)
      ? CFG.defaultPlaylists.filter((p) => p && p.url && p.enabled !== false)
      : [];
    if (!defs.length && CFG.syncRemovedDefaults !== true) return false;
    if (state.playlists.length && CFG.ensureDefaults !== true && CFG.syncRemovedDefaults !== true) return false;

    let changed = false;
    const activeDefaultIds = new Set();
    const activeDefaultUrls = new Set();

    for (const item of defs) {
      const url = normalizeUrl(item.url);
      if (!url) continue;
      const name = (item.name || nameFromUrl(url)).trim() || "Galib TV Lineup";
      const configId = item.id ? String(item.id) : "";
      if (configId) activeDefaultIds.add(configId);
      activeDefaultUrls.add(url);

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
        /* Admin default playlists always stay first in the list */
        state.playlists.unshift(meta);
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
          await G.store.deleteCachedChannels(meta.id);
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

    /* Remove old default playlists if admin removed or disabled them in config.js */
    if (CFG.syncRemovedDefaults === true) {
      const removed = state.playlists.filter((p) => {
        if (p.source !== "default") return false;
        const matchId = p.configId && activeDefaultIds.has(p.configId);
        const matchUrl = p.url && activeDefaultUrls.has(p.url);
        return !matchId && !matchUrl;
      });
      if (removed.length) {
        for (const r of removed) {
          state.cache.delete(r.id);
          await G.store.deleteCachedChannels(r.id);
        }
        const removedIds = new Set(removed.map((r) => r.id));
        state.playlists = state.playlists.filter((p) => !removedIds.has(p.id));
        changed = true;
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
    /* Admin default playlists first, then any user-added playlists */
    const ordered = state.playlists
      .slice()
      .sort((a, b) => (a.source === "default" ? -1 : 1) - (b.source === "default" ? -1 : 1));

    ordered.forEach((pl) => {
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

  /* ============================== admin + user backups ============================== */

  function normChannelName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/\b(hd|fhd|uhd|sd|4k|bd|live|tv|channel)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizeStreamTarget(entry) {
    if (!entry) return null;
    if (typeof entry === "string") {
      if (/^yt:/i.test(entry.trim())) return { url: entry.trim(), label: "YouTube Live" };
      const u = normalizeUrl(entry);
      return u ? { url: u, label: "" } : null;
    }
    if (typeof entry === "object") {
      if (entry.ytHandle) {
        const h = String(entry.ytHandle).trim();
        const handle = h.startsWith("@") ? h : "@" + h;
        return { url: "yt:" + handle, label: String(entry.label || "YouTube Live").trim() };
      }
      if (entry.ytChannel) {
        return { url: "yt:" + String(entry.ytChannel).trim(), label: String(entry.label || "YouTube Live").trim() };
      }
      if (entry.url) {
        if (/^yt:/i.test(String(entry.url).trim())) {
          return { url: String(entry.url).trim(), label: String(entry.label || "YouTube Live").trim() };
        }
        const u = normalizeUrl(entry.url);
        if (u) return { url: u, label: String(entry.label || "").trim() };
      }
    }
    return null;
  }

  function getAdminBackupsForChannel(ch) {
    if (!ch || !CFG.channelBackups || typeof CFG.channelBackups !== "object") return [];
    const map = CFG.channelBackups;
    const targetName = (ch.name || "").trim().toLowerCase();
    const targetNorm = normChannelName(ch.name);
    const targetUrl = (ch.url || "").trim();
    const collected = [];

    Object.keys(map).forEach((key) => {
      const k = key.trim();
      if (!k) return;
      const kl = k.toLowerCase();
      const kn = normChannelName(k);
      const matches =
        k === targetUrl ||
        kl === targetName ||
        (kn && targetNorm && (kn === targetNorm || targetName.includes(kl)));
      if (!matches) return;

      const entries = Array.isArray(map[key]) ? map[key] : [map[key]];
      entries.forEach((entry) => {
        const norm = normalizeStreamTarget(entry);
        if (norm) collected.push({ url: norm.url, label: norm.label, source: "admin" });
      });
    });

    return collected;
  }

  function getChannelServers(ch) {
    if (!ch || !ch.url) return [];
    const seen = new Set([ch.url]);
    const servers = [{ url: ch.url, label: "Server 1 (Main)", source: "main" }];

    let num = 2;
    getAdminBackupsForChannel(ch).forEach((item) => {
      if (seen.has(item.url)) return;
      seen.add(item.url);
      servers.push({
        url: item.url,
        label: item.label || "Server " + num,
        source: "admin",
      });
      num++;
    });

    const userList = state.backups[ch.id] || [];
    userList.forEach((rawUrl) => {
      const u = normalizeUrl(rawUrl);
      if (!u || seen.has(u)) return;
      seen.add(u);
      servers.push({
        url: u,
        label: "Backup " + num,
        source: "user",
      });
      num++;
    });

    return servers;
  }

  /* ============================== refresh ============================== */

  function autoRefreshMs() {
    const minutes = Number(CFG.autoRefreshMinutes);
    return (Number.isFinite(minutes) && minutes > 0 ? minutes : 15) * 60000;
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
          setStatus(id === "direct" ? "Fetching lineup…" : "Trying " + G.net.label(id) + "…", "busy");
        }
      },
    };
  }

  async function loadPlaylist(pl, opts = {}) {
    if (!pl || !pl.url) throw new Error("This playlist has no URL.");
    const res = await G.net.fetchPlaylist(pl.url, proxyOptions(opts.quiet));
    const channels = G.m3u.parse(res.text);
    if (!channels.length) throw new Error("No channels found in playlist.");

    state.cache.set(pl.id, channels);
    pl.count = channels.length;
    pl.updatedAt = Date.now();
    pl.lastVia = res.via;
    state.lastVia = res.via;
    G.store.savePlaylists(state.playlists);
    await G.store.cacheChannels(pl.id, channels);
    return channels;
  }

  async function refreshAll(opts = {}) {
    const { force = false, background = false, silent = false, ids = null } = opts;
    if (state.refreshing) {
      if (!background) toast("Refreshing channels…", "warn");
      return false;
    }

    const targets = state.playlists.filter(
      (p) => p.url && (!ids || ids.includes(p.id)) && (force || shouldRefresh(p))
    );

    state.lastRefreshAt = Date.now();
    if (!targets.length) {
      if (!silent && !background) toast("Channels are already up to date.", "ok");
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
        if (!background && !silent) toast(pl.name + ": " + friendlyError(err), "err", 7000);
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
        if (!silent) toast("Lineup updated · " + state.channels.length.toLocaleString() + " live channels", "ok");
      } else if (fail && !ok) {
        setStatus("Offline", "error");
        if (!silent) toast("Could not refresh the channel lineup.", "err");
      } else {
        setStatus("Ready");
      }
    } else if (ok) {
      setStatus("Ready");
    }

    return fail === 0;
  }

  /* ============================== events ============================== */

  function bindEvents() {
    if (els.addBtn) {
      els.addBtn.addEventListener("click", () => {
        closeModal(els.modalSettings);
        openAddModal();
      });
    }
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
    if (els.allCatsBtn) {
      els.allCatsBtn.addEventListener("click", () => openCategoryView("all"));
    }

    els.bottomNavBtns.forEach((btn) =>
      btn.addEventListener("click", () => onBottomNav(btn.dataset.bnav))
    );

    els.search.addEventListener("input", onSearchInput);
    els.search.addEventListener("keydown", onSearchKey);

    els.refreshAllBtn.addEventListener("click", () => refreshAll({ force: true }));
    els.gridMoreBtn.addEventListener("click", appendHomePage);
    if (els.gridAllBtn) els.gridAllBtn.addEventListener("click", showAllHomeChannels);
    els.moreBtn.addEventListener("click", appendRailPage);

    els.catBar.addEventListener("click", onCatClick);
    if (els.catShelves) els.catShelves.addEventListener("click", onGridClick);
    els.channelGrid.addEventListener("click", onGridClick);
    els.favRow.addEventListener("click", onGridClick);
    if (els.featuredRow) els.featuredRow.addEventListener("click", onGridClick);
    els.recentRow.addEventListener("click", onGridClick);
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
      if (!state.current) return toast("Select a channel first.", "warn");
      toggleFavoriteById(state.current.id);
    });
    els.retryBtn.addEventListener("click", () => retryCurrentServer(false));
    els.muteBtn.addEventListener("click", toggleMute);
    els.pipBtn.addEventListener("click", togglePip);
    if (els.rotateBtn) els.rotateBtn.addEventListener("click", toggleRotate);
    if (els.rotateExitBtn) els.rotateExitBtn.addEventListener("click", () => setCssRotate(false));
    els.fullBtn.addEventListener("click", toggleFullscreen);
    els.errorRetry.addEventListener("click", () => retryAllServers());
    els.errorProxy.addEventListener("click", () => retryCurrentServer(true));
    els.errorBackup.addEventListener("click", openBackupModal);
    els.backupBtn.addEventListener("click", openBackupModal);
    els.copyBtn.addEventListener("click", copyStreamUrl);

    els.sourcePills.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-server-idx]");
      if (!btn || !state.current) return;
      const idx = Number(btn.dataset.serverIdx);
      if (Number.isFinite(idx) && state.servers[idx]) {
        state.failedServers.delete(idx);
        startServerIndex(idx, { proxyFirst: false });
      }
    });

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

  /* ============================== mobile bottom nav ============================== */

  function setBottomNavActive(key) {
    els.bottomNavBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.bnav === key));
  }

  function onBottomNav(action) {
    if (action === "home") {
      setBottomNavActive("home");
      if (state.view !== "home") showHome(true);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "fav") {
      setBottomNavActive("fav");
      if (state.view === "watch") {
        setRailTab("fav");
        els.rail.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (state.favorites.length) {
        els.favSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        toast("Tap the ★ icon on any channel to add it to Favourites.", "ok");
      }
    } else if (action === "search") {
      setBottomNavActive("search");
      if (state.view !== "home") showHome(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => els.search.focus(), 120);
    } else if (action === "settings") {
      openSettings();
    }
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
    setBottomNavActive("home");

    if (wasWatch && els.video && !els.video.paused) {
      try { els.video.pause(); } catch {}
    }

    if (pushHistory !== false && wasWatch) {
      history.pushState({ gtv: "home" }, "", location.pathname + location.search);
    }

    state.group = "all";
    state.catExpanded = false;
    renderHome();
    setStatus("Ready");
    document.title = "Galib TV — Live OTT Streaming";
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
    if (ch) playChannel(ch, { history: false });
    else history.replaceState({ gtv: "home" }, "", location.pathname + location.search);
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

  function watchFirstChannel() {
    const first = state.favorites[0] || state.homeList[0] || state.channels[0];
    if (first) playChannel(findChannel(first.id) || first);
    else toast("Channel lineup is still loading…", "warn");
  }

  function resumeLast() {
    if (state.current) {
      showWatch(true, state.current.id);
      const p = els.video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          setStatus("Press play");
          toast("Tap play on the video to resume.", "warn");
        });
      }
      return;
    }
    const last = state.recent[0];
    const ch = last ? findChannel(last.id) || last : null;
    if (ch) playChannel(ch);
    else watchFirstChannel();
  }

  /* ============================== playback & sequential backup fallback ============================== */

  function playChannel(channel, opts = {}) {
    if (!channel || !channel.url) return;
    const canonical = state.byId.get(channel.id);
    const ch = canonical ? Object.assign({}, channel, canonical) : channel;

    state.current = ch;
    state.servers = getChannelServers(ch);
    state.serverIndex = 0;
    state.failedServers = new Set();
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
    renderServerPills();
    startServerIndex(0, { proxyFirst: false });
  }

  function retryAllServers() {
    if (!state.current) return;
    state.servers = getChannelServers(state.current);
    state.failedServers = new Set();
    startServerIndex(0, { proxyFirst: false });
  }

  function retryCurrentServer(proxyFirst) {
    if (!state.current) return toast("Select a channel first.", "warn");
    state.failedServers.delete(state.serverIndex);
    startServerIndex(state.serverIndex, { proxyFirst: !!proxyFirst });
  }

  function startServerIndex(idx, opts = {}) {
    if (!state.current) return;
    const srv = state.servers[idx] || state.servers[0];
    if (!srv) return;

    state.serverIndex = idx;
    state.playingUrl = srv.url;
    state.usingBackup = idx > 0;
    state.fallbackBusy = false;

    const channel = Object.assign({}, state.current, { url: srv.url });
    const live = isLiveKind(srv.url);

    els.errorBox.hidden = true;
    els.idle.hidden = true;
    els.spinner.hidden = false;
    els.spinnerText.textContent =
      idx > 0 ? "Connecting to " + srv.label + "…" : "Connecting to live stream…";
    els.liveBadge.hidden = !live;
    els.qualityBadge.hidden = true;
    els.backupBadge.hidden = !state.usingBackup;
    if (state.usingBackup) els.backupBadge.textContent = srv.label.toUpperCase();
    els.screenTitle.textContent = state.current.name;

    renderServerPills();
    updateBackupButton();

    const wrap = streamWrapper();
    const mixedContent = location.protocol === "https:" && /^http:\/\//i.test(srv.url);
    const useProxyFirst =
      !!opts.proxyFirst || (!!wrap && (mixedContent || state.settings.streamProxy === "always"));

    player.play(channel, {
      wrap,
      useProxyFirst,
      autoplay: state.settings.autoplay,
      lowLatency: state.settings.lowLatency,
    });

    setStatus(state.usingBackup ? srv.label : "Connecting", "busy");
  }

  function maybeTryNextServer() {
    if (!state.current || state.fallbackBusy) return false;
    state.failedServers.add(state.serverIndex);
    renderServerPills();

    /* Find next untried server in sequence */
    let nextIdx = -1;
    for (let i = state.serverIndex + 1; i < state.servers.length; i++) {
      if (!state.failedServers.has(i)) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx < 0) return false;

    const nextSrv = state.servers[nextIdx];
    state.fallbackBusy = true;
    toast("Switching to " + nextSrv.label + "…", "warn", 3200);
    setStatus("Trying " + nextSrv.label, "busy");

    setTimeout(() => {
      state.fallbackBusy = false;
      if (state.current) startServerIndex(nextIdx, { proxyFirst: false });
    }, 260);
    return true;
  }

  function renderServerPills() {
    if (!els.sourceBar || !els.sourcePills) return;
    if (!state.current) {
      els.sourceBar.hidden = true;
      return;
    }
    els.sourceBar.hidden = false;
    els.sourcePills.textContent = "";

    state.servers.forEach((srv, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "srv-pill";
      if (idx === state.serverIndex) btn.classList.add("is-active");
      if (state.failedServers.has(idx)) btn.classList.add("is-failed");
      btn.dataset.serverIdx = String(idx);
      btn.textContent = srv.label;
      els.sourcePills.appendChild(btn);
    });
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
        els.spinnerText.textContent = data.message || "Connecting to live stream…";
        els.errorBox.hidden = true;
        els.idle.hidden = true;
        els.liveBadge.hidden = true;
        setStatus(data.proxied ? "Via proxy" : "Connecting", "busy");
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
        setStatus("Tap play");
        if (!state.blockedToastShown) {
          state.blockedToastShown = true;
          toast("Tap the play button on the video to start.", "warn");
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
        if (maybeTryNextServer()) return;
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

  function showPlayerError(data) {
    const total = state.servers.length;
    els.errorTitle.textContent =
      total > 1 ? "All " + total + " servers unavailable" : data.title || "Stream unavailable";
    els.errorText.textContent =
      total > 1
        ? "Tried main and all backup servers without response. You can retry or add a new backup link."
        : data.text || "This channel may be offline, BDIX-only, or blocked on HTTPS.";
    els.errorBox.hidden = false;
    els.spinner.hidden = true;
    setStatus("Unavailable", "error");
  }

  function isLiveKind(url) {
    const kind = G.streamKind(url || "");
    return kind === "hls" || kind === "ts" || kind === "youtube";
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
      els.sourceBar.hidden = true;
      document.title = "Galib TV — Live OTT Streaming";
      return;
    }
    els.nowTitle.textContent = channel.name;
    els.nowSub.textContent = channel.group || "Live TV";
    setLogo(els.nowLogo, channel);
    const fav = isFavorite(channel.id);
    els.favBtn.classList.toggle("is-active", fav);
    els.favBtn.title = fav ? "Remove from favourites" : "Add to favourites";
    renderServerPills();
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
      state.featured.find((c) => c.id === id) ||
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
    state.recent = [snap].concat(state.recent.filter((c) => c.id !== snap.id)).slice(0, 24);
    G.store.saveRecent(state.recent);
    renderRecent();
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

  /* ============================== backup modal ============================== */

  function openBackupModal() {
    if (!state.current) {
      toast("Play a channel first to manage backup servers.", "warn");
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
    if (!state.current) return false;
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
    state.backups[id] = list.slice(0, 10);
    G.store.saveBackups(state.backups);

    state.servers = getChannelServers(state.current);
    toast("Backup server saved", "ok");
    renderBackupList();
    renderServerPills();
    updateBackupButton();

    if (playNow) {
      closeModal(els.modalBackup);
      const idx = state.servers.findIndex((s) => s.url === url);
      if (idx >= 0) {
        state.failedServers.delete(idx);
        startServerIndex(idx, { proxyFirst: false });
      }
    }
    return true;
  }

  function renderBackupList() {
    els.backupList.textContent = "";
    const backupsOnly = state.servers.slice(1);
    if (!backupsOnly.length) {
      const p = document.createElement("p");
      p.className = "hint";
      p.textContent = "No backup servers configured for this channel yet.";
      els.backupList.appendChild(p);
      return;
    }

    backupsOnly.forEach((srv, i) => {
      const serverIdx = i + 1;
      const row = document.createElement("div");
      row.className = "backup-item";

      const info = document.createElement("div");
      info.className = "backup-url";
      info.title = srv.url;
      if (srv.source === "admin") {
        const tag = document.createElement("span");
        tag.className = "backup-tag";
        tag.textContent = "Admin";
        info.appendChild(tag);
      }
      info.appendChild(document.createTextNode(srv.label + " · " + srv.url));

      const actions = document.createElement("div");
      actions.className = "backup-actions-row";

      const play = document.createElement("button");
      play.type = "button";
      play.className = "mini-btn accent";
      play.dataset.backupPlayIdx = String(serverIdx);
      play.textContent = "Play";
      actions.appendChild(play);

      if (srv.source === "user") {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "mini-btn danger";
        remove.dataset.backupRemoveUrl = srv.url;
        remove.textContent = "Remove";
        actions.appendChild(remove);
      }

      row.append(info, actions);
      els.backupList.appendChild(row);
    });
  }

  function onBackupListClick(e) {
    if (!state.current) return;
    const playBtn = e.target.closest("[data-backup-play-idx]");
    if (playBtn) {
      const idx = Number(playBtn.dataset.backupPlayIdx);
      if (state.servers[idx]) {
        closeModal(els.modalBackup);
        state.failedServers.delete(idx);
        startServerIndex(idx, { proxyFirst: false });
      }
      return;
    }

    const removeBtn = e.target.closest("[data-backup-remove-url]");
    if (removeBtn) {
      const targetUrl = removeBtn.dataset.backupRemoveUrl;
      const list = (state.backups[state.current.id] || []).filter((u) => u !== targetUrl);
      if (list.length) state.backups[state.current.id] = list;
      else delete state.backups[state.current.id];
      G.store.saveBackups(state.backups);
      state.servers = getChannelServers(state.current);
      renderBackupList();
      renderServerPills();
      updateBackupButton();
      toast("Backup server removed");
    }
  }

  function updateBackupButton() {
    if (!els.backupBtn) return;
    const count = Math.max(0, state.servers.length - 1);
    els.backupBtn.textContent = count ? "+ Backup (" + count + ")" : "+ Backup";
  }

  /* ============================== render ============================== */

  function renderAll() {
    renderPlaylistSelects();
    renderCatBar();
    syncGroupFilter();
    renderFavourites();
    renderFeatured();
    renderRecent();
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
    renderFeatured();
    renderRecent();
    renderHomeGrid(true);
    updateHero();
  }

  function sortCategoryEntries(entries) {
    const pref = (Array.isArray(CFG.categoryOrder) ? CFG.categoryOrder : []).map((s) =>
      String(s).toLowerCase()
    );
    const demote = (Array.isArray(CFG.demoteCategories) ? CFG.demoteCategories : []).map((s) =>
      String(s).toLowerCase()
    );
    return entries.slice().sort((a, b) => {
      const an = a[0].toLowerCase();
      const bn = b[0].toLowerCase();
      const ad = demote.includes(an) ? 1 : 0;
      const bd = demote.includes(bn) ? 1 : 0;
      if (ad !== bd) return ad - bd;
      const ai = pref.indexOf(an);
      const bi = pref.indexOf(bn);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return b[1] - a[1] || a[0].localeCompare(b[0]);
    });
  }

  function renderCatBar() {
    const base = state.channels.filter((c) => {
      if (state.playlistFilter !== "all" && c.playlistId !== state.playlistFilter) return false;
      if (!state.query) return true;
      const q = state.query.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.group || "").toLowerCase().includes(q);
    });

    const counts = new Map();
    base.forEach((c) => {
      const g = c.group || "General";
      counts.set(g, (counts.get(g) || 0) + 1);
    });

    if (state.group !== "all" && !counts.has(state.group)) state.group = "all";

    const entries = sortCategoryEntries(Array.from(counts.entries()));
    const max = state.catExpanded ? entries.length : 14;
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

  function openCategoryView(group) {
    state.group = group || "all";
    renderCatBar();
    syncGroupFilter();
    renderHomeGrid(true);
    renderRail(true);
    const browseEl = $("#browse-section");
    if (browseEl && state.view === "home") {
      browseEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    openCategoryView(group);
  }

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

  function renderCategoryShelves(baseChannels) {
    if (!els.catShelves) return;
    els.catShelves.textContent = "";
    const grouped = new Map();
    baseChannels.forEach((c) => {
      const g = c.group || "General";
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push(c);
    });

    const ordered = sortCategoryEntries(
      Array.from(grouped.entries()).map(([name, list]) => [name, list.length])
    );

    const SHELF_LIMIT = 16;
    const frag = document.createDocumentFragment();

    ordered.forEach(([groupName, count]) => {
      const items = grouped.get(groupName) || [];
      const shelf = document.createElement("div");
      shelf.className = "cat-shelf";

      const head = document.createElement("div");
      head.className = "shelf-head";
      const title = document.createElement("h3");
      title.className = "shelf-title";
      title.textContent = groupName;
      const badge = document.createElement("span");
      badge.className = "shelf-count";
      badge.textContent = count.toLocaleString();
      title.appendChild(badge);

      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "shelf-all-btn";
      allBtn.dataset.openCat = groupName;
      allBtn.textContent = "Show all →";

      head.append(title, allBtn);

      const rail = document.createElement("div");
      rail.className = "h-rail";
      const preview = items.slice(0, SHELF_LIMIT);
      preview.forEach((ch) => rail.appendChild(buildCard(ch)));

      if (items.length > SHELF_LIMIT) {
        const moreCard = document.createElement("button");
        moreCard.type = "button";
        moreCard.className = "card-show-all";
        moreCard.dataset.openCat = groupName;
        moreCard.innerHTML =
          '<span class="all-arrow">→</span><strong>Show all</strong><span>' +
          items.length.toLocaleString() +
          " channels</span>";
        rail.appendChild(moreCard);
      }

      shelf.append(head, rail);
      frag.appendChild(shelf);
    });

    els.catShelves.appendChild(frag);
  }

  function renderHomeGrid(reset) {
    state.homeRenderToken++;
    state.homeList = computeHomeList();
    if (reset) {
      els.channelGrid.textContent = "";
      state.homeShown = 0;
    }

    if (state.loading && !state.channels.length) {
      if (els.catShelves) els.catShelves.hidden = true;
      els.channelGrid.hidden = false;
      renderSkeletons();
      els.gridMore.hidden = true;
      updateBrowseCount();
      return;
    }

    if (!state.homeList.length) {
      if (els.catShelves) els.catShelves.hidden = true;
      els.channelGrid.hidden = false;
      renderHomeEmpty();
      els.gridMore.hidden = true;
      updateBrowseCount();
      return;
    }

    /* OTT Category Shelves Mode: stacked horizontal category sliders */
    if (state.group === "all" && !state.query && els.catShelves) {
      els.catShelves.hidden = false;
      els.channelGrid.hidden = true;
      els.gridMore.hidden = true;
      if (els.allCatsBtn) els.allCatsBtn.hidden = true;
      if (els.browseTitleText) els.browseTitleText.textContent = "Browse Categories";
      renderCategoryShelves(state.homeList);
      updateBrowseCount();
      return;
    }

    /* Single Category Full-Page Grid or Search Results Mode */
    if (els.catShelves) els.catShelves.hidden = true;
    els.channelGrid.hidden = false;
    if (els.allCatsBtn) els.allCatsBtn.hidden = state.group === "all";
    if (els.browseTitleText) {
      els.browseTitleText.textContent = state.query ? "Search Results" : state.group;
    }

    if (state.group !== "all" && !state.query) {
      showAllHomeChannels();
    } else {
      if (state.homeShown === 0) appendHomePage();
      els.gridMore.hidden = state.homeShown >= state.homeList.length;
    }
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

  /* Smooth chunked rendering for "Show all channels" */
  function showAllHomeChannels() {
    if (!state.homeList.length || state.homeShown >= state.homeList.length) {
      els.gridMore.hidden = true;
      return;
    }
    const token = ++state.homeRenderToken;
    els.gridMore.hidden = true;
    const CHUNK = 80;

    function step() {
      if (token !== state.homeRenderToken) return;
      const end = Math.min(state.homeShown + CHUNK, state.homeList.length);
      const frag = document.createDocumentFragment();
      for (let i = state.homeShown; i < end; i++) {
        frag.appendChild(buildCard(state.homeList[i]));
      }
      els.channelGrid.appendChild(frag);
      state.homeShown = end;
      updateBrowseCount();
      if (state.homeShown < state.homeList.length) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
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
    main.setAttribute("aria-label", "Watch " + ch.name);

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
      img.addEventListener("load", () => logo.classList.add("has-logo"));
      img.addEventListener("error", () => {
        logo.classList.remove("has-logo");
        img.remove();
      });
      img.src = ch.logo;
      if (img.complete && img.naturalWidth > 0) logo.classList.add("has-logo");
      logo.appendChild(img);
    }

    const liveDot = document.createElement("span");
    liveDot.className = "card-live-dot";
    liveDot.innerHTML = "<i></i>LIVE";
    logo.appendChild(liveDot);

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
    group.textContent = ch.group || "Live TV";
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

  function resolveFeaturedChannels() {
    const defs = Array.isArray(CFG.featuredChannels) ? CFG.featuredChannels : [];
    if (!defs.length) return [];
    const out = [];
    const usedIds = new Set();

    defs.forEach((entry) => {
      const item = typeof entry === "string" ? { name: entry, match: [entry] } : entry;
      if (!item || !item.name) return;
      const terms = (Array.isArray(item.match) && item.match.length ? item.match : [item.name]).map((t) =>
        String(t).trim().toLowerCase()
      );

      let found =
        state.channels.find((c) => terms.includes(c.name.trim().toLowerCase())) ||
        state.channels.find((c) => {
          const cn = c.name.trim().toLowerCase();
          return terms.some((t) => cn.startsWith(t) || cn.includes(t));
        });

      if (found) {
        if (!usedIds.has(found.id)) {
          usedIds.add(found.id);
          out.push(found);
        }
        return;
      }

      const fb = normalizeStreamTarget(
        item.ytHandle ? { ytHandle: item.ytHandle } : item.ytChannel ? { ytChannel: item.ytChannel } : item.fallbackUrl
      );
      if (fb) {
        const vid = "feat_" + G.m3u.hash(item.name + "|" + fb.url);
        if (!usedIds.has(vid)) {
          usedIds.add(vid);
          out.push({
            id: vid,
            name: item.name,
            url: fb.url,
            logo: item.logo || "",
            group: item.group || "Featured",
            tvgId: "",
            playlistId: "featured",
            playlistName: "Featured",
          });
        }
      }
    });

    return out;
  }

  function renderFeatured() {
    if (!els.featuredSection || !els.featuredRow) return;
    const items = resolveFeaturedChannels();
    state.featured = items;
    els.featuredSection.hidden = !items.length;
    els.featuredRow.textContent = "";
    if (els.featuredCount) els.featuredCount.textContent = items.length ? items.length + " picks" : "";
    items.forEach((ch) => els.featuredRow.appendChild(buildCard(ch)));
  }

  function renderFavourites() {
    const items = state.favorites
      .map((fav) => state.byId.get(fav.id) || fav)
      .filter((c) => c && c.url);

    els.favSection.hidden = !items.length;
    els.favRow.textContent = "";
    els.favCount.textContent = items.length ? items.length + " channels" : "";
    items.forEach((ch) => els.favRow.appendChild(buildCard(ch)));
  }

  function renderRecent() {
    if (!els.recentSection || !els.recentRow) return;
    const items = state.recent
      .map((r) => state.byId.get(r.id) || r)
      .filter((c) => c && c.url)
      .slice(0, 12);

    els.recentSection.hidden = !items.length;
    els.recentRow.textContent = "";
    if (els.recentCount) els.recentCount.textContent = items.length ? items.length + " recent" : "";
    items.forEach((ch) => els.recentRow.appendChild(buildCard(ch)));
  }

  function computeRailList() {
    let list;
    if (state.railTab === "fav") list = state.favorites.map((f) => state.byId.get(f.id) || f);
    else if (state.railTab === "recent") list = state.recent.map((f) => state.byId.get(f.id) || f);
    else list = state.channels;

    list = list.filter((c) => c && c.url);
    if (state.playlistFilter !== "all") list = list.filter((c) => c.playlistId === state.playlistFilter);
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.group || "").toLowerCase().includes(q));
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
    row.setAttribute("aria-label", "Watch " + ch.name);
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
    group.textContent = ch.group || "Live TV";
    text.append(name, group);

    const now = document.createElement("span");
    now.className = "ch-now";
    now.textContent = "LIVE";

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
    let label = "More Live Channels";
    let context = "All Channels";

    if (state.railTab === "fav") {
      label = "Your Favourites";
      context = "Favourites";
    } else if (state.railTab === "recent") {
      label = "Recently Watched";
      context = "Recent";
    } else if (state.group !== "all") {
      label = "More in " + state.group;
      context = state.group;
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
      block = emptyBlock({ icon: ICONS.tv, title: "Loading lineup…", text: "Fetching live channels." });
    } else if (state.railTab === "fav") {
      block = emptyBlock({ icon: ICONS.star, title: "No favourites yet", text: "Tap ★ on any channel to pin it here." });
    } else if (state.railTab === "recent") {
      block = emptyBlock({ icon: ICONS.clock, title: "Nothing watched yet", text: "Channels you watch appear here." });
    } else if (state.query) {
      block = emptyBlock({
        icon: ICONS.search,
        title: "No matches",
        text: "Nothing found for “" + state.query + "”.",
        actions: [{ label: "Clear search", action: "clear-search" }],
      });
    } else {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "No channels here",
        text: "Try refreshing the lineup or switching category.",
        actions: [{ label: "Refresh", action: "refresh", primary: true }],
      });
    }
    els.list.appendChild(block);
    els.chanCount.textContent = "0 channels";
  }

  function renderHomeEmpty() {
    els.channelGrid.textContent = "";
    let block;
    if (state.query) {
      block = emptyBlock({
        icon: ICONS.search,
        title: "No channels match",
        text: "Nothing found for “" + state.query + "”.",
        actions: [{ label: "Clear search", action: "clear-search" }],
      });
    } else if (state.group !== "all") {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "Empty category",
        text: "No channels in “" + state.group + "”.",
        actions: [{ label: "Show all", action: "clear-group" }],
      });
    } else {
      block = emptyBlock({
        icon: ICONS.tv,
        title: "Could not load channel lineup",
        text: "Check your internet connection or try refreshing.",
        actions: [{ label: "Refresh lineup", action: "refresh", primary: true }],
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
      card.innerHTML = '<div class="sk-logo"></div><div class="sk-line"></div><div class="sk-line short"></div>';
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
        btn.className = a.primary ? "btn btn-primary" : "btn btn-glass";
        if (a.action) btn.dataset.action = a.action;
        btn.textContent = a.label;
        wrap.appendChild(btn);
      });
      box.appendChild(wrap);
    }
    return box;
  }

  /* ============================== selects / hero ============================== */

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
    const showDropdown = state.playlists.length > 1;
    if (els.playlistFilterWrap) els.playlistFilterWrap.hidden = !showDropdown;
    if (els.railPlaylistWrap) els.railPlaylistWrap.hidden = !showDropdown;

    const total = state.channels.length;
    const build = (select) => {
      if (!select) return;
      select.textContent = "";
      const all = document.createElement("option");
      all.value = "all";
      all.textContent = "All lineups (" + total.toLocaleString() + ")";
      select.appendChild(all);
      state.playlists.forEach((pl) => {
        const opt = document.createElement("option");
        opt.value = pl.id;
        opt.textContent = pl.name + " (" + (pl.count || 0).toLocaleString() + ")";
        select.appendChild(opt);
      });
      if (!state.playlists.some((p) => p.id === state.playlistFilter)) state.playlistFilter = "all";
      select.value = state.playlistFilter;
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
    all.textContent = "All categories (" + base.length.toLocaleString() + ")";
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
    if (state.loading && !state.channels.length) {
      els.heroStats.textContent = "Loading live channels…";
    } else if (!state.channels.length) {
      els.heroStats.textContent = "Connecting to lineup…";
    } else {
      els.heroStats.textContent =
        state.channels.length.toLocaleString() + " Channels · " + groups.size + " Categories";
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
    els.resumeBtn.textContent = "▶ Resume: " + target.name;
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
        ? "(" + total.toLocaleString() + ")"
        : "(" + shown.toLocaleString() + " of " + total.toLocaleString() + ")";
  }

  /* ============================== search & clicks ============================== */

  function onSearchInput() {
    state.query = els.search.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (state.view === "home") {
        renderCatBar();
        renderHomeGrid(true);
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
    } else {
      renderRail(true);
    }
  }

  function onGridClick(e) {
    const openCat = e.target.closest("[data-open-cat]");
    if (openCat) {
      openCategoryView(openCat.dataset.openCat);
      return;
    }
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
    if (action) handleAction(action.dataset.action);
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
    }
  }

  async function refreshCurrentFilter() {
    if (state.playlistFilter !== "all") {
      const pl = state.playlists.find((p) => p.id === state.playlistFilter);
      if (pl) return refreshPlaylist(pl);
    }
    return refreshAll({ force: true });
  }

  /* ============================== custom playlists ============================== */

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
      toast("Invalid URL.", "err");
      return false;
    }
    const existing = state.playlists.find((p) => p.url === url);
    if (existing) {
      toast("Playlist already added — refreshing.", "warn");
      closeModal(els.modalAdd);
      await refreshPlaylist(existing);
      return true;
    }
    setStatus("Loading playlist", "busy");
    try {
      const res = await G.net.fetchPlaylist(url, proxyOptions(false));
      const channels = G.m3u.parse(res.text);
      if (!channels.length) throw new Error("No channels found in playlist.");
      state.lastVia = res.via;
      const meta = await addPlaylistFromChannels(channels, name || nameFromUrl(url), "url", url);
      closeModal(els.modalAdd);
      toast("Added " + meta.name + " · " + channels.length.toLocaleString() + " channels", "ok");
      setStatus("Ready");
      return true;
    } catch (err) {
      setStatus("Error", "error");
      toast(friendlyError(err), "err", 7000);
      return false;
    }
  }

  async function addPlaylistFromChannels(channels, name, source, url) {
    const meta = {
      id: G.store.uid(),
      name: name || "Custom playlist",
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
    if (!state.pendingFile) return toast("Choose an .m3u or .m3u8 file first.", "warn");
    const btn = els.formFile.querySelector('button[type="submit"]');
    setBtnBusy(btn, true);
    try {
      const text = await state.pendingFile.text();
      const channels = G.m3u.parse(text);
      if (!channels.length) throw new Error("No channels found in that file.");
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
    if (!text) return toast("Paste M3U content first.", "warn");
    const btn = els.formText.querySelector('button[type="submit"]');
    setBtnBusy(btn, true);
    try {
      const channels = G.m3u.parse(text);
      if (!channels.length) throw new Error("No channels found.");
      const meta = await addPlaylistFromChannels(
        channels,
        els.inTextName.value.trim() || "Custom playlist",
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

  async function refreshPlaylist(pl) {
    if (!pl || !pl.url) return false;
    setStatus("Refreshing…", "busy");
    try {
      await loadPlaylist(pl, { quiet: false });
      rebuildMerged();
      renderAll();
      renderManage();
      setStatus("Ready");
      toast("Updated " + pl.name, "ok");
      return true;
    } catch (err) {
      setStatus("Ready");
      toast(pl.name + ": " + friendlyError(err), "err", 7000);
      return false;
    }
  }

  function renderManage() {
    if (!els.manageList) return;
    els.manageList.textContent = "";
    if (!state.playlists.length) {
      const p = document.createElement("p");
      p.className = "hint";
      p.textContent = "No active lineups.";
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
        (pl.source === "default" ? "Official lineup" : "Custom");
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
      if (pl.source !== "default" || CFG.ensureDefaults !== true) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "mini-btn danger";
        del.textContent = "Remove";
        del.addEventListener("click", () => deletePlaylist(pl));
        actions.appendChild(del);
      }

      row.append(info, actions);
      els.manageList.appendChild(row);
    });
  }

  async function deletePlaylist(pl) {
    if (!pl || !confirm('Remove "' + pl.name + '"?')) return;
    state.playlists = state.playlists.filter((p) => p.id !== pl.id);
    state.cache.delete(pl.id);
    G.store.savePlaylists(state.playlists);
    await G.store.deleteCachedChannels(pl.id);
    if (state.playlistFilter === pl.id) state.playlistFilter = "all";
    rebuildMerged();
    renderAll();
    renderManage();
    toast("Playlist removed");
  }

  /* ============================== settings / media controls ============================== */

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
    if (!confirm("Reset local cache and reload Galib TV?")) return;
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
    if (meta) meta.content = t === "light" ? "#f4f7fb" : "#060911";
    G.store.setTheme(t);
    if (els.setDark) els.setDark.checked = t === "dark";
  }

  function toggleTheme() {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  }

  function toggleMute() {
    if (player && typeof player.toggleMute === "function") {
      const muted = player.toggleMute();
      els.muteBtn.classList.toggle("is-active", !!muted);
      return;
    }
    els.video.muted = !els.video.muted;
  }

  async function togglePip() {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (document.pictureInPictureEnabled && state.current) await els.video.requestPictureInPicture();
      else toast("Picture-in-picture unavailable.", "warn");
    } catch {
      toast("Could not open picture-in-picture.", "warn");
    }
  }

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function setCssRotate(on) {
    state.rotated = !!on;
    if (els.videoWrap) els.videoWrap.classList.toggle("is-rotated", state.rotated);
    if (els.rotateBtn) els.rotateBtn.classList.toggle("is-active", state.rotated || state.orientationLocked);
    if (els.rotateExitBtn) els.rotateExitBtn.hidden = !state.rotated;
    document.body.style.overflow = state.rotated ? "hidden" : "";
  }

  async function toggleRotate() {
    if (state.rotated) {
      setCssRotate(false);
      return;
    }
    if (state.orientationLocked || isFullscreen()) {
      state.orientationLocked = false;
      if (els.rotateBtn) els.rotateBtn.classList.remove("is-active");
      try {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      } catch {}
      if (isFullscreen()) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
      return;
    }

    const wrap = els.videoWrap;
    let locked = false;
    if (wrap && screen.orientation && typeof screen.orientation.lock === "function") {
      try {
        if (wrap.requestFullscreen) await wrap.requestFullscreen();
        else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
        await screen.orientation.lock("landscape");
        locked = true;
        state.orientationLocked = true;
        if (els.rotateBtn) els.rotateBtn.classList.add("is-active");
      } catch {}
    }
    if (!locked) {
      if (isFullscreen()) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
      setCssRotate(true);
    }
  }

  function onFullscreenChange() {
    const full = isFullscreen();
    els.screenTitle.hidden = !(full && state.current);
    if (full && state.current) els.screenTitle.textContent = state.current.name;
    if (!full && state.orientationLocked) {
      state.orientationLocked = false;
      if (els.rotateBtn) els.rotateBtn.classList.remove("is-active");
      try {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      } catch {}
    }
  }

  function toggleFullscreen() {
    if (state.rotated) setCssRotate(false);
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
    if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
    else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  }

  async function copyStreamUrl() {
    if (!state.current) return;
    const url = state.playingUrl || state.current.url;
    try {
      await navigator.clipboard.writeText(url);
      toast("Stream URL copied", "ok");
    } catch {
      toast("Could not copy URL.", "err");
    }
  }

  /* ============================== helpers ============================== */

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
    setTimeout(remove, ms || 3800);
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
      return "Could not reach URL. Try changing proxy in Settings.";
    }
    if (/abort|timeout/i.test(msg)) return "Request timed out.";
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
      return last.replace(/\.(m3u8?|txt)$/i, "").replace(/[-_]+/g, " ").trim() || url.hostname;
    } catch {
      return "Playlist";
    }
  }

  /* ============================== PWA & auto-update ============================== */

  function setupPWA() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredInstall = e;
      els.installBtn.hidden = false;
    });
    window.addEventListener("appinstalled", () => {
      state.deferredInstall = null;
      els.installBtn.hidden = true;
      toast("Galib TV installed!", "ok");
    });

    const ua = navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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
        .catch(() => {});
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  }

  async function installApp() {
    if (els.installBtn.dataset.ios === "1") {
      toast("iPhone/iPad: tap Share → Add to Home Screen.", "ok", 6500);
      return;
    }
    if (!state.deferredInstall) {
      toast("Use browser menu → Install App.", "ok", 5000);
      return;
    }
    state.deferredInstall.prompt();
    try { await state.deferredInstall.userChoice; } catch {}
    state.deferredInstall = null;
    els.installBtn.hidden = true;
  }

  function setVersionLabel() {
    const label = "v" + APP_VERSION + (BUILD_DATE ? " · " + BUILD_DATE : "");
    if (els.versionLabel) els.versionLabel.textContent = label;
    if (els.appVersion) els.appVersion.textContent = "Galib TV v" + APP_VERSION;
    if (els.footerVersion) els.footerVersion.textContent = "v" + APP_VERSION;
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
      if (now - state.lastRefreshAt > autoRefreshMs()) refreshAll({ background: true, silent: true });
    });
  }

  async function fetchRemoteVersion() {
    const url = new URL(VERSION_FILE, location.href);
    url.searchParams.set("t", String(Date.now()));
    const res = await fetch(url.href, { cache: "no-store", credentials: "omit" });
    if (!res.ok) throw new Error("HTTP " + res.status);
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
          ok ? "Latest version · Live channels refreshed." : "Latest version · Refresh failed.",
          ok ? "ok" : "warn",
          4500
        );
      }
      return false;
    } catch {
      if (manual) toast("Could not check for updates.", "warn");
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
    try { last = Number(sessionStorage.getItem(guardKey) || 0); } catch {}
    if (last && Date.now() - last < 30000) {
      state.hardReloading = false;
      toast("Update found — please close and reopen the app.", "warn", 8000);
      return;
    }
    try { sessionStorage.setItem(guardKey, String(Date.now())); } catch {}

    setStatus("Updating…", "busy");
    toast("Updating Galib TV to v" + remoteVersion + "…", "ok", 3000);

    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {}
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 400));

    const url = new URL(location.href);
    url.searchParams.set("v", remoteVersion);
    url.searchParams.set("t", String(Date.now()));
    location.replace(url.href);
  }

  /* ============================== keyboard ============================== */

  function onKeyDown(e) {
    const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable);

    if (e.key === "Escape") {
      if (state.rotated) return setCssRotate(false);
      if ($(".modal:not([hidden])")) return closeAllModals();
      if (isFullscreen()) return;
      if (state.query) return clearSearch();
      if (typing) return e.target.blur();
      if (state.view === "watch") showHome(true);
      return;
    }

    if (typing || $(".modal:not([hidden])")) return;

    if (e.key === "/") {
      e.preventDefault();
      els.search.focus();
      els.search.select();
      return;
    }

    const key = e.key.toLowerCase();
    if (key === "f") { e.preventDefault(); toggleFullscreen(); }
    else if (key === "r") { e.preventDefault(); toggleRotate(); }
    else if (key === "m") { e.preventDefault(); toggleMute(); }
    else if (key === "p") { e.preventDefault(); togglePip(); }
  }

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
