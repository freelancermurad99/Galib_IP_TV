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

  /* ৩. ফিচার্ড চ্যানেল (হোম পেজে Favourites ও Recently Watched-এর সাথে দেখাবে)
     - চ্যানেলের নাম লিখলেই M3U লিস্ট থেকে অটোমেটিক খুঁজে নেবে।
     - M3U কাজ না করলে বা না থাকলে `ytHandle` / `fallbackUrl` (YouTube Live) দিয়ে অটো প্লে হবে। */
  featuredChannels: [
    { name: "T Sports", match: ["T Sports", "TSports", "T-Sports"], group: "Sports", ytHandle: "@TSportsbd" },
    { name: "Zee Bangla", match: ["Zee Bangla", "Zee Bangla HD"], group: "Indian Entertainment" },
    { name: "Star Jalsha", match: ["Star Jalsha", "Star Jalsha HD"], group: "Indian Entertainment" },
    { name: "Jalsha Movies", match: ["Jalsha Movies", "Jolsha Movies", "Jalsha Movies HD"], group: "Indian Movies" },
    { name: "Somoy TV", match: ["Somoy TV", "Somoy News"], group: "News", ytHandle: "@somoynews360" },
    { name: "Jamuna TV", match: ["Jamuna TV", "Jamuna Television"], group: "News", ytHandle: "@JamunaTVbd" },
    { name: "Independent TV", match: ["Independent TV", "Independent Television"], group: "News", ytHandle: "@IndependentTelevision" },
    { name: "Channel 24", match: ["Channel 24", "Channel 24 HD"], group: "News", ytHandle: "@channel24digital" },
    { name: "DBC News", match: ["DBC News", "DBC News TV"], group: "News", ytHandle: "@dbcnewstv" },
    { name: "ATN News", match: ["ATN News", "ATN Bangla News"], group: "News", ytHandle: "@ATNBanglanews" },
    { name: "Ekattor TV", match: ["Ekattor TV", "71 TV"], group: "News", ytHandle: "@ekattor_tv" },
  ],

  /* ৪. অ্যাডমিন ব্যাকআপ স্ট্রিম লিংক (M3U8 বা YouTube Live — একের পর এক ট্রাই করবে)
     - ফুল URL অথবা { label: "YouTube Live", ytHandle: "@TSportsbd" } — দুটোই কাজ করবে। */
  channelBackups: {
    "T Sports": [{ label: "YouTube Live", ytHandle: "@TSportsbd" }],
    "Somoy TV": [{ label: "YouTube Live", ytHandle: "@somoynews360" }],
    "Jamuna TV": [{ label: "YouTube Live", ytHandle: "@JamunaTVbd" }],
    "Independent TV": [{ label: "YouTube Live", ytHandle: "@IndependentTelevision" }],
    "Channel 24": [{ label: "YouTube Live", ytHandle: "@channel24digital" }],
    "DBC News": [{ label: "YouTube Live", ytHandle: "@dbcnewstv" }],
    "ATN News": [{ label: "YouTube Live", ytHandle: "@ATNBanglanews" }],
    "Ekattor TV": [{ label: "YouTube Live", ytHandle: "@ekattor_tv" }],
  },

  /* YouTube @handle -> Channel ID ম্যাপ (ইনস্ট্যান্ট লাইভ অটো-ডিটেক্টের জন্য) */
  youtubeChannelIds: {
    "@tsportsbd": "UC2t9imwIR7xlDfma3CmRKJQ",
    "@somoynews360": "UCxHoBXkY88Tb8z1Ssj6CWsQ",
    "@jamunatvbd": "UCN6sm8iHiPd0cnoUardDAnw",
    "@independenttelevision": "UCATUkaOHwO9EP_W87zCiPbA",
    "@channel24digital": "UCHLqIOMPk20w-6cFgkA90jw",
    "@atnbanglanews": "UCbgcYEdMsuypG2NJ-znBp3w",
  },

  /* ৪. হোম পেজে কোন ক্যাটাগরিগুলো সবার আগে দেখাবে (ইচ্ছামতো সাজাতে পারবেন) */
  categoryOrder: [
    "Bangladesh",
    "Sports",
    "Indian Movies",
    "Indian Entertainment",
    "News",
    "Kids",
    "Indian Music",
    "Music",
    "Documentary & Wildlife",
    "International",
  ],
  demoteCategories: ["Backup", "Review"],

  /* ৫. অ্যাডমিন ব্র্যান্ডিং */
  brand: {
    name: "Galib TV",
    tagline: "LIVE OTT · বাংলা ও আন্তর্জাতিক টিভি",
    subtitle: "নির্বাচিত লাইভ টিভি চ্যানেল — দ্রুত, পরিচ্ছন্ন এবং মোবাইল-ফ্রেন্ডলি অভিজ্ঞতায়।",
  },

  /* Re-add missing defaults on every visit (set false to allow deleting them) */
  ensureDefaults: true,

  /* Remove old default playlists if admin removes/disables them in this file */
  syncRemovedDefaults: true,

  /* Refresh playlist URLs in the background (minutes) */
  autoRefreshMinutes: 15,

  /* Allow users to add custom playlists from Settings */
  allowUserPlaylists: true,
};
