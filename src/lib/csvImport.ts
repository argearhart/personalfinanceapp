import type { TransactionType } from '../types';

export function parseMoney(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  let raw = String(value).trim();
  if (!raw) return null;

  // Accounting negatives like (123.45)
  let negative = false;
  if (raw.startsWith('(') && raw.endsWith(')')) {
    negative = true;
    raw = raw.slice(1, -1).trim();
  }

  // Remove currency symbols/thousands separators, keep digits, dot, minus
  raw = raw.replace(/[^\d.-]/g, '');
  if (!raw) return null;

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return null;

  const signed = negative ? -Math.abs(parsed) : parsed;
  return signed;
}

export function deriveDebitCreditAmount(params: {
  debitRaw: unknown;
  creditRaw: unknown;
}): { signed: number; source: 'debit' | 'credit' } | null {
  const debitParsed = parseMoney(params.debitRaw);
  const creditParsed = parseMoney(params.creditRaw);

  const debit = debitParsed === null ? 0 : Math.abs(debitParsed);
  const credit = creditParsed === null ? 0 : Math.abs(creditParsed);

  if (debit > 0 && credit > 0) {
    throw new Error('Both debit and credit are populated; this row needs manual review.');
  }

  if (debit > 0) return { signed: -debit, source: 'debit' };
  if (credit > 0) return { signed: credit, source: 'credit' };
  return null;
}

export function inferTypeFromSignedAmount(signedAmount: number): TransactionType {
  if (signedAmount > 0) return 'income';
  if (signedAmount < 0) return 'expense';
  // Zero amount: treat as expense with 0 (keeps importer permissive)
  return 'expense';
}

export function inferTypeFromTypeColumn(typeRaw: unknown, signedAmount: number): TransactionType {
  const hint = String(typeRaw ?? '').toLowerCase();
  if (hint.includes('credit') || hint.includes('deposit') || hint.includes('income')) return 'income';
  if (hint.includes('debit') || hint.includes('withdraw') || hint.includes('purchase') || hint.includes('expense')) {
    return 'expense';
  }
  return inferTypeFromSignedAmount(signedAmount);
}
