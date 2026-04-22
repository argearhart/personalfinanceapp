/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFinance } from './hooks/useFinance';
import { NewTransactionInput } from './types';
import Layout from './components/Layout';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Register = React.lazy(() => import('./components/Register'));
const Reconcile = React.lazy(() => import('./components/Reconcile'));
const Reports = React.lazy(() => import('./components/Reports'));
const BudgetView = React.lazy(() => import('./components/BudgetView'));
const CategoryManager = React.lazy(() => import('./components/CategoryManager'));
const TransactionModal = React.lazy(() => import('./components/TransactionModal'));
const CSVImportModal = React.lazy(() => import('./components/CSVImportModal'));

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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
            onAddTransaction={() => setIsModalOpen(true)}
          />
        );
      case 'register':
        return (
          <Register 
            transactions={state.transactions} 
            categories={state.categories}
            onAddTransaction={() => setIsModalOpen(true)}
            onImportCSV={() => setIsCSVModalOpen(true)}
            onDeleteTransaction={deleteTransaction}
            onUpdateTransaction={updateTransaction}
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
        {isModalOpen && (
          <TransactionModal 
            categories={state.categories} 
            onClose={() => setIsModalOpen(false)}
            onSubmit={addTransaction}
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

