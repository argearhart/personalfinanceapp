import Dexie, { type Table } from 'dexie';
import { Transaction, Category, Budget, ReconciliationRecord, AppState } from '../types';

export class LedgerDatabase extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  reconciliationHistory!: Table<ReconciliationRecord>;
  metadata!: Table<{ key: string; value: string | number }>;

  constructor() {
    super('LedgerDatabase');
    this.version(1).stores({
      transactions: 'id, date, categoryId, isReconciled',
      categories: 'id, name, type',
      budgets: 'id, categoryId',
      reconciliationHistory: 'id, date, statementEndDate',
      metadata: 'key'
    });
  }
}

export const db = new LedgerDatabase();

export async function saveToDatabase(state: AppState) {
  await db.transaction('rw', [db.transactions, db.categories, db.budgets, db.reconciliationHistory, db.metadata], async () => {
    // We update everything to keep it in sync with the state
    // In a mature app, we'd only update diffs, but for the migration/sync phase, this works
    await db.transactions.clear();
    await db.transactions.bulkAdd(state.transactions);
    
    await db.categories.clear();
    await db.categories.bulkAdd(state.categories);
    
    await db.budgets.clear();
    await db.budgets.bulkAdd(state.budgets);
    
    await db.reconciliationHistory.clear();
    await db.reconciliationHistory.bulkAdd(state.reconciliationHistory);
    
    await db.metadata.put({ key: 'startingBalance', value: state.startingBalance });
    await db.metadata.put({ key: 'startingBalanceAsOf', value: state.startingBalanceAsOf });
  });
}

export async function loadFromDatabase(): Promise<AppState | null> {
  try {
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const budgets = await db.budgets.toArray();
    const reconciliationHistory = await db.reconciliationHistory.toArray();
    const startingBalanceRecord = await db.metadata.get('startingBalance');
    const startingBalanceAsOfRecord = await db.metadata.get('startingBalanceAsOf');

    if (categories.length === 0 && transactions.length === 0) return null;

    const asOfValue = startingBalanceAsOfRecord?.value;
    const startingBalanceAsOf =
      typeof asOfValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(asOfValue) ? asOfValue : '';

    return {
      transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      categories,
      budgets,
      reconciliationHistory: reconciliationHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      startingBalance: typeof startingBalanceRecord?.value === 'number' ? startingBalanceRecord.value : 0,
      startingBalanceAsOf,
    };
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return null;
  }
}
