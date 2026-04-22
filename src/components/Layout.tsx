import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  RefreshCcw, 
  BarChart3, 
  Settings, 
  Target,
  Edit2,
  Download,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
  balance: number;
  startingBalance: number;
  startingBalanceAsOf: string;
  onUpdateStartingBalance: (amount: number) => void;
  onUpdateStartingBalanceAsOf: (ymd: string) => void;
  onImportData: (state: unknown) => void;
  fullState: unknown;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  balance,
  startingBalance,
  startingBalanceAsOf,
  onUpdateStartingBalance,
  onUpdateStartingBalanceAsOf,
  onImportData,
  fullState,
}: LayoutProps) {
  const [isEditingOpening, setIsEditingOpening] = React.useState(false);
  const [editOpeningValue, setEditOpeningValue] = React.useState((startingBalance ?? 0).toString());
  const [editAsOfValue, setEditAsOfValue] = React.useState(startingBalanceAsOf);

  const handleExport = () => {
    const dataStr = JSON.stringify(fullState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportData(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid backup file format.';
        alert(message);
      }
    };
    reader.readAsText(file);
  };

  React.useEffect(() => {
    setEditOpeningValue((startingBalance ?? 0).toString());
    setEditAsOfValue(startingBalanceAsOf);
  }, [startingBalance, startingBalanceAsOf]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register', icon: Wallet },
    { id: 'reconcile', label: 'Reconcile', icon: RefreshCcw },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'categories', label: 'Categories', icon: Settings },
  ];

  const commitOpening = () => {
    onUpdateStartingBalance(parseFloat(editOpeningValue) || 0);
    if (editAsOfValue && /^\d{4}-\d{2}-\d{2}$/.test(editAsOfValue)) {
      onUpdateStartingBalanceAsOf(editAsOfValue);
    } else {
      onUpdateStartingBalanceAsOf('');
    }
    setIsEditingOpening(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-editorial-bg p-2 sm:p-3 md:p-4">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row justify-between items-baseline border-b border-black pb-3 mb-4 shrink-0">
        <div className="flex flex-col">
          <span className="caps mb-1 italic">Personal Finance Checkbook</span>
          <h1 className="text-4xl md:text-5xl font-serif">Ledger & Balance</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 mt-4 md:mt-0 sm:items-end sm:text-right">
          <div className="min-w-0 w-full sm:w-auto">
            <p className="caps mb-1">Current balance</p>
            <p className="text-2xl md:text-3xl font-light tabular-nums">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-2xs text-editorial-muted font-serif mt-1 max-w-[20rem] sm:ml-auto">
              This includes the opening balance and every line in the register. Edit opening balance below if reconciliation does not match the bank.
            </p>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:max-w-[20rem] border-t sm:border-t-0 border-editorial-border pt-3 sm:pt-0 sm:border-l sm:pl-8 sm:text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="caps">Opening balance</span>
              <button
                type="button"
                onClick={() => {
                  setEditOpeningValue((startingBalance ?? 0).toString());
                  setEditAsOfValue(startingBalanceAsOf);
                  setIsEditingOpening(true);
                }}
                className="text-editorial-muted hover:text-editorial-ink transition-colors"
                title="Edit opening balance and as-of date"
              >
                <Edit2 size={10} />
              </button>
            </div>
            {isEditingOpening ? (
              <div className="flex flex-col sm:items-end gap-2 w-full">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <label className="sr-only" htmlFor="opening-amount">Opening amount</label>
                  <input
                    id="opening-amount"
                    type="number"
                    autoFocus
                    className="w-32 bg-white border-fine p-1.5 text-right text-sm focus:outline-none focus:border-editorial-ink"
                    value={editOpeningValue}
                    onChange={(e) => setEditOpeningValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitOpening()}
                  />
                  <label className="text-2xs caps text-editorial-muted" htmlFor="opening-asof">As of</label>
                  <input
                    id="opening-asof"
                    type="date"
                    className="bg-white border-fine p-1.5 text-xs focus:outline-none focus:border-editorial-ink"
                    value={editAsOfValue || ''}
                    onChange={(e) => setEditAsOfValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitOpening()}
                  />
                  <button
                    type="button"
                    className="text-xs caps underline underline-offset-2"
                    onClick={commitOpening}
                  >
                    Save
                  </button>
                </div>
                <p className="text-2xs text-editorial-muted font-serif sm:text-right">
                  Use the end-of-day balance for this date, before the first register row you are tracking. Leave &quot;As of&quot; empty if you prefer; reconciliation still uses the amount.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-light tabular-nums">
                  ${(startingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {startingBalanceAsOf ? (
                  <p className="text-xs text-editorial-muted font-serif mt-0.5">
                    As of {format(new Date(`${startingBalanceAsOf}T12:00:00`), 'MMMM d, yyyy')}
                  </p>
                ) : (
                  <p className="text-2xs text-editorial-muted font-serif mt-0.5">Set as-of date when editing to remember which statement it came from.</p>
                )}
              </div>
            )}
          </div>
          <div className="hidden md:block text-right">
            <span className="caps block mb-1">Checkbook Status</span>
            <span className="text-3xl font-light text-editorial-accent-green underline underline-offset-4 decoration-1">
              Active
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4 md:gap-5">
        {/* Navigation Sidebar (Checkbook Index Style) */}
        <aside className="hidden lg:flex flex-col w-40 shrink-0 border-r border-editorial-border pr-4">
          <span className="caps mb-4 opacity-50">Checkbook Index</span>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 text-sm transition-all group py-1",
                  activeTab === item.id 
                    ? "font-bold text-editorial-ink underline underline-offset-4" 
                    : "text-editorial-muted hover:text-editorial-ink hover:underline"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Nav Trigger Button is handled by specific layout, but we keep it minimal */}
          <div className="mt-8 space-y-3">
            <button 
              onClick={handleExport}
              className="w-full flex items-center gap-2 text-xs caps text-editorial-muted hover:text-editorial-ink transition-colors"
            >
              <Download size={12} />
              Export Database
            </button>
            <label className="w-full flex items-center gap-2 text-xs caps text-editorial-muted hover:text-editorial-ink transition-colors cursor-pointer">
              <Upload size={12} />
              Import Backup
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
          </div>

          <div className="mt-auto pt-8 border-t border-editorial-border">
            <span className="block uppercase tracking-widest text-2xs font-bold text-editorial-muted">Database: IndexedDB</span>
            <span className="text-2xs text-editorial-muted block mt-1">v.1.1.0 - AI Studio</span>
          </div>
        </aside>

        {/* Navigation for small screens */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border-fine shadow-xl rounded-full px-6 py-3 z-50 flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "p-2 rounded-full",
                activeTab === item.id ? "bg-editorial-ink text-white" : "text-editorial-muted"
              )}
            >
              <item.icon size={18} />
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          <div className="w-full max-w-full pb-20 sm:pb-6 lg:pb-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

