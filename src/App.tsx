/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFinance } from './hooks/useFinance';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Reconcile from './components/Reconcile';
import Reports from './components/Reports';
import BudgetView from './components/BudgetView';
import CategoryManager from './components/CategoryManager';
import TransactionModal from './components/TransactionModal';
import CSVImportModal from './components/CSVImportModal';

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
    totalBalance 
  } = useFinance();

  const handleCSVImport = (transactions: any[]) => {
    transactions.forEach(t => addTransaction(t));
    setIsCSVModalOpen(false);
  };

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
    >
      {renderContent()}
      
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
    </Layout>
  );
}

