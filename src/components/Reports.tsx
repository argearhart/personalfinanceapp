import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Transaction, Category } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear, subYears } from 'date-fns';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
}

type TimeRange = 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all';

export default function Reports({ transactions, categories }: ReportsProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('thisMonth');
  const [showComparison, setShowComparison] = React.useState(false);

  const getRangeInterval = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'lastYear':
        return { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
      default:
        return { start: new Date(0), end: new Date(8640000000000000) };
    }
  };

  const currentInterval = getRangeInterval(timeRange);
  const expenseCategories = React.useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories]
  );
  
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((transaction) => {
      if (timeRange === 'all') return true;
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, currentInterval);
    });
  }, [currentInterval, timeRange, transactions]);

  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

  // Comparison Data Logic
  const getComparisonInterval = () => {
    const now = new Date();
    if (timeRange === 'thisMonth') return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    if (timeRange === 'thisYear') return { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
    return null;
  };

  const comparisonInterval = getComparisonInterval();
  const comparisonTransactions = React.useMemo(() => {
    if (!comparisonInterval) return [];
    return transactions.filter(
      (transaction) => transaction.type === 'expense' && isWithinInterval(new Date(transaction.date), comparisonInterval)
    );
  }, [comparisonInterval, transactions]);

  const comparisonTotal = comparisonTransactions.reduce((acc, t) => acc + t.amount, 0);
  const currentTotal = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Category Distribution
  const categoryData = React.useMemo(() => {
    const spendByCategory = expenseTransactions.reduce((acc, transaction) => {
      acc.set(transaction.categoryId, (acc.get(transaction.categoryId) ?? 0) + transaction.amount);
      return acc;
    }, new Map<string, number>());

    return expenseCategories
      .map((category) => ({
        name: category.name,
        value: spendByCategory.get(category.id) ?? 0,
        color: category.color,
      }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenseCategories, expenseTransactions]);

  // Payee Analysis
  const vendorData = Array.from(
    expenseTransactions.reduce((acc, t) => {
      acc.set(t.payee, (acc.get(t.payee) || 0) + t.amount);
      return acc;
    }, new Map<string, number>())
  )
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 10);

  // Monthly Trend Data (for the current year)
  const monthlyTrendData = React.useMemo(() => {
    const totalsByMonth = transactions.reduce((acc, transaction) => {
      if (transaction.type !== 'expense') return acc;
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      acc.set(key, (acc.get(key) ?? 0) + transaction.amount);
      return acc;
    }, new Map<string, number>());

    return Array.from({ length: 12 }).map((_, monthIndex) => {
      const monthDate = new Date(new Date().getFullYear(), monthIndex, 1);
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      return {
        month: format(monthDate, 'MMM'),
        amount: totalsByMonth.get(key) ?? 0,
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black pb-6">
        <div>
          <h2 className="text-xl caps mb-2">Fiscal Reporting & Analytics</h2>
          <p className="text-sm text-editorial-muted italic font-serif">Comprehensive audit of disbursements, revenue trends, and counterparty frequency.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {(timeRange === 'thisMonth' || timeRange === 'thisYear') && (
            <button 
              onClick={() => setShowComparison(!showComparison)}
              className={cn(
                "px-3 py-1 text-xs caps border-fine transition-all",
                showComparison ? "bg-editorial-ink text-white" : "hover:bg-neutral-100"
              )}
            >
              Toggle Comparison
            </button>
          )}
          
          <div className="flex bg-editorial-zebra border-fine p-1">
            {(['thisMonth', 'lastMonth', 'thisYear', 'lastYear', 'all'] as const).map(range => (
              <button 
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  if (range === 'all') setShowComparison(false);
                }}
                className={cn(
                  "px-3 py-1 caps text-2xs transition-all",
                  timeRange === range ? "bg-editorial-ink text-white" : "hover:bg-neutral-200"
                )}
              >
                {range.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {showComparison && comparisonInterval && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-editorial-zebra border-fine">
          <div className="space-y-1">
            <span className="caps">Benchmark Total</span>
            <p className="text-2xl font-light">{formatCurrency(comparisonTotal)}</p>
            <p className="text-xs text-editorial-muted italic font-serif">Prior Period Baseline</p>
          </div>
          <div className="space-y-1">
            <span className="caps">Current Period</span>
            <p className="text-2xl font-light">{formatCurrency(currentTotal)}</p>
            <p className="text-xs text-editorial-muted italic font-serif">Active Reporting Period</p>
          </div>
          <div className="space-y-1">
            <span className="caps">Variance</span>
            <p className={cn(
              "text-2xl font-bold",
              currentTotal > comparisonTotal ? "text-editorial-accent-red" : "text-editorial-accent-green"
            )}>
              {currentTotal > comparisonTotal ? '+' : ''}{(( (currentTotal - comparisonTotal) / (comparisonTotal || 1) ) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-editorial-muted italic font-serif">Relative Expenditure Shift</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Category Distribution */}
        <div className="lg:col-span-8">
          <div className="card-editorial bg-white p-12">
            <h3 className="text-2xl mb-12 text-center uppercase tracking-tighter">Expenditure by Category</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={110}
                    outerRadius={160}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#F9F9F7"
                    strokeWidth={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ border: '1px solid #E5E5E1', borderRadius: '0', backgroundColor: '#F9F9F7', fontSize: '0.85rem', boxShadow: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-editorial-border">
              {categoryData.slice(0, 8).map((item) => (
                <div key={item.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="caps text-xs truncate">{item.name}</span>
                  </div>
                  <p className="text-sm">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Payees */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-editorial bg-editorial-zebra h-full">
            <h3 className="text-xl mb-8 caps">Top 10 Counterparties</h3>
            <div className="space-y-6">
              {vendorData.map((vendor, i) => (
                <div key={vendor.name} className="flex justify-between items-end border-b border-editorial-border/30 pb-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-editorial-muted font-serif italic">{i + 1}.</span>
                    <span className="text-xs font-medium truncate max-w-[120px]">{vendor.name}</span>
                  </div>
                  <span className="text-xs font-bold font-sans">{formatCurrency(vendor.value)}</span>
                </div>
              ))}
              {vendorData.length === 0 && (
                <p className="text-sm text-editorial-muted italic font-serif text-center py-12">No counterparty data available for this period.</p>
              )}
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="lg:col-span-12">
          <div className="card-editorial bg-white">
            <h3 className="text-xl mb-12 caps text-center">Annual Disbursement Trend ({new Date().getFullYear()})</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 13, fill: '#6B6B6B', italic: true, fontFamily: 'Georgia' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: '#E5E5E1', opacity: 0.3 }}
                    contentStyle={{ border: '1px solid #E5E5E1', borderRadius: '0', fontSize: '0.85rem', boxShadow: 'none' }}
                  />
                  <Bar dataKey="amount" fill="#1A1A1A" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
