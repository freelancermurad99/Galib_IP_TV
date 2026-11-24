# Galib IPTV

A lightweight static web IPTV player built with vanilla HTML, CSS, and JavaScript. Runs directly on GitHub Pages with no backend or build step, and works as an installable PWA on mobile and desktop.

## Features

- Loads M3U / M3U8 playlists automatically from `assets/js/config.js` on first visit
- Organizes channels into horizontal category rows with a full-page **Show all** view per category
- Dedicated **Featured Channels**, **Favourites**, and **Recently Watched** rails
- Automatic backup server fallback per channel — supports both M3U8 streams and YouTube Live links (`@handle/live`, `/channel/UC.../live`, or video URLs)
- Built-in HLS (`hls.js`), MPEG-TS (`mpegts.js`), and YouTube IFrame player support
- Mobile-first layout with bottom navigation, sticky player, fullscreen, PiP, and one-tap Portrait/Landscape rotate
- Version-based PWA cache busting so installed apps pick up updates automatically

## Configuration

All lineup and channel settings live in `assets/js/config.js`:

- **`defaultPlaylists`** — Default M3U / M3U8 sources loaded for all visitors. Removing or disabling an entry syncs to existing browsers when `syncRemovedDefaults` is enabled.
- **`featuredChannels`** — Channels pinned to the top Featured rail on the home page.
- **`channelBackups`** — Ordered backup streams (M3U8 or YouTube Live handles/URLs) tried automatically if a channel's primary stream fails.
- **`categoryOrder`** — Controls which categories appear first on the home screen.

## Deploying updates

Whenever you change `config.js` or any UI/script file:

1. Bump `GTV_APP_VERSION` in `assets/js/version.js` (for example, `3.3.1` -> `3.3.2`).
2. Commit and push to `main`.

Installed PWAs check `version.js` in the background (or when the user taps the refresh button), clear old caches, and reload with the updated files and playlist.

## Running locally

```bash
python3 -m http.server 8080
```

Then open `localhost:8080` in your browser.

## Project structure

```text
├── index.html
├── manifest.webmanifest
├── sw.js
└── assets/
    ├── css/style.css
    ├── icons/
    └── js/
        ├── config.js     # Playlists, featured channels, backups, category order
        ├── version.js    # App version for PWA auto-reload
        ├── player.js     # HLS, MPEG-TS, and YouTube Live player engine
        ├── m3u.js        # M3U playlist parser
        ├── net.js        # Playlist fetcher with CORS proxy fallback
        ├── store.js      # LocalStorage + IndexedDB channel cache
        └── app.js        # UI and state management
```

## Notes

- This project does not host any video streams. All channels play directly from their source URLs.
- BDIX or HTTP-only streams may require a compatible local network or proxy when served over HTTPS.

## License

MIT — see [LICENSE](LICENSE).
