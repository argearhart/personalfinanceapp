import React from 'react';
import { Search, Filter, Download, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

interface RegisterProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: () => void;
  onImportCSV: () => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

export default function Register({ 
  transactions, 
  categories, 
  onAddTransaction, 
  onImportCSV,
  onDeleteTransaction,
  onUpdateTransaction 
 }: RegisterProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTransactions = transactions.filter(t => 
    t.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.memo?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportToCSV = () => {
    const headers = ['Date', 'Payee', 'Category', 'Type', 'Amount', 'Reconciled', 'Memo'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.payee,
      categories.find(c => c.id === t.categoryId)?.name || '',
      t.type,
      t.amount,
      t.isReconciled ? 'Yes' : 'No',
      t.memo || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl caps mb-2">Register / Transaction Log</h2>
          <p className="text-sm text-editorial-muted italic font-serif">Comprehensive financial history in descending chronological order.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onImportCSV}
            className="btn-editorial"
          >
            Import CSV
          </button>
          <button 
            onClick={exportToCSV}
            className="btn-editorial"
          >
            Export Archive
          </button>
          <button 
            onClick={onAddTransaction}
            className="btn-editorial-primary"
          >
            + New Entry
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted group-hover:text-editorial-ink transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search activity..." 
            className="w-full bg-white border-fine rounded-none pl-10 pr-4 py-2 text-xs font-serif italic focus:outline-none focus:border-editorial-ink transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="caps text-[9px]">View Filters:</span>
          <button className="btn-editorial !py-1 !px-2 border-dashed">
            All Sources
          </button>
        </div>
      </div>

      <div className="bg-white border-fine overflow-hidden">
        <div className="grid grid-cols-12 caps bg-neutral-100 p-3 border-b border-neutral-300 text-[9px]">
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Description / Payee</div>
          <div className="col-span-2 text-right">Category</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-center">Status</div>
        </div>
        
        <div className="divide-y divide-editorial-border">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-editorial-muted italic font-serif">
              No entries found in this journal index.
            </div>
          ) : (
            filteredTransactions.map((t, idx) => {
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className={cn(
                  "grid grid-cols-12 p-3 text-sm items-center transition-colors group",
                  idx % 2 === 1 ? "bg-editorial-zebra" : "bg-white",
                  "hover:bg-editorial-ink/5"
                )}>
                  <div className="col-span-2 text-xs font-medium uppercase">{format(new Date(t.date), 'MMM dd')}</div>
                  <div className="col-span-4 overflow-hidden">
                    <p className="font-semibold truncate">{t.payee}</p>
                    {t.memo && <p className="text-[10px] text-editorial-muted italic font-serif truncate mt-0.5">{t.memo}</p>}
                  </div>
                  <div className="col-span-2 text-right text-[10px] text-editorial-muted caps truncate">{cat?.name || 'Uncategorized'}</div>
                  <div className={cn(
                    "col-span-2 text-right font-medium",
                    t.type === 'income' ? "text-editorial-accent-green" : "text-editorial-accent-red"
                  )}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      t.isReconciled ? "bg-editorial-accent-green" : "border border-neutral-400"
                    )} />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTransaction(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-editorial-accent-red hover:bg-editorial-accent-red/10 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
