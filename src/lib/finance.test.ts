import { describe, expect, it } from 'vitest';
import { calculateReconciliationBalance } from './finance';
import { Transaction } from '../types';

function buildTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx',
    date: '2026-04-01',
    payee: 'Payee',
    amount: 10,
    type: 'expense',
    categoryId: 'cat-1',
    isReconciled: false,
    ...overrides,
  };
}

describe('calculateReconciliationBalance', () => {
  it('includes opening and previously reconciled balances', () => {
    const transactions: Transaction[] = [
      buildTransaction({ id: 'old-income', type: 'income', amount: 500, isReconciled: true, date: '2026-03-01' }),
      buildTransaction({ id: 'old-expense', type: 'expense', amount: 100, isReconciled: true, date: '2026-03-02' }),
      buildTransaction({ id: 'selected-expense', type: 'expense', amount: 50, isReconciled: false, date: '2026-03-20' }),
    ];

    const result = calculateReconciliationBalance({
      transactions,
      statementDate: '2026-03-31',
      selectedIds: ['selected-expense'],
      startingBalance: 1000,
    });

    expect(result.reconciledToDateTotal).toBe(400);
    expect(result.selectedUnclearedTotal).toBe(-50);
    expect(result.calculatedLedgerBalance).toBe(1350);
  });

  it('ignores unreconciled transactions that are not selected', () => {
    const transactions: Transaction[] = [
      buildTransaction({ id: 'reconciled', type: 'income', amount: 200, isReconciled: true }),
      buildTransaction({ id: 'unselected', type: 'expense', amount: 25, isReconciled: false }),
    ];

    const result = calculateReconciliationBalance({
      transactions,
      statementDate: '2026-04-30',
      selectedIds: [],
      startingBalance: 100,
    });

    expect(result.reconciledToDateTotal).toBe(200);
    expect(result.selectedUnclearedTotal).toBe(0);
    expect(result.calculatedLedgerBalance).toBe(300);
  });

  it('does not count selected uncleared items dated after the statement', () => {
    const transactions: Transaction[] = [
      buildTransaction({
        id: 'after-statement',
        type: 'expense',
        amount: 10,
        isReconciled: false,
        date: '2026-04-15',
      }),
    ];
    const result = calculateReconciliationBalance({
      transactions,
      statementDate: '2026-03-31',
      selectedIds: ['after-statement'],
      startingBalance: 0,
    });
    expect(result.selectedUnclearedTotal).toBe(0);
  });
});
