# Fortress — website + app (Instagram-style)

**Quick share file for friends:** see [`SETUP-FRIENDS.txt`](../SETUP-FRIENDS.txt)  
**One-click builds on this PC:** double-click [`Build-Fortress-Apps.bat`](../Build-Fortress-Apps.bat)  
**Install page on the live site:** [fortress-zw.vercel.app/install.html](https://fortress-zw.vercel.app/install.html)

Fortress runs as:

1. **Live website** — open [fortress-zw.vercel.app](https://fortress-zw.vercel.app) (or your custom `fortress-zw` domain)
2. **Installable PWA** — Add to Home Screen from that site
3. **Native apps** — Electron (PC), Capacitor Android / iOS

**Uploads are the same everywhere** while online: website, PWA, and native apps all read/write `/api/live/*` on the fortress-zw host.

| Action | Needs data? |
| --- | --- |
| Open saved local projects / cached photos | No |
| See live uploads from other users | Yes |
| Post a new photo / drawing / chat AI | Yes |

---

## Deploy the live website (fortress-zw)

```bash
npm install
# Put GEMINI_API_KEY in Vercel project env (Production)
npm run deploy:web
```

Or connect the GitHub repo to Vercel:

- Framework: Vite  
- Build: `npm run build` (or `npm run build:web`)  
- Output: `dist`  
- Project / domain name: **fortress-zw**  
- Optional custom domain: `fortress-zw.com` / `fortress-zw.co.zw`

`vercel.json` already rewrites the SPA and exposes:

- `GET /api/health`
- `GET /api/live/feed`
- `POST /api/live/publish`
- `POST /api/fab-brain`
- `POST /api/vision-extract`

After deploy, open `https://fortress-zw.vercel.app` — that is the live Instagram-style site.

---

## Native apps (same feed as the website)

```bash
# Builds UI + points API at fortress-zw so live uploads match the website
npm run build:native
npx cap sync
npm run android:apk   # or npm run cap:ios on a Mac
npm run electron:build
```

Default API origin: `https://fortress-zw.vercel.app`  
Override with `VITE_API_BASE` / `VITE_FORTRESS_ORIGIN` if you use a custom domain.

---

## Share

| Platform | What to share |
| --- | --- |
| Anyone | Link `https://fortress-zw.vercel.app` (WhatsApp, SMS, etc.) |
| Android | APK **or** the website link (Add to Home Screen) |
| iOS | TestFlight / App Store **or** the website link (Add to Home Screen) |
| Windows | `Fortress-Setup-…exe` / Portable **or** the website link |

---

## Local dev

```bash
npm run dev
```

Web on `:5173`, API on `:8787` (Vite proxies `/api`). Live feed file: `server/data/live-feed.json`.
