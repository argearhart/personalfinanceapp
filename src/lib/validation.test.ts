import { describe, expect, it } from 'vitest';
import { normalizeImportedAppState } from './validation';

describe('normalizeImportedAppState', () => {
  it('normalizes a valid backup payload', () => {
    const result = normalizeImportedAppState({
      categories: [{ id: 'cat-1', name: 'Salary', color: '#10b981', type: 'income' }],
      transactions: [
        {
          id: 'tx-1',
          date: '2026-04-01',
          payee: 'Employer',
          amount: 1200,
          type: 'income',
          categoryId: 'cat-1',
          isReconciled: false,
        },
      ],
      budgets: [{ id: 'b-1', categoryId: 'cat-1', amount: 2000, period: 'monthly' }],
      reconciliationHistory: [],
      startingBalance: 300,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.categories).toHaveLength(1);
    expect(result.value.transactions[0].categoryId).toBe('cat-1');
    expect(result.value.startingBalance).toBe(300);
  });

  it('returns default-safe state for malformed object shape', () => {
    const result = normalizeImportedAppState({
      categories: 'invalid',
      transactions: [{ id: 5, amount: 'abc' }],
      startingBalance: 'not-a-number',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.transactions).toHaveLength(0);
    expect(result.value.categories.length).toBeGreaterThan(0);
    expect(result.value.startingBalance).toBe(0);
  });

  it('rejects non-object payloads', () => {
    const result = normalizeImportedAppState('not-json-object');
    expect(result.ok).toBe(false);
    if (!('error' in result)) return;
    expect(result.error).toMatch(/json object/i);
  });
});
