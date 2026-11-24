# Galib TV — Web IPTV Player

ব্রাউজারেই টিভি দেখার জন্য একটা ফ্রি, ওপেন-সোর্স IPTV প্লেয়ার। যেকোনো **M3U / M3U8** প্লেলিস্ট লিংক, ফাইল বা পেস্ট করা টেক্সট থেকে চ্যানেল লোড করে — কোনো সার্ভার, ডাটাবেস বা বিল্ড স্টেপ ছাড়াই। GitHub Pages-এ সরাসরি হোস্ট করা যায়।

> This app hosts **no channels**. It is only a player, like VLC. Play streams you have the right to watch.

![stack](https://img.shields.io/badge/HTML-CSS-JS-22d3ee) ![no build](https://img.shields.io/badge/build-none-34d399) ![license](https://img.shields.io/badge/license-MIT-a78bfa)

---

## ✨ ফিচার

- **M3U / M3U8 প্লেলিস্ট** — URL, ফাইল আপলোড বা সরাসরি পেস্ট
- **HLS প্লেব্যাক** — `hls.js`, সাথে MPEG-TS (`mpegts.js`) ও direct MP4 সাপোর্ট
- **একাধিক প্লেলিস্ট** — সুইচ, রিফ্রেশ, ডিলিট; চ্যানেল IndexedDB-তে ক্যাশ
- **চ্যানেল সার্চ + গ্রুপ ফিল্টার** — ১০ হাজারের বেশি চ্যানেলেও স্মুথ (incremental rendering)
- **Favourites ও Recently watched** — ব্রাউজারে সেভ থাকে
- **অটো CORS fallback** — ডাইরেক্ট ফেচ ব্যর্থ হলে পাবলিক প্রোক্সি দিয়ে চেষ্টা
- **মিক্সড-কনটেন্ট হ্যান্ডলিং** — HTTPS সাইটে `http://` স্ট্রিম হলে প্রোক্সি দিয়ে চালানোর চেষ্টা
- **ডার্ক / লাইট থিম**, মোবাইল রেসপন্সিভ, কিবোর্ড শর্টকাট (`F`, `M`, `P`, `/`)
- **কোনো ট্র্যাকিং নেই**, সব ডেটা শুধু আপনার ব্রাউজারে

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

(`index.html` ডাবল-ক্লিক করলেও চলবে, তবে ফাইল/ডেমো লোড করতে ছোট একটা সার্ভার ভালো।)

---

## 📺 ডিফল্ট চ্যানেল বদল / আরও যোগ করা

সাইট খোলার সাথে সাথে যে প্লেলিস্ট লোড হবে সেটা ঠিক করা আছে এখানে:

**`assets/js/config.js`**

```js
window.GTV_CONFIG = {
  defaultPlaylists: [
    {
      name: "BDIX IPTV (Bangladesh)",
      url: "https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u",
      enabled: true,
    },

    // আরও একটা যোগ করতে চাইলে:
    {
      name: "News channels",
      url: "https://iptv-org.github.io/iptv/categories/news.m3u",
      enabled: true,
    },
  ],

  ensureDefaults: true,
};
```

- `name` — সাইডবারে যে নাম দেখাবে
- `url` — প্লেলিস্টের ডাইরেক্ট লিংক (`.m3u` / `.m3u8`)
- `enabled: false` — এন্ট্রি থাকবে কিন্তু লোড হবে না
- `ensureDefaults: true` — কেউ ডিলিট করলেও রিফ্রেশে ডিফল্ট আবার যোগ হবে। ডিলিট永久 করতে চাইলে `false` করুন।

**প্রথম ভিজিটে** সব `enabled` প্লেলিস্ট অটো-লোড হয় এবং প্রথমটা অ্যাক্টিভ থাকে। পরে ব্যবহারকারী নিজের প্লেলিস্ট যোগ করলে সেটাই সেভ থাকে (localStorage + IndexedDB)।

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

> HEVC / AC-3 অডিও অনেক ব্রাউজারে চলে না (Chrome/Firefox)। এমন চ্যানেলে "codec not supported" এরর আসবে — এটা প্লেয়ারের সীমাবদ্ধতা, লিংকের নয়।

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

এই ভার্সনটা ফর্ক না করে ফ্রম স্ক্র্যাচে বানানো — কারণ লক্ষ্য ছিল **zero build, এক ফাইলে কনফিগ, GitHub Pages-ready, একাধিক প্লেলিস্ট + অটো proxy fallback**।

---

## 📁 ফাইল স্ট্রাকচার

```
Galib_IP_Tv/
├── index.html                 # UI
├── assets/
│   ├── css/style.css          # সব স্টাইল
│   ├── favicon.svg
│   └── js/
│       ├── config.js          # ⭐ ডিফল্ট প্লেলিস্ট (এখানে এডিট করুন)
│       ├── m3u.js             # M3U parser
│       ├── store.js           # localStorage + IndexedDB
│       ├── net.js             # fetch + CORS proxy fallback
│       ├── player.js          # hls.js / mpegts.js engine
│       └── app.js             # UI logic
├── sample/demo.m3u            # ৫টা ফ্রি পাবলিক চ্যানেল (ডেমো)
├── manifest.webmanifest
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
| `Esc` | মোডাল / সার্চ বন্ধ |

---

## ⚖️ দাবিত্যাগ

এই সফটওয়্যারটি শুধু শিক্ষা ও ব্যক্তিগত ব্যবহারের জন্য। এটি কোনো চ্যানেল বা কপিরাইটেড কনটেন্ট হোস্ট, ডিস্ট্রিবিউট বা রি-স্ট্রিম করে না। ডিফল্ট প্লেলিস্টের লিংকগুলো পাবলিক সোর্স থেকে আসে এবং তাদের নিজস্ব মালিকের অধীন। আপনার এলাকার আইন অনুযায়ী যেসব স্ট্রিম দেখার অনুমতি আছে শুধু সেগুলোই দেখুন।

MIT License — `LICENSE` দেখুন।
