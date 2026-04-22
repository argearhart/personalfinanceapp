import React from 'react';
import { CheckCircle2, ChevronRight, Landmark, Check, AlertCircle, BookCheck } from 'lucide-react';
import { Transaction, ReconciliationRecord } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { calculateReconciliationBalance } from '../lib/finance';
import { format } from 'date-fns';

interface ReconcileProps {
  transactions: Transaction[];
  history: ReconciliationRecord[];
  startingBalance: number;
  onReconcile: (record: ReconciliationRecord) => void;
}

export default function Reconcile({ transactions, history, startingBalance, onReconcile }: ReconcileProps) {
  const [step, setStep] = React.useState(1);
  const [statementBalance, setStatementBalance] = React.useState('');
  const [statementDate, setStatementDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const unclearedTransactions = transactions.filter(t => !t.isReconciled);
  
  const { selectedUnclearedTotal, reconciledToDateTotal, calculatedLedgerBalance } = calculateReconciliationBalance({
    transactions,
    statementDate,
    selectedIds,
    startingBalance,
  });

  const targetBalance = parseFloat(statementBalance) || 0;
  const difference = targetBalance - calculatedLedgerBalance;

  const toggleTransaction = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (Math.abs(difference) < 0.01) {
      onReconcile({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        statementEndDate: statementDate,
        statementBalance: targetBalance,
        clearedBalance: calculatedLedgerBalance,
        difference: 0,
        transactionIds: selectedIds
      });
      setStep(3); // Success state
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-20 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-editorial-accent-green text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
          <BookCheck size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl italic font-serif">Checkbook Verified</h2>
          <p className="text-sm text-editorial-muted italic font-serif">Transactions have been reconciled with your bank statement and marked as verified records.</p>
        </div>
        <button 
          onClick={() => {
            setStep(1);
            setStatementBalance('');
            setSelectedIds([]);
          }}
          className="btn-editorial"
        >
          Begin New Reconciliation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-editorial-border pb-3">
        <h2 className="text-xl caps mb-1">Reconciliation Workspace</h2>
        <p className="text-sm text-editorial-muted italic font-serif">Aligning internal journal entries with external bank records.</p>
      </header>

      {step === 1 ? (
        <div className="max-w-md mx-auto space-y-8 bg-editorial-zebra border-fine border-dashed p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl italic font-serif">Statement Parameters</h3>
            <p className="text-sm text-editorial-muted italic font-serif leading-relaxed">Enter the details from your official bank statement.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="caps block">Ending Balance</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-white border-fine p-3 text-2xl font-light focus:outline-none focus:border-editorial-ink"
                  placeholder="0.00"
                  value={statementBalance}
                  onChange={(e) => setStatementBalance(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="caps block">Statement Date</label>
              <input 
                type="date"
                className="w-full bg-white border-fine p-3 text-xs caps focus:outline-none focus:border-editorial-ink"
                value={statementDate}
                onChange={(e) => setStatementDate(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!statementBalance}
              className="w-full btn-editorial-primary !py-4 flex justify-center items-center gap-2"
            >
              Assemble Verification Queue
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[1fr_min(19rem,100%)] lg:gap-6 xl:gap-8 items-start">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl italic font-serif">Verification Queue</h3>
              <span className="caps text-editorial-muted shrink-0">{selectedIds.length} of {unclearedTransactions.length} Selected</span>
            </div>
            
            <div className="bg-white border-fine overflow-hidden min-w-0">
              <div className="hidden md:block max-h-[min(32rem,calc(100dvh-14rem))] overflow-y-auto overflow-x-hidden">
                <table className="w-full min-w-0 table-fixed border-collapse">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-[5.5rem]" />
                    <col />
                    <col className="w-[7.5rem]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 border-b border-editorial-border bg-neutral-100 text-left text-sm font-bold uppercase tracking-widest text-editorial-muted">
                    <tr>
                      <th scope="col" className="px-2 py-2.5 text-center">Pick</th>
                      <th scope="col" className="px-2 py-2.5">Date</th>
                      <th scope="col" className="px-2 py-2.5">Payee / Description</th>
                      <th scope="col" className="px-2 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-editorial-border">
                    {unclearedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-editorial-muted italic font-serif">
                          All transactions have been cleared!
                        </td>
                      </tr>
                    ) : (
                      unclearedTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className={cn(
                            "cursor-pointer transition-colors",
                            selectedIds.includes(transaction.id) ? "bg-editorial-accent-green/5" : "hover:bg-editorial-zebra"
                          )}
                          onClick={() => toggleTransaction(transaction.id)}
                        >
                          <td className="px-2 py-2.5 text-center align-middle">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "inline-flex h-4 w-4 border items-center justify-center transition-all",
                                selectedIds.includes(transaction.id) ? "bg-editorial-ink border-editorial-ink" : "border-neutral-300 bg-white"
                              )}
                            >
                              {selectedIds.includes(transaction.id) && <Check size={10} className="text-white" />}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 align-top text-xs font-medium uppercase text-editorial-ink">
                            {format(new Date(transaction.date), 'MMM dd')}
                          </td>
                          <td className="min-w-0 max-w-0 px-2 py-2.5 align-top">
                            <p className="font-medium leading-snug break-words" title={transaction.payee}>
                              {transaction.payee}
                            </p>
                          </td>
                          <td
                            className={cn(
                              "px-2 py-2.5 text-right text-sm font-medium tabular-nums align-top whitespace-nowrap",
                              transaction.type === 'income' ? "text-editorial-accent-green" : "text-editorial-accent-red"
                            )}
                          >
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden max-h-[min(32rem,calc(100dvh-14rem))] overflow-y-auto divide-y divide-editorial-border">
                {unclearedTransactions.length === 0 ? (
                  <div className="p-12 text-center text-editorial-muted italic font-serif">
                    All transactions have been cleared!
                  </div>
                ) : (
                  unclearedTransactions.map((transaction) => (
                    <button
                      key={transaction.id}
                      onClick={() => toggleTransaction(transaction.id)}
                      className={cn(
                        "w-full text-left p-4 space-y-2 transition-colors",
                        selectedIds.includes(transaction.id) ? "bg-editorial-accent-green/5" : "hover:bg-editorial-zebra"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-medium">{format(new Date(transaction.date), 'MMM dd')}</span>
                        <span className={cn("text-sm font-medium", transaction.type === 'income' ? "text-editorial-accent-green" : "text-editorial-accent-red")}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex w-4 h-4 border items-center justify-center transition-all",
                            selectedIds.includes(transaction.id) ? "bg-editorial-ink border-editorial-ink" : "border-neutral-300 bg-white"
                          )}
                        >
                          {selectedIds.includes(transaction.id) && <Check size={10} className="text-white" />}
                        </span>
                        <span className="text-sm font-medium truncate">{transaction.payee}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="w-full min-w-0 space-y-4">
            <div className="card-editorial !p-4 sm:!p-5 bg-editorial-zebra border-dashed space-y-4">
              <h3 className="caps mb-2">Reconciliation Ledger</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline border-b border-editorial-border pb-2">
                  <span className="text-xs italic font-serif">Statement Target</span>
                  <span className="text-lg font-light tracking-tight">{formatCurrency(targetBalance)}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-editorial-border pb-2">
                  <span className="text-xs italic font-serif">Opening Balance</span>
                  <span className="text-lg font-light tracking-tight">{formatCurrency(startingBalance)}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-editorial-border pb-2">
                  <span className="text-xs italic font-serif">Previously Reconciled (through date)</span>
                  <span className="text-lg font-light tracking-tight">{formatCurrency(reconciledToDateTotal)}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-editorial-border pb-2">
                  <span className="text-xs italic font-serif">Selected This Statement</span>
                  <span className="text-lg font-light tracking-tight">{formatCurrency(selectedUnclearedTotal)}</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-editorial-border pb-2">
                  <span className="text-xs italic font-serif">Calculated Ledger Balance</span>
                  <span className="text-lg font-light tracking-tight">{formatCurrency(calculatedLedgerBalance)}</span>
                </div>
                <div className="pt-4 flex justify-between items-baseline">
                  <span className={cn(
                    "caps transition-colors",
                    Math.abs(difference) < 0.01 ? "text-editorial-accent-green" : "text-editorial-accent-red"
                  )}>
                    Discrepancy
                  </span>
                  <span className={cn(
                    "text-2xl font-medium transition-all transition-all underline underline-offset-4 decoration-1",
                    Math.abs(difference) < 0.01 ? "text-editorial-accent-green" : "text-editorial-accent-red"
                  )}>
                    {formatCurrency(difference)}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleFinish}
                  disabled={Math.abs(difference) >= 0.01}
                  className="w-full btn-editorial-primary !py-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirm Verified State
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="w-full text-center caps text-xs text-editorial-muted hover:text-editorial-ink"
                >
                  Reset Parameters
                </button>
              </div>
            </div>
            
            <div className="p-4 border-fine italic text-sm leading-relaxed text-editorial-muted font-serif bg-white">
              <AlertCircle size={14} className="mb-2 text-editorial-ink" />
              Statement target is compared to opening balance + previously reconciled transactions through the statement date + newly selected transactions.
            </div>
          </aside>
        </div>
      )}

      {/* Reconciliation History Section */}
      {step === 1 && history.length > 0 && (
        <section className="pt-12 border-t border-editorial-border animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 size={18} className="text-editorial-ink" />
            <h3 className="text-lg caps">Reconciliation Archive</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((record) => (
              <div key={record.id} className="card-editorial bg-white group hover:border-editorial-ink transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs caps text-editorial-muted">Statement Period Ending</p>
                    <p className="font-serif italic text-lg">{format(new Date(record.statementEndDate), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="bg-editorial-zebra p-2 border-fine">
                    < Landmark size={14} className="text-editorial-ink" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-editorial-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="italic font-serif">Statement Balance</span>
                    <span className="font-medium">{formatCurrency(record.statementBalance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="italic font-serif">Verified Transactions</span>
                    <span className="font-medium">{record.transactionIds.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-editorial-border border-dashed">
                    <span className="caps text-xs">Verified On</span>
                    <span className="text-xs">{format(new Date(record.date), 'MMM d, p')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

