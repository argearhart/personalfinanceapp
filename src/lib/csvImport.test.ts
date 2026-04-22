import { describe, expect, it } from 'vitest';
import {
  deriveDebitCreditAmount,
  inferTypeFromTypeColumn,
  isCsvRowEffectivelyBlank,
  parseMoney,
} from './csvImport';

describe('isCsvRowEffectivelyBlank', () => {
  it('is true for empty object', () => {
    expect(isCsvRowEffectivelyBlank({})).toBe(true);
  });

  it('is true when every value is blank', () => {
    expect(isCsvRowEffectivelyBlank({ a: '', b: '  ', c: null })).toBe(true);
  });

  it('is false when any value has content', () => {
    expect(isCsvRowEffectivelyBlank({ a: '', b: 'x' })).toBe(false);
  });
});

describe('parseMoney', () => {
  it('parses currency-ish strings', () => {
    expect(parseMoney('$1,234.56')).toBe(1234.56);
  });

  it('parses accounting parentheses as negative', () => {
    expect(parseMoney('($42.10)')).toBe(-42.1);
  });

  it('returns null for empty', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('  ')).toBeNull();
  });
});

describe('deriveDebitCreditAmount', () => {
  it('treats debit as negative outflow', () => {
    expect(deriveDebitCreditAmount({ debitRaw: '12.34', creditRaw: '' })).toEqual({ signed: -12.34, source: 'debit' });
  });

  it('treats credit as positive inflow', () => {
    expect(deriveDebitCreditAmount({ debitRaw: '', creditRaw: '9.00' })).toEqual({ signed: 9, source: 'credit' });
  });

  it('returns null when neither side is populated', () => {
    expect(deriveDebitCreditAmount({ debitRaw: '', creditRaw: '' })).toBeNull();
  });

  it('throws when both sides are populated', () => {
    expect(() => deriveDebitCreditAmount({ debitRaw: '1', creditRaw: '2' })).toThrow(/manual review/i);
  });
});

describe('inferTypeFromTypeColumn', () => {
  it('prefers explicit type hints', () => {
    expect(inferTypeFromTypeColumn('DEBIT', 12)).toBe('expense');
    expect(inferTypeFromTypeColumn('CREDIT', -12)).toBe('income');
  });

  it('falls back to signed amount when type is blank', () => {
    expect(inferTypeFromTypeColumn('', 10)).toBe('income');
    expect(inferTypeFromTypeColumn('', -10)).toBe('expense');
  });
});
