# Ledger & Balance: Publisher Checklist

Use this checklist for each release so installs stay simple for end users.

## 1) Pre-Release Quality Gate

- [ ] Pull latest `main`
- [ ] Install deps: `npm install`
- [ ] Run checks:
  - [ ] `npm run lint`
  - [ ] `npm run typecheck`
  - [ ] `npm run test`
  - [ ] `npm run build`
- [ ] Confirm CI is green for the release commit (GitHub Actions: `.github/workflows/ci.yml`)
- [ ] If you ship the **Windows desktop installer**, also run:
  - [ ] `npm run desktop:pack` (quick sanity) or `npm run desktop:dist` (full installer)
- [ ] Sanity test key flows:
  - [ ] Add/edit/delete transaction
  - [ ] CSV import
  - [ ] Export + Import backup JSON
  - [ ] Reconciliation
  - [ ] Reports and Budget screens

## 2) Version + Release Notes

- [ ] Decide release version (e.g., `v1.2.0`)
- [ ] Bump `package.json` `version` (this affects the Windows installer filename produced by `electron-builder`)
- [ ] Draft short release notes:
  - [ ] What's new
  - [ ] Fixes
  - [ ] Any migration/behavior changes

## 3) Ship Path A — Hosted web app (Chrome / Edge PWA)

- [ ] Push branch to GitHub
- [ ] Merge to production branch (`main`/`master`)
- [ ] Verify deployment settings:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] Wait for successful deploy

## 4) Ship Path B — Offline Windows desktop installer (Electron)

- [ ] Confirm icons are consistent:
  - [ ] `build/icon.ico` (Electron / installer)
  - [ ] `public/icon.ico` (browser tab + PWA manifest)
  - [ ] If you updated artwork, **copy the same `.ico` to both locations**
- [ ] Build installer: `npm run desktop:dist`
- [ ] Confirm output exists under `release/` (installer + `win-unpacked/`)

## 5) Post-Deploy / Post-Build Verification

### Path A (hosted)

- [ ] Open production URL in Chrome and Edge
- [ ] Confirm app loads with no console errors
- [ ] Confirm install prompt/icon appears
- [ ] Install app once on test machine and launch it
- [ ] Verify local data persists after app restart

### Path B (Windows installer)

- [ ] Install on a clean Windows test VM (or spare machine)
- [ ] Launch **Ledger & Balance**
- [ ] Verify local data persists after app restart
- [ ] Confirm **offline** usage works (disconnect network and relaunch)

## 6) PWA/Desktop Install Readiness (Path A only)

- [ ] URL is HTTPS
- [ ] `manifest` and icons load correctly (`public/manifest.webmanifest`, `public/icon.ico`)
- [ ] App opens in standalone window after install

## 7) User Communication

- [ ] Share install URL
- [ ] Share `docs/USER-INSTALL-GUIDE.md`
- [ ] If using Path B, share the installer from `release/` instead of a URL
- [ ] Include backup reminder:
  - "Data is local to each device; export backups regularly."

## 8) Rollback Plan

- [ ] Keep previous known-good deployment available
- [ ] If issue found:
  - [ ] Re-deploy previous stable commit
  - [ ] Notify users with ETA for fix

## 9) Optional Nice-to-Haves

- [ ] Custom domain (e.g., `app.yourdomain.com`)
- [ ] Error monitoring (Sentry or equivalent)
- [ ] Analytics for install usage
- [ ] Monthly restore test using exported backup file
