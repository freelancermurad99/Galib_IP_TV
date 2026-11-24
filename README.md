# Galib TV — Web IPTV Player

ব্রাউজারেই টিভি দেখার জন্য একটা ফ্রি, ওপেন-সোর্স IPTV প্লেয়ার। যেকোনো **M3U / M3U8** প্লেলিস্ট লিংক, ফাইল বা পেস্ট করা টেক্সট থেকে চ্যানেল লোড করে — কোনো সার্ভার, ডাটাবেস বা বিল্ড স্টেপ ছাড়াই। GitHub Pages-এ সরাসরি হোস্ট করা যায়, আবার মোবাইলে **PWA** হিসেবেও ইনস্টল করা যায়।

> This app hosts **no channels**. It is only a player, like VLC. Play streams you have the right to watch.

![stack](https://img.shields.io/badge/HTML-CSS-JS-22d3ee) ![no build](https://img.shields.io/badge/build-none-34d399) ![PWA](https://img.shields.io/badge/PWA-installable-a78bfa) ![license](https://img.shields.io/badge/license-MIT-34d399)

---

## ✨ নতুন কী আছে (v2)

- **হোম + ওয়াচ — আলাদা দুই ভিউ** — হোমে সব চ্যানেল, ক্লিক করলে প্লেয়ার + সাইডবার
- **Favourites সবার আগে** — হোমের প্রথম সেকশনেই আপনার সেভ করা চ্যানেল
- **ক্যাটাগরি বার** — প্লেলিস্টের group অনুযায়ী চিপ, এক ক্লিকে ফিল্টার, `All` দিয়ে সব
- **একাধিক প্লেলিস্ট একসাথে** — সব চ্যানেল merge + URL দিয়ে dedupe
- **প্রতি চ্যানেলে ব্যাকআপ স্ট্রিম** — মূল লিংক ফেল করলে সেভ করা ব্যাকআপগুলো ক্রমে ট্রাই হয়; মূল লিংক ঠিক থাকলে সেটাই চলে
- **ভার্সন-ড্রিভেন অটো আপডেট** — `version.js`-এ ভার্সন বাড়ালেই ইনস্টল করা PWA নিজে cache পরিষ্কার করে hard reload করে
- **ম্যানুয়াল রিফ্রেশ** — টপবারের refresh বাটন এক ক্লিকে update check + চ্যানেল রিফ্রেশ
- **PWA** — installable, service worker cache, offline shell
- **ডার্ক / লাইট থিম**, মোবাইল রেসপন্সিভ, ফুলস্ক্রিন, PiP, কিবোর্ড শর্টকাট

---

## 🚀 GitHub Pages-এ হোস্ট করা

```bash
cd Galib_IP_Tv

git init -b main
git add .
git commit -m "Galib TV web IPTV player"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

তারপর GitHub-এ:

1. **Settings → Pages**
2. **Source:** `Deploy from a branch`
3. **Branch:** `main` / folder: `/ (root)`
4. **Save** — ১ মিনিটের মধ্যে সাইট লাইভ:
   `https://<your-username>.github.io/<repo-name>/`

> কোনো Actions, npm বা build কমান্ড লাগবে না। `.nojekyll` ফাইলটা আগে থেকেই আছে।

লোকালি চালাতে:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

(`index.html` ডাবল-ক্লিক করলেও চলবে, তবে PWA/service worker, ফাইল ও ডেমো লোড করতে ছোট একটা সার্ভার দরকার।)

---

## 🔄 অ্যাপ আপডেট করবেন যেভাবে (গুরুত্বপূর্ণ)

পুরো অ্যাপের **একটাই version source**:

**`assets/js/version.js`**

```js
window.GTV_APP_VERSION = "2.0.0";
window.GTV_BUILD_DATE = "2026-11-24";
```

HTML / CSS / JS / config / প্লেলিস্ট — যেকোনো কিছু বদলানোর পর:

1. `GTV_APP_VERSION` বাড়িয়ে দিন — যেমন `"2.0.0"` → `"2.0.1"`
2. চাইলে `GTV_BUILD_DATE`-ও বদলান
3. commit + push

এরপর যা হয়:

- অ্যাপ লোড হওয়ার ~৬ সেকেন্ড পর, প্রতি ~৩ মিনিটে এবং ট্যাবে ফিরে এলে remote `version.js` চেক করে
- নতুন ভার্সন পেলে **সব cache মুছে, service worker unregister করে** `?v=<new-version>` দিয়ে hard reload করে
- ব্যবহারকারী চাইলে টপবারের **refresh** বাটন বা **Settings → Check now** দিয়েও সাথে সাথে চেক করতে পারে
- ম্যানুয়াল চেকের সময় নতুন ভার্সন না থাকলে চ্যানেল প্লেলিস্টগুলোও রিফ্রেশ হয়

> ইনস্টল করা PWA-তে একবার reload হলে নতুন HTML/CSS/JS সব `?v=` সহ লোড হয়, তাই পুরোনো HTTP cache আটকে থাকে না।

---

## 📺 ডিফল্ট চ্যানেল বদল / আরও যোগ করা

সাইট খোলার সাথে সাথে যে প্লেলিস্টগুলো লোড হবে সেগুলো ঠিক করা আছে এখানে:

**`assets/js/config.js`**

```js
window.GTV_CONFIG = {
  defaultPlaylists: [
    {
      id: "bdix",
      name: "BDIX IPTV (Bangladesh)",
      url: "https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u",
      enabled: true,
    },

    // আরও একটা যোগ করতে চাইলে:
    {
      id: "news",
      name: "News channels",
      url: "https://iptv-org.github.io/iptv/categories/news.m3u",
      enabled: true,
    },
  ],

  ensureDefaults: true,
  autoRefreshMinutes: 20,
};
```

- `id` — স্থির আইডি; URL বদলালেও পুরোনো প্লেলিস্টের জায়গায় আপডেট হয়, ডুপ্লিকেট হয় না
- `name` — UI-তে যে নাম দেখাবে
- `url` — প্লেলিস্টের ডাইরেক্ট লিংক (`.m3u` / `.m3u8`)
- `enabled: false` — এন্ট্রি থাকবে কিন্তু লোড হবে না
- `ensureDefaults: true` — কেউ ডিলিট করলেও অ্যাপ খুললে ডিফল্ট আবার যোগ হবে
- `autoRefreshMinutes` — কত মিনিট পর পর প্লেলিস্ট auto-refresh হবে

**অ্যাডমিন কিছু যোগ করলে ব্যবহারকারীর কিছু করতে হবে না:** নতুন প্লেলিস্ট config-এ যোগ করে version বাড়ালে অ্যাপ hard reload হয়ে নতুন প্লেলিস্ট নিয়ে আসবে; একই প্লেলিস্টে নতুন চ্যানেল যোগ হলে auto/manual refresh-এ merged লিস্টে চলে আসবে।

---

## 💾 প্রতি চ্যানেলে ব্যাকআপ স্ট্রিম

1. যে চ্যানেল চালাচ্ছেন, তার নিচে **Backup** বাটনে ক্লিক করুন
2. ব্যাকআপ `.m3u8` / স্ট্রিম URL দিন → **Save only** বা **Save & play**
3. একাধিক ব্যাকআপ সেভ করা যাবে; তালিকা থেকে **Play** / **Remove** করা যাবে

নিয়ম:

- চ্যানেল খোলার সময় **সবসময় মূল (primary) লিংকই** আগে চলে
- মূল লিংক ব্যর্থ হলে (network / media error) সেভ করা ব্যাকআপগুলো **ক্রমে** ট্রাই হয়
- ব্যাকআপ চললে প্লেয়ারে **BACKUP** ব্যাজ দেখায়
- ব্যাকআপগুলো শুধু আপনার ব্রাউজারে (`localStorage`) সেভ থাকে

---

## 🌐 কেন কিছু চ্যানেল নাও চলতে পারে

ব্রাউজার সিকিউরিটির কারণে ৩টা সাধারণ সমস্যা হয়:

| সমস্যা | কারণ | সমাধান |
|---|---|---|
| প্লেলিস্ট লোড হয় না | সার্ভারে CORS হেডার নেই | অ্যাপ অটো-প্রোক্সি ট্রাই করে; Settings-এ প্রোক্সি বদলানো যায় |
| `http://` স্ট্রিম চলে না | HTTPS পেজে mixed content ব্লক | অ্যাপ প্রোক্সি দিয়ে চালানোর চেষ্টা করে |
| চ্যানেল খোলে না | BDIX/ISP-only, geo-block, dead link | VPN/ISP নেটওয়ার্ক দরকার, বা অন্য চ্যানেল |

**সবচেয়ে নির্ভরযোগ্য সমাধান — নিজের ছোট প্রোক্সি** (Cloudflare Workers ফ্রি):

```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    if (!target) return new Response("Missing ?url=", { status: 400 });

    const res = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const headers = new Headers(res.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "*");
    return new Response(res.body, { status: res.status, headers });
  },
};
```

ডিপ্লয় করে **Settings → Custom proxy prefix**-এ বসান:
`https://your-worker.workers.dev/?url=`

এতে প্লেলিস্ট + স্ট্রিম সেগমেন্ট — সব এই প্রোক্সি দিয়ে যাবে।

> HEVC / AC-3 অডিও অনেক ব্রাউজারে চলে না (Chrome/Firefox)। এমন চ্যানেলে "codec not supported" এরর আসবে — এটা প্লেয়ারের সীমাবদ্ধতা, লিংকের নয়। BDIX চ্যানেলগুলো সাধারণত ISP/BDIX নেটওয়ার্কেই কাজ করে।

---

## 📱 PWA হিসেবে ইনস্টল

- **Android / Chrome / Edge:** অ্যাড্রেস বারের install আইকন, অথবা মেনু → *Install app*
- **iPhone / iPad (Safari):** Share → *Add to Home Screen*
- ইনস্টল হলে আলাদা উইন্ডোতে খোলে, offline shell ও cache থাকে

Service worker (`sw.js`) same-origin ফাইলের জন্য **network-first**; অনলাইনে নতুন ফাইল পেলেই cache আপডেট হয়, অফলাইনে সর্বশেষ cache থেকে চলে।

---

## 🎨 লোগো ও আইকন বদলানো

বর্তমান ব্র্যান্ড অ্যাসেট:

```
assets/logo.png                 # 512×512 (social / fallback)
assets/logo.webp                # 768×768 (হোম হিরো)
assets/brand-mark.png           # টপবার / ফুটারের ছোট মার্ক
assets/icons/icon.svg           # ভেক্টর আইকন
assets/icons/icon-192.png
assets/icons/icon-512.png
assets/icons/icon-maskable-512.png
assets/icons/apple-touch-icon.png
assets/icons/favicon-192.png
assets/favicon-32.png
```

নিজের লোগো বসাতে চাইলে একই নামে ফাইলগুলো রিপ্লেস করুন (স্কয়ার, কমপক্ষে 512×512)। macOS-এ দ্রুত রিসাইজ:

```bash
sips -z 512 512 your-logo.png --out assets/icons/icon-512.png
sips -z 192 192 your-logo.png --out assets/icons/icon-192.png
sips -z 180 180 your-logo.png --out assets/icons/apple-touch-icon.png
```

> Maskable আইকনে লোগোর চারপাশে নিরাপদ মার্জিন রাখুন, নাহলে কিছু Android লঞ্চারে কোণা কাটা পড়তে পারে।

---

## 📁 ফাইল স্ট্রাকচার

```
Galib_IP_Tv/
├── index.html                 # হোম + ওয়াচ UI, মোডাল, versioned asset loader
├── sw.js                      # PWA service worker (network-first cache)
├── manifest.webmanifest       # installable PWA metadata + icons
├── assets/
│   ├── css/style.css          # সব স্টাইল (ডার্ক/লাইট, মোবাইল, fullscreen)
│   ├── logo.png / logo.webp
│   ├── brand-mark.png
│   ├── favicon-32.png
│   ├── icons/                 # PWA + Apple touch icons
│   └── js/
│       ├── version.js         # ⭐ অ্যাপ ভার্সন (আপডেট করলে এখানে বাড়ান)
│       ├── config.js          # ⭐ ডিফল্ট প্লেলিস্ট (এখানে এডিট করুন)
│       ├── m3u.js             # M3U parser + stable URL hash
│       ├── store.js           # localStorage + IndexedDB (favourites/backups/cache)
│       ├── net.js             # fetch + CORS proxy fallback
│       ├── player.js          # hls.js / mpegts.js / native engine
│       └── app.js             # হোম/ওয়াচ UI, backups, version check
├── sample/demo.m3u            # ৫টা ফ্রি পাবলিক চ্যানেল (ডেমো)
├── .nojekyll                  # GitHub Pages-এর জন্য
└── README.md
```

---

## ⌨️ কীবোর্ড শর্টকাট

| কী | কাজ |
|---|---|
| `/` | সার্চে ফোকাস |
| `F` | ফুলস্ক্রিন |
| `M` | মিউট |
| `P` | Picture-in-Picture |
| `Esc` | মোডাল / সার্চ / ওয়াচ ভিউ বন্ধ |

---

## 🧩 কোন ওপেন-সোর্স প্রজেক্টগুলো থেকে আইডিয়া/রেফারেন্স

| প্রজেক্ট | স্ট্যাক | কেন দেখবেন |
|---|---|---|
| [iptv-org/iptv](https://github.com/iptv-org/iptv) | প্লেলিস্ট কালেকশন | বিশ্বের ফ্রি/পাবলিক চ্যানেলের M3U লিস্ট |
| [bugsfreeweb/WebIPTV](https://github.com/bugsfreeweb/WebIPTV) | Vanilla JS, HLS + DASH | ফিচার-রিচ, MIT, সম্পূর্ণ ক্লায়েন্ট-সাইড |
| [moefqy/open-iptv](https://github.com/moefqy/open-iptv) | Pure HTML/CSS/JS | পরিষ্কার স্ট্যাটিক ডিজাইন, quality/country ফিল্টার |
| [bocaletto-luca/IPTV-Web-Player](https://github.com/bocaletto-luca/IPTV-Web-Player) | Vanilla JS, GPL-3.0 | ফাইল আপলোড + keyboard/gamepad কন্ট্রোল |
| [xlaevmix/lite-ott](https://github.com/xlaevmix/lite-ott) | Vanilla JS | Smart TV রিমোট + EPG + catchup |
| [chikosan/openiptv](https://github.com/chikosan/openiptv) | Next.js | EPG, Chromecast, recording-সহ বড় প্রজেক্ট |
| [noeljoan/internet-tv](https://github.com/noeljoan/internet-tv) | Flask + hls.js | সার্ভার-সাইড প্রোক্সি লাগলে |

এই ভার্সনটা ফর্ক না করে ফ্রম স্ক্র্যাচে বানানো — কারণ লক্ষ্য ছিল **zero build, এক ফাইলে কনফিগ, GitHub Pages-ready, একাধিক প্লেলিস্ট + অটো proxy fallback + PWA auto-update**।

---

## ⚖️ দাবিত্যাগ

এই সফটওয়্যারটি শুধু শিক্ষা ও ব্যক্তিগত ব্যবহারের জন্য। এটি কোনো চ্যানেল বা কপিরাইটেড কনটেন্ট হোস্ট, ডিস্ট্রিবিউট বা রি-স্ট্রিম করে না। ডিফল্ট প্লেলিস্টের লিংকগুলো পাবলিক সোর্স থেকে আসে এবং তাদের নিজস্ব মালিকের অধীন। আপনার এলাকার আইন অনুযায়ী যেসব স্ট্রিম দেখার অনুমতি আছে শুধু সেগুলোই দেখুন।

MIT License — `LICENSE` দেখুন।
