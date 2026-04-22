import { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, Category, Budget, AppState, ReconciliationRecord } from '../types';
import { loadState, saveState } from '../lib/storage';
import { saveToDatabase, loadFromDatabase } from '../lib/db';
import { normalizeImportedAppState } from '../lib/validation';

export function useFinance() {
  const [state, setState] = useState<AppState>(loadState());
  const isInitialMount = useRef(true);
  const saveQueue = useRef(Promise.resolve());

  // Load from IndexedDB on startup
  useEffect(() => {
    async function initDb() {
      const dbState = await loadFromDatabase();
      if (dbState) {
        setState(dbState);
      }
    }
    initDb();
  }, []);

  // Save to both localStorage (backup) and IndexedDB
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveState(state);
    saveQueue.current = saveQueue.current
      .then(() => saveToDatabase(state))
      .catch((error) => {
        console.error('Failed to persist state to IndexedDB:', error);
      });
  }, [state]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'isReconciled'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      isReconciled: false,
    };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  }, []);

  const setBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    setState(prev => {
      const existingIdx = prev.budgets.findIndex(b => b.categoryId === budget.categoryId);
      const newBudgets = [...prev.budgets];
      if (existingIdx > -1) {
        newBudgets[existingIdx] = { ...newBudgets[existingIdx], ...budget };
      } else {
        newBudgets.push({ ...budget, id: crypto.randomUUID() });
      }
      return { ...prev, budgets: newBudgets };
    });
  }, []);

  const reconcileTransactions = useCallback((record: ReconciliationRecord) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        record.transactionIds.includes(t.id) ? { ...t, isReconciled: true } : t
      ),
      reconciliationHistory: [record, ...prev.reconciliationHistory],
    }));
  }, []);

  const setStartingBalance = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      startingBalance: amount,
    }));
  }, []);

  const setStartingBalanceAsOf = useCallback((ymd: string) => {
    setState((prev) => ({
      ...prev,
      startingBalanceAsOf: ymd,
    }));
  }, []);

  const importData = useCallback((newData: unknown) => {
    const result = normalizeImportedAppState(newData);
    if ('error' in result) {
      throw new Error(result.error);
    }
    setState(result.value);
  }, []);

  const totalBalance = state.startingBalance + state.transactions.reduce((acc, t) => {
    return acc + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  return {
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    setBudget,
    reconcileTransactions,
    setStartingBalance,
    setStartingBalanceAsOf,
    importData,
    totalBalance,
  };
}
