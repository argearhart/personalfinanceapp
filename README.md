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
- **Custom Icon**: Features a unique, editorial-style app icon for your desktop launcher.
- **Standalone Window**: Runs in a dedicated app window without browser distractions.

## 🚀 Getting Started

### Local Development
If you are running this locally from the source code:
1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`

### Desktop Installation
1. Open the hosted application in Chrome or Edge.
2. Click the **"Install"** icon in the address bar.
3. The app will now appear on your **Desktop** and in your **Applications** menu.

## 🛠️ Technical Stack
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (with custom editorial themes)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Animations**: motion (framer-motion)

---
*Created with Google AI Studio — Focused on simple, elegant personal finance.*
