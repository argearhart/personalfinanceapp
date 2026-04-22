export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string;
  payee: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  isReconciled: boolean;
  memo?: string;
  tags?: string[];
}

export type NewTransactionInput = Omit<Transaction, 'id' | 'isReconciled'>;

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reconciliationHistory: ReconciliationRecord[];
  startingBalance: number;
}

export interface ReconciliationRecord {
  id: string;
  date: string;
  statementEndDate: string;
  statementBalance: number;
  clearedBalance: number;
  difference: number;
  transactionIds: string[];
}
