/* =========================================================
   Galib TV — DEFAULT PLAYLISTS (edit me!)
   ---------------------------------------------------------
   এই ফাইলটাই সাইটের "ডিফল্ট চ্যানেল লিস্ট"।
   এখানে যত খুশি M3U / M3U8 লিংক যোগ করতে পারবেন।

   How to use:
   1. Add / remove / reorder entries in `defaultPlaylists`.
   2. Give every entry a short unique `id` — this lets the app
      update the URL later without creating a duplicate.
   3. Set `enabled: false` to keep an entry but not load it.
   4. After editing this file bump `assets/js/version.js` too,
      so installed PWAs reload automatically.
   5. Commit & push — GitHub Pages will serve the change.

   - First visit: every `enabled` playlist is added automatically,
     and all channels are merged into one home page list.
   - `ensureDefaults: true` means deleted defaults come back on the
     next visit. Set it to `false` to let users delete them.
   - `autoRefreshMinutes`: how often playlist URLs are re-fetched
     in the background so admin-added channels appear by themselves.
   ========================================================= */

window.GTV_CONFIG = {
  /* Default playlists shown to every new visitor */
  defaultPlaylists: [
    {
      id: "bdix",
      name: "BDIX IPTV (Bangladesh)",
      url: "https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u",
      enabled: true,
    },

    /* ---- more examples (uncomment / copy-paste) --------------------
    {
      id: "bd-iptv-org",
      name: "Bangladesh (iptv-org)",
      url: "https://iptv-org.github.io/iptv/countries/bd.m3u",
      enabled: true,
    },
    {
      id: "news",
      name: "News channels",
      url: "https://iptv-org.github.io/iptv/categories/news.m3u",
      enabled: false,
    },
    ---------------------------------------------------------------- */
  ],

  /* Re-add missing defaults on every visit (set false to allow deleting them) */
  ensureDefaults: true,

  /* Refresh playlist URLs in the background (minutes) */
  autoRefreshMinutes: 20,
};
