/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFinance } from './hooks/useFinance';
import { NewTransactionInput, Transaction } from './types';
import Layout from './components/Layout';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Register = React.lazy(() => import('./components/Register'));
const Reconcile = React.lazy(() => import('./components/Reconcile'));
const Reports = React.lazy(() => import('./components/Reports'));
const BudgetView = React.lazy(() => import('./components/BudgetView'));
const CategoryManager = React.lazy(() => import('./components/CategoryManager'));
const TransactionModal = React.lazy(() => import('./components/TransactionModal'));
const CSVImportModal = React.lazy(() => import('./components/CSVImportModal'));

type TransactionModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; transaction: Transaction };

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [txModal, setTxModal] = React.useState<TransactionModalState>({ open: false });
  const [isCSVModalOpen, setIsCSVModalOpen] = React.useState(false);
  const { 
    state, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction, 
    reconcileTransactions,
    addCategory,
    setBudget,
    setStartingBalance,
    importData,
    totalBalance 
  } = useFinance();

  const handleCSVImport = (transactions: NewTransactionInput[]) => {
    transactions.forEach(t => addTransaction(t));
    setIsCSVModalOpen(false);
  };

  const loadingFallback = (
    <div role="status" aria-live="polite" className="p-6 text-sm italic font-serif text-editorial-muted">
      Loading view...
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={state.transactions} 
            categories={state.categories} 
            setActiveTab={setActiveTab}
            onAddTransaction={() => setTxModal({ open: true, mode: 'create' })}
          />
        );
      case 'register':
        return (
          <Register 
            transactions={state.transactions} 
            categories={state.categories}
            onAddTransaction={() => setTxModal({ open: true, mode: 'create' })}
            onEditTransaction={(transaction) => setTxModal({ open: true, mode: 'edit', transaction })}
            onImportCSV={() => setIsCSVModalOpen(true)}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case 'reconcile':
        return (
          <Reconcile 
            transactions={state.transactions} 
            history={state.reconciliationHistory}
            startingBalance={state.startingBalance}
            onReconcile={reconcileTransactions}
          />
        );
      case 'reports':
        return (
          <Reports 
            transactions={state.transactions} 
            categories={state.categories} 
          />
        );
      case 'budget':
        return (
          <BudgetView 
            categories={state.categories} 
            budgets={state.budgets} 
            transactions={state.transactions}
            onSetBudget={setBudget}
          />
        );
      case 'categories':
        return (
          <CategoryManager 
            categories={state.categories} 
            onAddCategory={addCategory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      balance={totalBalance}
      startingBalance={state.startingBalance}
      onUpdateStartingBalance={setStartingBalance}
      onImportData={importData}
      fullState={state}
    >
      <React.Suspense fallback={loadingFallback}>
        {renderContent()}
      </React.Suspense>
      
      <React.Suspense fallback={null}>
        {txModal.open && (
          <TransactionModal 
            categories={state.categories}
            initialTransaction={txModal.mode === 'edit' ? txModal.transaction : null}
            onClose={() => setTxModal({ open: false })}
            onCreate={addTransaction}
            onUpdate={(id, data) => updateTransaction(id, data)}
          />
        )}

        {isCSVModalOpen && (
          <CSVImportModal 
            categories={state.categories}
            onClose={() => setIsCSVModalOpen(false)}
            onImport={handleCSVImport}
          />
        )}
      </React.Suspense>
    </Layout>
  );
}

