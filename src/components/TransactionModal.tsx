import React from 'react';
import { X } from 'lucide-react';
import { Category, NewTransactionInput, TransactionType } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TransactionModalProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: NewTransactionInput) => void;
}

export default function TransactionModal({ categories, onClose, onSubmit }: TransactionModalProps) {
  const [type, setType] = React.useState<TransactionType>('expense');
  const [amount, setAmount] = React.useState('');
  const [payee, setPayee] = React.useState('');
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = React.useState('');
  const [memo, setMemo] = React.useState('');

  const filteredCategories = categories.filter(c => c.type === type);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const activeElement = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      activeElement?.focus();
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !payee || !categoryId) return;
    onSubmit({
      date,
      payee,
      amount: parseFloat(amount),
      type,
      categoryId,
      memo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-editorial-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-dialog-title"
        tabIndex={-1}
        className="bg-editorial-bg w-full max-w-lg overflow-hidden border-fine shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div className="px-8 py-6 border-b border-editorial-border flex items-center justify-between">
          <h2 id="transaction-dialog-title" className="text-xl italic font-serif">Checkbook Entry</h2>
          <button aria-label="Close transaction entry dialog" onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-editorial-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Classification Toggle */}
          <div className="flex bg-editorial-zebra border-fine p-1 h-12">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 caps text-[9px] transition-all",
                type === 'expense' ? "bg-editorial-ink text-white" : "hover:bg-neutral-200"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 caps text-[9px] transition-all",
                type === 'income' ? "bg-editorial-ink text-white" : "hover:bg-neutral-200"
              )}
            >
              Deposit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="caps block">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-white border-fine p-3 text-2xl font-light focus:outline-none focus:border-editorial-ink"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="caps block">Date</label>
              <input
                type="date"
                required
                className="w-full bg-white border-fine p-3 text-sm focus:outline-none focus:border-editorial-ink"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="caps block">Payee</label>
            <input
              type="text"
              required
              placeholder="Record the recipient or source"
              className="w-full bg-white border-fine p-3 text-sm focus:outline-none focus:border-editorial-ink font-medium"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="caps block">Category</label>
            <select
              required
              className="w-full bg-white border-fine p-3 text-sm focus:outline-none focus:border-editorial-ink appearance-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="caps block">Memo</label>
            <textarea
              rows={2}
              placeholder="Additional context for this record..."
              className="w-full bg-white border-fine p-3 text-sm focus:outline-none focus:border-editorial-ink resize-none font-serif italic"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full btn-editorial-primary !py-4"
          >
            Enter record
          </button>
        </form>
      </div>
    </div>
  );
}

