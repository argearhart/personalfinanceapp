# Ledger & Balance

**Ledger & Balance** is a sophisticated personal finance application designed with an "Editorial Aesthetic." It combines the functional utility of a traditional checkbook register with modern data visualization and intuitive management tools.

## 🖋️ Design Philosophy
This application follows a high-contrast, minimalist design inspired by classic financial publications. It emphasizes typography (Serif/Sans-serif pairings), fine borders, and an off-white/ink color palette to provide a focused, distraction-free environment for financial tracking.

## ✨ Key Features

### 1. Checkbook Register
- **Streamlined Entry**: Record expenses and income with simple, natural language forms.
- **Persistent Data**: All records are saved locally to your device's storage.
- **Categorization**: Organize your spending with customizable classification tags.

### 2. Fiscal Reporting & Analytics
- **Multi-Period Views**: Toggle between monthly and annual reports.
- **Comparison Engine**: Compare current spending against previous periods (variance analysis).
- **Payee Leaderboards**: Track your top 10 counterparties to see where your money flows.
- **Annual Trends**: Visualize disbursement trends across the entire fiscal year.

### 3. Management Utilities
- **CSV Import Utility**: Easily migrate data from bank statements with an intelligent column mapper and record previewer.
- **Reconciliation Interface**: Mark transactions as cleared to keep your digital register in sync with your bank statement.
- **Starting Balance Editor**: Adjust your initial account balance at any time to maintain accuracy.
- **Flexible Budgeting**: Set spending targets by category to keep your finances on track (optional).

### 4. Desktop Integration (PWA)
- **Installable**: Can be installed as a standalone desktop application via standard web browsers (Chrome/Edge).
- **Custom Icon**: Uses `public/icon.ico` for the browser tab + PWA install metadata (see `public/manifest.webmanifest`).
- **Standalone Window**: Runs in a dedicated app window without browser distractions.

## 🚀 Getting Started

### Local Development
If you are running this locally from the source code:
1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`

### Quality checks (maintainers)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

CI runs the same core checks in GitHub Actions (see `.github/workflows/ci.yml`). Desktop packaging is intentionally **not** part of CI (it is slower and Windows-specific).

### Distribution options

#### A) Hosted web app + Chrome/Edge install (PWA)

Best when users can open an `https://` URL and you want the simplest update story.

1. Build static assets: `npm run build`
2. Deploy the `dist/` output to your static host
3. Users install from Chrome/Edge using the browser install prompt

End-user instructions: `docs/USER-INSTALL-GUIDE.md`  
Release checklist: `docs/PUBLISHER-CHECKLIST.md`

#### B) Offline Windows desktop installer (Electron)

Best when you want a local-only install experience without asking users to use a public URL day-to-day.

1. Build installer: `npm run desktop:dist`
2. Grab the installer from `release/`
3. Install on the target PC

Details + troubleshooting: `docs/OFFLINE-WINDOWS-DESKTOP.md`

Optional unpacked output for debugging:

```bash
npm run desktop:pack
```

### App icons (important)

This project intentionally keeps **two** icon copies:

- `build/icon.ico`: Windows/Electron packaging (`package.json` → `build.win.icon`)
- `public/icon.ico`: browser tab + PWA manifest (`index.html`, `public/manifest.webmanifest`)

If you change the artwork, update **both** files so web + desktop builds stay consistent.

## 🛠️ Technical Stack
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (with custom editorial themes)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Animations**: motion (framer-motion)
- **Desktop packaging (optional)**: Electron + electron-builder (Windows NSIS installer)

---
*Created with Google AI Studio — Focused on simple, elegant personal finance.*
