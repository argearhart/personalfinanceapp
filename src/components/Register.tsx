import React from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

interface RegisterProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onImportCSV: () => void;
  onDeleteTransaction: (id: string) => void;
}

export default function Register({ 
  transactions, 
  categories, 
  onAddTransaction,
  onEditTransaction,
  onImportCSV,
  onDeleteTransaction,
 }: RegisterProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const filteredTransactions = React.useMemo(() => {
    const query = searchTerm.toLowerCase();
    return transactions
      .filter((transaction) =>
        transaction.payee.toLowerCase().includes(query) ||
        transaction.memo?.toLowerCase().includes(query)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, transactions]);

  const escapeCsvCell = (value: unknown) => {
    const raw = String(value ?? '');
    const protectedValue = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${protectedValue.replace(/"/g, '""')}"`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Payee', 'Category', 'Type', 'Amount', 'Reconciled', 'Memo'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.payee,
      categoryById.get(t.categoryId)?.name || '',
      t.type,
      t.amount,
      t.isReconciled ? 'Yes' : 'No',
      t.memo || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.map(escapeCsvCell).join(",") + "\n"
      + rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
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
          <span className="caps">View Filters:</span>
          <button className="btn-editorial !py-1 !px-2 border-dashed">
            All Sources
          </button>
        </div>
      </div>

      <div className="min-w-0 bg-white border-fine overflow-hidden">
        <div className="hidden md:block max-h-[min(42rem,calc(100dvh-12rem))] overflow-y-auto overflow-x-hidden">
          <table className="w-full min-w-0 table-fixed border-collapse">
            <colgroup>
              <col className="w-[5.5rem]" />
              <col />
              <col className="w-[6.5rem] sm:w-[7.5rem]" />
              <col className="w-[6.5rem] sm:w-[7rem]" />
              <col className="w-28" />
            </colgroup>
            <thead className="caps bg-neutral-100 border-b border-neutral-300 text-sm">
              <tr>
                <th scope="col" className="px-2 py-2.5 text-left">Date</th>
                <th scope="col" className="px-2 py-2.5 text-left">Description / Payee</th>
                <th scope="col" className="px-2 py-2.5 text-right">Category</th>
                <th scope="col" className="px-2 py-2.5 text-right">Amount</th>
                <th scope="col" className="px-2 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-editorial-muted italic font-serif">
                    No entries found in this journal index.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, idx) => {
                  const category = categoryById.get(transaction.categoryId);
                  return (
                    <tr
                      key={transaction.id}
                      className={cn(
                        "transition-colors group",
                        idx % 2 === 1 ? "bg-editorial-zebra" : "bg-white",
                        "hover:bg-editorial-ink/5"
                      )}
                    >
                      <td className="px-2 py-2.5 align-top text-xs font-medium uppercase text-editorial-ink">
                        {format(new Date(transaction.date), 'MMM dd')}
                      </td>
                      <td className="min-w-0 max-w-0 px-2 py-2.5 align-top">
                        <p className="font-semibold leading-snug break-words" title={transaction.payee}>{transaction.payee}</p>
                        {transaction.memo && (
                          <p className="mt-0.5 text-sm leading-snug text-editorial-muted italic font-serif break-words">{transaction.memo}</p>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-right text-sm text-editorial-muted caps align-top break-words">
                        {category?.name || 'Uncategorized'}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-2.5 text-right text-sm font-medium tabular-nums align-top whitespace-nowrap",
                          transaction.type === 'income' ? "text-editorial-accent-green" : "text-editorial-accent-red"
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-1 py-2 align-top">
                        <div className="flex items-start justify-center gap-1 sm:gap-1.5">
                          <span
                            aria-label={transaction.isReconciled ? 'Reconciled transaction' : 'Unreconciled transaction'}
                            className={cn(
                              "mt-0.5 h-3 w-3 shrink-0 rounded-full",
                              transaction.isReconciled ? "bg-editorial-accent-green" : "border border-neutral-400"
                            )}
                          />
                          <button
                            type="button"
                            aria-label={`Edit transaction for ${transaction.payee}`}
                            onClick={() => onEditTransaction(transaction)}
                            className="shrink-0 p-1 text-editorial-ink hover:bg-editorial-ink/10 transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete transaction for ${transaction.payee}`}
                            onClick={() => onDeleteTransaction(transaction.id)}
                            className="shrink-0 p-1 text-editorial-accent-red hover:bg-editorial-accent-red/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-editorial-border">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-editorial-muted italic font-serif">
              No entries found in this journal index.
            </div>
          ) : (
            filteredTransactions.map((transaction, idx) => {
              const category = categoryById.get(transaction.categoryId);
              return (
                <article key={transaction.id} className={cn("p-4 space-y-2", idx % 2 === 1 ? "bg-editorial-zebra" : "bg-white")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{transaction.payee}</p>
                      <p className="text-sm text-editorial-muted uppercase">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label={`Edit transaction for ${transaction.payee}`}
                        onClick={() => onEditTransaction(transaction)}
                        className="p-1 text-editorial-ink hover:bg-editorial-ink/10 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete transaction for ${transaction.payee}`}
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="p-1 text-editorial-accent-red hover:bg-editorial-accent-red/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {transaction.memo && <p className="text-sm italic font-serif text-editorial-muted">{transaction.memo}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <span className="caps text-editorial-muted">{category?.name || 'Uncategorized'}</span>
                    <span className={cn("font-medium", transaction.type === 'income' ? "text-editorial-accent-green" : "text-editorial-accent-red")}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
