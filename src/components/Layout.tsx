import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  RefreshCcw, 
  BarChart3, 
  Settings, 
  ChevronRight,
  PlusCircle,
  Menu,
  X,
  Target,
  Edit2,
  Download,
  Upload
} from 'lucide-react';
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
  onUpdateStartingBalance: (amount: number) => void;
  onImportData: (state: any) => void;
  fullState: any;
}

export default function Layout({ children, activeTab, setActiveTab, balance, startingBalance, onUpdateStartingBalance, onImportData, fullState }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isEditingBalance, setIsEditingBalance] = React.useState(false);
  const [editBalanceValue, setEditBalanceValue] = React.useState((startingBalance ?? 0).toString());

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
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  React.useEffect(() => {
    setEditBalanceValue((startingBalance ?? 0).toString());
  }, [startingBalance]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register', icon: Wallet },
    { id: 'reconcile', label: 'Reconcile', icon: RefreshCcw },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'categories', label: 'Categories', icon: Settings },
  ];

  const handleUpdateBalance = () => {
    onUpdateStartingBalance(parseFloat(editBalanceValue) || 0);
    setIsEditingBalance(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-editorial-bg p-4 md:p-8">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row justify-between items-baseline border-b border-black pb-4 mb-8">
        <div className="flex flex-col">
          <span className="caps mb-1 italic">Personal Finance Checkbook</span>
          <h1 className="text-4xl md:text-5xl font-serif">Ledger & Balance</h1>
        </div>
        
        <div className="flex gap-8 md:gap-12 mt-4 md:mt-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="caps">Current Balance</span>
              <button 
                onClick={() => setIsEditingBalance(true)}
                className="text-editorial-muted hover:text-editorial-ink transition-colors"
                title="Adjust Starting Balance"
              >
                <Edit2 size={10} />
              </button>
            </div>
            {isEditingBalance ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  autoFocus
                  className="w-24 bg-white border-fine p-1 text-right text-sm focus:outline-none focus:border-editorial-ink"
                  value={editBalanceValue}
                  onChange={(e) => setEditBalanceValue(e.target.value)}
                  onBlur={handleUpdateBalance}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateBalance()}
                />
              </div>
            ) : (
              <span className="text-2xl md:text-3xl font-light">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
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

      <div className="flex flex-1 overflow-hidden gap-8">
        {/* Navigation Sidebar (Checkbook Index Style) */}
        <aside className="hidden lg:flex flex-col w-48 border-r border-editorial-border pr-8">
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
              className="w-full flex items-center gap-2 text-[10px] caps text-editorial-muted hover:text-editorial-ink transition-colors"
            >
              <Download size={12} />
              Export Database
            </button>
            <label className="w-full flex items-center gap-2 text-[10px] caps text-editorial-muted hover:text-editorial-ink transition-colors cursor-pointer">
              <Upload size={12} />
              Import Backup
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
          </div>

          <div className="mt-auto pt-8 border-t border-editorial-border">
            <span className="caps text-[9px] block">Database: IndexedDB</span>
            <span className="text-[9px] text-editorial-muted block mt-1">v.1.1.0 - AI Studio</span>
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
        <main className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="max-w-5xl mx-auto pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

