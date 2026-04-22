import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salary', color: '#10b981', type: 'income' },
  { id: 'cat-2', name: 'Investments', color: '#3b82f6', type: 'income' },
  { id: 'cat-3', name: 'Gifts', color: '#8b5cf6', type: 'income' },
  { id: 'cat-4', name: 'Rent/Mortgage', color: '#ef4444', type: 'expense' },
  { id: 'cat-5', name: 'Utilities', color: '#f59e0b', type: 'expense' },
  { id: 'cat-6', name: 'Groceries', color: '#10b981', type: 'expense' },
  { id: 'cat-7', name: 'Dining Out', color: '#ec4899', type: 'expense' },
  { id: 'cat-8', name: 'Shopping', color: '#6366f1', type: 'expense' },
  { id: 'cat-9', name: 'Transportation', color: '#64748b', type: 'expense' },
  { id: 'cat-10', name: 'Healthcare', color: '#ef4444', type: 'expense' },
  { id: 'cat-11', name: 'Entertainment', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-12', name: 'Other', color: '#94a3b8', type: 'expense' },
];

export const STORAGE_KEY = 'personal-ledger-data';
