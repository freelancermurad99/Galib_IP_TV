/* =========================================================
   Local persistence
   - localStorage: playlists meta, favourites, recents, backups, settings
   - IndexedDB: cached channel lists (can be several MB)
   ========================================================= */
(function (global) {
  "use strict";
  const G = (global.GTV = global.GTV || {});

  const KEYS = {
    playlists: "gtv.playlists",
    active: "gtv.active",
    favorites: "gtv.favorites",
    recent: "gtv.recent",
    backups: "gtv.backups",
    settings: "gtv.settings",
    theme: "gtv.theme",
    version: "gtv.appVersion",
  };

  const DEFAULT_SETTINGS = {
    playlistProxy: "auto",
    customProxy: "",
    streamProxy: "auto",
    autoplay: true,
    lowLatency: true,
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("[GalibTV] storage write failed", err);
      return false;
    }
  }

  function uid(prefix) {
    return (prefix || "pl_") + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------- localStorage API ---------------- */
  const api = {
    getPlaylists() {
      const list = read(KEYS.playlists, []);
      return Array.isArray(list) ? list.filter((p) => p && p.id) : [];
    },
    savePlaylists(list) {
      return write(KEYS.playlists, list);
    },
    getActiveId() {
      return read(KEYS.active, null);
    },
    setActiveId(id) {
      write(KEYS.active, id);
    },
    getFavorites() {
      const list = read(KEYS.favorites, []);
      return Array.isArray(list) ? list.filter((c) => c && c.id) : [];
    },
    saveFavorites(list) {
      return write(KEYS.favorites, list);
    },
    getRecent() {
      const list = read(KEYS.recent, []);
      return Array.isArray(list) ? list.filter((c) => c && c.id) : [];
    },
    saveRecent(list) {
      return write(KEYS.recent, list);
    },
    /* backups: { [channelId]: [url, ...] } */
    getBackups() {
      const value = read(KEYS.backups, {});
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    },
    saveBackups(map) {
      return write(KEYS.backups, map);
    },
    getSeenVersion() {
      return read(KEYS.version, null);
    },
    setSeenVersion(version) {
      write(KEYS.version, version);
    },
    getSettings() {
      const s = read(KEYS.settings, {});
      return Object.assign({}, DEFAULT_SETTINGS, s && typeof s === "object" ? s : {});
    },
    saveSettings(settings) {
      return write(KEYS.settings, settings);
    },
    getTheme() {
      return read(KEYS.theme, "dark");
    },
    setTheme(theme) {
      write(KEYS.theme, theme);
    },
    reset() {
      Object.values(KEYS).forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
    },
    uid,
    KEYS,
    DEFAULT_SETTINGS,
  };

  /* ---------------- IndexedDB channel cache ---------------- */
  let dbPromise = null;

  function openDB() {
    if (!("indexedDB" in global)) return Promise.reject(new Error("IndexedDB unavailable"));
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open("galibtv", 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("channels")) db.createObjectStore("channels");
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("IndexedDB blocked"));
      }).catch((err) => {
        dbPromise = null;
        throw err;
      });
    }
    return dbPromise;
  }

  function tx(mode, fn) {
    return openDB().then(
      (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction("channels", mode);
          const store = transaction.objectStore("channels");
          const request = fn(store);
          transaction.oncomplete = () => resolve(request ? request.result : undefined);
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error);
        })
    );
  }

  api.cacheChannels = async function (playlistId, channels) {
    try {
      await tx("readwrite", (store) =>
        store.put({ channels, updatedAt: Date.now(), count: channels.length }, playlistId)
      );
      return true;
    } catch (err) {
      console.warn("[GalibTV] channel cache write failed", err);
      return false;
    }
  };

  api.getCachedChannels = async function (playlistId) {
    try {
      const cached = await tx("readonly", (store) => store.get(playlistId));
      if (cached && Array.isArray(cached.channels)) return cached;
      return null;
    } catch {
      return null;
    }
  };

  api.deleteCachedChannels = async function (playlistId) {
    try {
      await tx("readwrite", (store) => store.delete(playlistId));
    } catch {}
  };

  api.clearChannelCache = async function () {
    try {
      await tx("readwrite", (store) => store.clear());
    } catch {}
  };

  G.store = api;
})(window);
