import { AppState } from '../types';
import { STORAGE_KEY, DEFAULT_CATEGORIES } from '../constants';

const INITIAL_STATE: AppState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  reconciliationHistory: [],
  startingBalance: 0,
  startingBalanceAsOf: '',
};

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_STATE;
    const parsed = JSON.parse(saved);
    // Combine saved state with INITIAL_STATE to ensure any new properties are present
    return { ...INITIAL_STATE, ...parsed };
  } catch (err) {
    console.error('Failed to load state:', err);
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}
