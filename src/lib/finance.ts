import { Transaction } from '../types';
import { isYmdOnOrBefore } from './dates';

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
  const selectedSet = new Set(selectedIds);

  const reconciledToDateTotal = transactions
    .filter(
      (transaction) => transaction.isReconciled && isYmdOnOrBefore(transaction.date, statementDate)
    )
    .reduce((acc, transaction) => acc + signedAmount(transaction), 0);

  const selectedUnclearedTotal = transactions
    .filter(
      (transaction) =>
        !transaction.isReconciled &&
        selectedSet.has(transaction.id) &&
        isYmdOnOrBefore(transaction.date, statementDate)
    )
    .reduce((acc, transaction) => acc + signedAmount(transaction), 0);

  const calculatedLedgerBalance = startingBalance + reconciledToDateTotal + selectedUnclearedTotal;

  return {
    reconciledToDateTotal,
    selectedUnclearedTotal,
    calculatedLedgerBalance,
  };
}
