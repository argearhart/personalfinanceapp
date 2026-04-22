# Offline Windows Desktop Distribution (Local-Only)

This project is a Vite/React web app. For a non-technical user, the simplest offline install is a **Windows desktop shell** that serves the built `dist/` folder locally.

This repo includes an **Electron** wrapper that:

- starts a tiny local static server on `127.0.0.1`
- opens the app in an **app-style window** (Chromium-based)

Notes:

- This is **not Google Chrome** itself, but it is the same rendering engine family and provides the “clean installed app” UX you asked for.
- Data remains **local** (browser storage model inside the desktop shell).

Windows icon file:

- Place the `.ico` at `build/icon.ico` (this repo is already wired to that path in `package.json` under `build.win.icon`).

Web / Chrome install (PWA) icon:

- The same icon is also copied to `public/icon.ico` and referenced from `index.html` + `public/manifest.webmanifest` for browser installs.

If you update the artwork later, keep **both** files in sync:

- `build/icon.ico` (desktop installer)
- `public/icon.ico` (web/PWA)

## Build the installer (you run this on your machine)

From the repo root:

```bash
npm install
npm run desktop:dist
```

Output:

- `release/` contains the Windows installer (NSIS) and related artifacts.

Installer naming:

- The generated installer name includes the `version` field from `package.json` (example: `Ledger & Balance Setup 0.0.0.exe`).
- Bump `package.json` `version` before building if you want semver-style filenames for each release.

Windows install folder naming:

- The default install directory is commonly derived from the npm package `name` in `package.json` (this repo uses `ledger-balance`).
- This is separate from the human-friendly app title (**Ledger & Balance**), which comes from `build.productName`.

Auto-update metadata filename (if you ever enable updates):

- `electron-builder` also emits a slug-style artifact name like `ledger-balance-setup-0.0.0.exe` in `release/latest.yml`.

Unpacked output (optional, useful for quick smoke tests):

```bash
npm run desktop:pack
```

## Build troubleshooting (Windows)

If packaging fails while extracting `winCodeSign` with errors like **"Cannot create symbolic link"**, that is a Windows permission issue during tooling extraction.

Practical fixes (pick one):

- Enable **Windows Developer Mode** (recommended for dev machines), then retry the build.
- Run your terminal **as Administrator** for the packaging step.
- Or follow the manual cache workaround described in electron-builder issue `#8149` (extract `winCodeSign` into the electron-builder cache folder).

This repo disables `signAndEditExecutable` to reduce reliance on signing/rcedit tooling, but Electron Builder may still run other Windows packaging steps depending on versions.

## Install on the other person's PC (you do this once)

1. Copy the installer from `release/` to their computer (USB drive is fine).
2. Run the installer.
3. Launch **Ledger & Balance** from Start Menu/Desktop.

No internet is required for daily use.

## Updating manually (offline-friendly)

1. On your machine: `npm run desktop:dist`
2. Copy the new installer to their machine
3. Re-run installer (or uninstall/reinstall if you prefer a clean slate)

## If you truly must use Google Chrome specifically

Chrome can be launched in app mode against a local URL, but you still need **something** to serve `dist/` (a small local server). The Electron wrapper avoids that split for the end user.
