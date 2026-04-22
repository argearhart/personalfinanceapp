import React from 'react';
import { formatCurrency, cn } from '../lib/utils';
import { Transaction, Category } from '../types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  setActiveTab: (tab: string) => void;
  onAddTransaction: () => void;
}

export default function Dashboard({ transactions, categories, setActiveTab, onAddTransaction }: DashboardProps) {
  const now = React.useMemo(() => new Date(), []);
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const monthTransactions = React.useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    });
  }, [currentMonthEnd, currentMonthStart, transactions]);

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Chart Data Preparation
  const last30Days = React.useMemo(() => {
    const totalsByDate = transactions.reduce((map, transaction) => {
      const existing = map.get(transaction.date) ?? { income: 0, expense: 0 };
      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expense += transaction.amount;
      }
      map.set(transaction.date, existing);
      return map;
    }, new Map<string, { income: number; expense: number }>());

    return Array.from({ length: 15 }).map((_, index) => {
      const date = subDays(now, 14 - index);
      const dateStr = format(date, 'yyyy-MM-dd');
      const daily = totalsByDate.get(dateStr) ?? { income: 0, expense: 0 };
      return {
        name: format(date, 'MMM d'),
        income: daily.income,
        expense: daily.expense,
      };
    });
  }, [now, transactions]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl caps mb-2">Executive Summary</h2>
          <p className="text-sm text-editorial-muted italic font-serif">A detailed overview of journal activity for {format(now, 'MMMM yyyy')}.</p>
        </div>
        <button 
          onClick={onAddTransaction}
          className="btn-editorial-primary"
        >
          + New Entry
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-fine divide-x divide-editorial-border">
        <div className="bg-white p-8 group">
          <span className="caps mb-4 block">Monthly Income</span>
          <h3 className="text-4xl text-editorial-accent-green mb-1">{formatCurrency(income)}</h3>
          <p className="text-[10px] text-editorial-muted italic font-serif">Verified deposits</p>
        </div>

        <div className="bg-editorial-zebra p-8 group">
          <span className="caps mb-4 block text-editorial-muted">Monthly Expenses</span>
          <h3 className="text-4xl text-editorial-accent-red mb-1">{formatCurrency(expenses)}</h3>
          <p className="text-[10px] text-editorial-muted italic font-serif">Total disbursements</p>
        </div>

        <div className="bg-white p-8 group">
          <span className="caps mb-4 block">Net Surplus</span>
          <h3 className="text-4xl mb-1">{formatCurrency(income - expenses)}</h3>
          <p className="text-[10px] text-editorial-muted italic font-serif">Monthly gain/loss</p>
        </div>
      </div>

      {/* Two Column Layout for Chart and Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-border pb-2">
            <h2 className="text-lg caps">Activity Trajectory</h2>
          </div>
          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#6B6B6B', textTransform: 'uppercase' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6B6B6B' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#F9F9F7', 
                    border: '1px solid #E5E5E1', 
                    borderRadius: '0px', 
                    boxShadow: 'none',
                    fontSize: '11px'
                  }}
                />
                <Area 
                  type="step" 
                  dataKey="income" 
                  stroke="#4A5D23" 
                  strokeWidth={1}
                  fill="#4A5D23" 
                  fillOpacity={0.05} 
                />
                <Area 
                  type="step" 
                  dataKey="expense" 
                  stroke="#9D3A3A" 
                  strokeWidth={1}
                  fill="#9D3A3A" 
                  fillOpacity={0.05} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-12 space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-border pb-2">
            <h2 className="text-lg caps">Recent Registry Entries</h2>
            <button 
              onClick={() => setActiveTab('register')}
              className="text-[10px] caps hover:underline"
            >
              View Full Checkbook index
            </button>
          </div>
          <div className="bg-white border-fine">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-editorial-muted italic font-serif">Checkbook is empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-editorial-border">
                {transactions.slice(0, 5).map((t) => {
                  const cat = categoryById.get(t.categoryId);
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white hover:bg-editorial-zebra transition-colors">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] caps w-16">{format(new Date(t.date), 'MMM dd')}</span>
                        <div>
                          <p className="text-sm font-medium">{t.payee}</p>
                          <p className="text-[9px] caps mt-0.5">{cat?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-medium",
                          t.type === 'income' ? "text-editorial-accent-green" : "text-editorial-accent-red"
                        )}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                        {t.isReconciled && (
                          <span className="text-[8px] border border-editorial-accent-green text-editorial-accent-green px-1 py-0 rounded-sm font-bold uppercase tracking-tighter">
                            Checkbook Verified
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
