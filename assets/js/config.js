/* =========================================================
   Galib TV — DEFAULT PLAYLISTS (edit me!)
   ---------------------------------------------------------
   এই ফাইলটাই সাইটের "ডিফল্ট চ্যানেল লিস্ট"।
   এখানে যত খুশি M3U / M3U8 লিংক যোগ করতে পারবেন।

   How to use:
   1. Add / remove / reorder entries in `defaultPlaylists`.
   2. Set `enabled: false` to keep an entry but not load it.
   3. Commit & push — GitHub Pages will serve the change.

   - First visit: সব `enabled` প্লেলিস্ট অটো লোড হবে,
     আর প্রথমটা একটিভ থাকবে।
   - `ensureDefaults: true` মানে — পরে কেউ ডিলিট করলেও
     সাইট রিফ্রেশে ডিফল্ট প্লেলিস্ট আবার যোগ হবে।
     পুরোপুরি ডিলিট করতে চাইলে এটাকে `false` করুন।
   ========================================================= */

window.GTV_CONFIG = {
  /* Default playlists shown to every new visitor */
  defaultPlaylists: [
    {
      name: "BDIX IPTV (Bangladesh)",
      url: "https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u",
      enabled: true,
    },

    /* ---- more examples (uncomment / copy-paste) --------------------
    {
      name: "News channels",
      url: "https://iptv-org.github.io/iptv/categories/news.m3u",
      enabled: true,
    },
    {
      name: "My backup playlist",
      url: "https://example.com/my-channels.m3u",
      enabled: false,
    },
    ---------------------------------------------------------------- */
  ],

  /* Re-add missing defaults on every visit (set false to allow deleting them) */
  ensureDefaults: true,
};
