import React from 'react';
import { Target, AlertCircle, CheckCircle2, Settings2, Check } from 'lucide-react';
import { Category, Budget, Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';

interface BudgetViewProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  onSetBudget: (budget: Omit<Budget, 'id'>) => void;
}

export default function BudgetView({ categories, budgets, transactions, onSetBudget }: BudgetViewProps) {
  const [isEditing, setIsEditing] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const getSpent = (catId: string) => {
    return transactions
      .filter(t => 
        t.categoryId === catId && 
        isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
      )
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="border-b border-black pb-4">
        <h2 className="text-xl caps mb-2">Disbursement Limits / Budgets</h2>
        <p className="text-sm text-editorial-muted italic font-serif">Planning and monitoring monthly spending thresholds for {format(now, 'MMMM yyyy')}.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {expenseCategories.map(cat => {
          const budget = budgets.find(b => b.categoryId === cat.id);
          const spent = getSpent(cat.id);
          const limit = budget?.amount || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const isOver = spent > limit && limit > 0;

          return (
            <div key={cat.id} className="card-editorial bg-white flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="caps text-[9px] mb-1 block">Category</span>
                  <h3 className="text-xl italic font-serif">{cat.name}</h3>
                </div>
                <div className="text-right">
                  <span className="caps text-[9px] mb-1 block">Allocation</span>
                  {isEditing === cat.id ? (
                    <div className="flex items-center gap-2">
                       <input 
                        type="number" 
                        autoFocus
                        className="w-24 bg-editorial-zebra border-fine p-1 text-right text-xs focus:outline-none focus:border-editorial-ink"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          onSetBudget({ categoryId: cat.id, amount: parseFloat(editValue) || 0, period: 'monthly' });
                          setIsEditing(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onSetBudget({ categoryId: cat.id, amount: parseFloat(editValue) || 0, period: 'monthly' });
                            setIsEditing(null);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsEditing(cat.id);
                        setEditValue(limit.toString());
                      }}
                      className="text-sm font-light hover:underline underline-offset-4 decoration-dashed"
                    >
                      {limit > 0 ? formatCurrency(limit) : '+ Set Allocation'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] caps italic">Utilization</span>
                  <span className={cn(
                    "text-sm font-light",
                    isOver ? "text-editorial-accent-red font-bold" : "text-editorial-ink"
                  )}>
                    {formatCurrency(spent)} <span className="text-[10px] text-editorial-muted">/ {formatCurrency(limit)}</span>
                  </span>
                </div>
                <div className="w-full bg-editorial-zebra h-1.5 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      isOver ? "bg-editorial-accent-red" : "bg-editorial-ink"
                    )} 
                    style={{ width: `${Math.min(percentage, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center bg-neutral-50 p-2 border-fine border-dashed">
                  <span className="text-[9px] caps">Available</span>
                  <span className={cn(
                    "text-xs font-medium",
                    isOver ? "text-editorial-accent-red" : "text-editorial-ink"
                  )}>
                    {formatCurrency(Math.max(limit - spent, 0))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 border-fine border-dashed flex flex-col items-center text-center space-y-4 bg-editorial-zebra">
        <Target className="text-editorial-muted opacity-40" size={32} />
        <p className="text-xs text-editorial-muted italic font-serif max-w-sm">
          A successful journal reflects discipline. Set your allocations carefully to maintain a positive net surplus at the end of every verified cycle.
        </p>
      </div>
    </div>
  );
}

