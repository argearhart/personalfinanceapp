import { AppState, Budget, Category, ReconciliationRecord, Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTransactionType = (value: unknown): value is TransactionType =>
  value === 'income' || value === 'expense';

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const asString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return null;
};

const asIsoDate = (value: unknown): string | null => {
  const dateString = asString(value);
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const normalizeCategory = (value: unknown): Category | null => {
  if (!isObject(value)) return null;
  const id = asString(value.id);
  const name = asString(value.name);
  const color = asString(value.color) ?? '#94a3b8';
  const type = isTransactionType(value.type) ? value.type : null;
  if (!id || !name || !type) return null;
  return { id, name, color, type };
};

const normalizeTransaction = (value: unknown): Transaction | null => {
  if (!isObject(value)) return null;
  const id = asString(value.id);
  const date = asString(value.date);
  const payee = asString(value.payee);
  const amount = asNumber(value.amount);
  const type = isTransactionType(value.type) ? value.type : null;
  const categoryId = asString(value.categoryId);
  if (!id || !date || !payee || amount === null || !type || !categoryId) return null;
  const memo = typeof value.memo === 'string' ? value.memo : undefined;
  const tags = Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : undefined;
  return {
    id,
    date,
    payee,
    amount: Math.abs(amount),
    type,
    categoryId,
    isReconciled: Boolean(value.isReconciled),
    memo,
    tags,
  };
};

const normalizeBudget = (value: unknown): Budget | null => {
  if (!isObject(value)) return null;
  const id = asString(value.id);
  const categoryId = asString(value.categoryId);
  const amount = asNumber(value.amount);
  const period = value.period === 'monthly' || value.period === 'yearly' ? value.period : null;
  if (!id || !categoryId || amount === null || !period) return null;
  return { id, categoryId, amount: Math.abs(amount), period };
};

const normalizeReconciliationRecord = (value: unknown): ReconciliationRecord | null => {
  if (!isObject(value)) return null;
  const id = asString(value.id);
  const date = asString(value.date);
  const statementEndDate = asString(value.statementEndDate);
  const statementBalance = asNumber(value.statementBalance);
  const clearedBalance = asNumber(value.clearedBalance);
  const difference = asNumber(value.difference);
  const transactionIds = Array.isArray(value.transactionIds)
    ? value.transactionIds.filter((entry): entry is string => typeof entry === 'string')
    : null;

  if (!id || !date || !statementEndDate || statementBalance === null || clearedBalance === null || difference === null || !transactionIds) {
    return null;
  }

  return { id, date, statementEndDate, statementBalance, clearedBalance, difference, transactionIds };
};

export function normalizeImportedAppState(input: unknown): ValidationResult<AppState> {
  if (!isObject(input)) {
    return { ok: false, error: 'Backup file must contain a JSON object.' };
  }

  const normalizedCategories = Array.isArray(input.categories)
    ? input.categories.map(normalizeCategory).filter((entry): entry is Category => entry !== null)
    : [...DEFAULT_CATEGORIES];

  const categories = normalizedCategories.length > 0 ? normalizedCategories : [...DEFAULT_CATEGORIES];
  const categoryIds = new Set(categories.map((category) => category.id));

  const transactions = Array.isArray(input.transactions)
    ? input.transactions
        .map(normalizeTransaction)
        .filter((entry): entry is Transaction => entry !== null)
        .map((transaction) => ({
          ...transaction,
          date: asIsoDate(transaction.date) ?? new Date().toISOString(),
          categoryId: categoryIds.has(transaction.categoryId) ? transaction.categoryId : categories[0].id,
        }))
    : [];

  const budgets = Array.isArray(input.budgets)
    ? input.budgets
        .map(normalizeBudget)
        .filter((entry): entry is Budget => entry !== null)
        .filter((budget) => categoryIds.has(budget.categoryId))
    : [];

  const reconciliationHistory = Array.isArray(input.reconciliationHistory)
    ? input.reconciliationHistory
        .map(normalizeReconciliationRecord)
        .filter((entry): entry is ReconciliationRecord => entry !== null)
    : [];

  const startingBalance = asNumber(input.startingBalance) ?? 0;
  const asOfIn = (input as Record<string, unknown>).startingBalanceAsOf;
  const startingBalanceAsOf =
    typeof asOfIn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(asOfIn.trim()) ? asOfIn.trim() : '';

  return {
    ok: true,
    value: {
      transactions,
      categories,
      budgets,
      reconciliationHistory,
      startingBalance,
      startingBalanceAsOf,
    },
  };
}
