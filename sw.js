/* =========================================================
   Galib TV — Service Worker (v3)
   Network-first shell cache so admin updates and version.js
   changes are always picked up immediately when online.
   ========================================================= */

const CACHE = "galibtv-shell-v3";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/style.css",
  "assets/favicon-32.png",
  "assets/logo.webp",
  "assets/icons/icon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable.svg",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/favicon-192.png",
  "assets/icons/apple-touch-icon.png",
  "assets/js/m3u.js",
  "assets/js/store.js",
  "assets/js/net.js",
  "assets/js/player.js",
  "assets/js/version.js",
  "assets/js/config.js",
  "assets/js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        ASSETS.map(async (path) => {
          try {
            await cache.add(new URL(path, self.registration.scope).href);
          } catch {
            /* Ignore missing optional assets. */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Always fetch version.js directly from network without caching */
  if (url.pathname.endsWith("/version.js") || url.pathname.endsWith("version.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  event.respondWith(networkFirst(request, url));
});

async function networkFirst(request, url) {
  const cache = await caches.open(CACHE);
  /* Normalize cache key by stripping ?v=...&t=... cache-busting params */
  const cleanUrl = url.origin + url.pathname;

  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok && response.type === "basic") {
      try {
        await cache.put(cleanUrl, response.clone());
      } catch {}
    }
    return response;
  } catch (err) {
    const cached = (await cache.match(cleanUrl)) || (await cache.match(request));
    if (cached) return cached;

    if (request.mode === "navigate") {
      const shell =
        (await cache.match(new URL("index.html", self.registration.scope).href)) ||
        (await cache.match(new URL("./", self.registration.scope).href));
      if (shell) return shell;
    }

    throw err;
  }
}
