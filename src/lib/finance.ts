import { Transaction } from '../types';

export function signedAmount(transaction: Transaction): number {
  return transaction.type === 'income' ? transaction.amount : -transaction.amount;
}

export function calculateReconciliationBalance(params: {
  transactions: Transaction[];
  statementDate: string;
  selectedIds: string[];
  startingBalance: number;
}) {
  const { transactions, statementDate, selectedIds, startingBalance } = params;
  const statementDateTime = new Date(statementDate);
  const selectedSet = new Set(selectedIds);

  const reconciledToDateTotal = transactions
    .filter((transaction) => transaction.isReconciled && new Date(transaction.date) <= statementDateTime)
    .reduce((acc, transaction) => acc + signedAmount(transaction), 0);

  const selectedUnclearedTotal = transactions
    .filter((transaction) => !transaction.isReconciled && selectedSet.has(transaction.id))
    .reduce((acc, transaction) => acc + signedAmount(transaction), 0);

  const calculatedLedgerBalance = startingBalance + reconciledToDateTotal + selectedUnclearedTotal;

  return {
    reconciledToDateTotal,
    selectedUnclearedTotal,
    calculatedLedgerBalance,
  };
}
