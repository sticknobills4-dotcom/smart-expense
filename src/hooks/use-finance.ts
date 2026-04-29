
"use client"

import { useMemo } from 'react';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  setDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';
import { Account, Transaction, Budget, SavingsGoal, Reminder } from '@/types/finance';

export function useFinance() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Memoized Queries for real-time collections
  const accountsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'accounts');
  }, [firestore, user?.uid]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, user?.uid]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'budgets');
  }, [firestore, user?.uid]);

  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'savingsGoals');
  }, [firestore, user?.uid]);

  const { data: accounts = [], isLoading: accountsLoading } = useCollection<Account>(accountsQuery);
  const { data: transactions = [], isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);
  const { data: budgets = [], isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);
  const { data: savingsGoals = [], isLoading: goalsLoading } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const loading = isUserLoading || accountsLoading || transactionsLoading || budgetsLoading || goalsLoading;

  // Helper to update account balances
  const adjustBalance = (accountId: string, amount: number) => {
    if (!user || !firestore) return;
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      const accountRef = doc(firestore, 'users', user.uid, 'accounts', accountId);
      updateDocumentNonBlocking(accountRef, { balance: account.balance + amount });
    }
  };

  const applyTransactionBalance = (t: Partial<Transaction>, multiply: number = 1) => {
    if (t.type === 'expense') {
      adjustBalance(t.accountId!, -t.amount! * multiply);
    } else if (t.type === 'income') {
      adjustBalance(t.accountId!, t.amount! * multiply);
    } else if (t.type === 'transfer') {
      adjustBalance(t.accountId!, -t.amount! * multiply);
      if (t.toAccountId) {
        adjustBalance(t.toAccountId, t.amount! * multiply);
      }
    }
  };

  // Transaction Mutations
  const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !firestore) return;
    const colRef = collection(firestore, 'users', user.uid, 'transactions');
    addDocumentNonBlocking(colRef, {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
    applyTransactionBalance(data, 1);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    if (!user || !firestore) return;
    const old = transactions.find(t => t.id === id);
    if (!old) return;

    // 1. Reverse old balance
    applyTransactionBalance(old, -1);
    
    // 2. Update Doc
    const docRef = doc(firestore, 'users', user.uid, 'transactions', id);
    updateDocumentNonBlocking(docRef, { ...data, updatedAt: new Date().toISOString() });

    // 3. Apply new balance
    const merged = { ...old, ...data };
    applyTransactionBalance(merged, 1);
  };

  const deleteTransaction = (id: string) => {
    if (!user || !firestore) return;
    const t = transactions.find(item => item.id === id);
    if (!t) return;

    // Reverse balance update
    applyTransactionBalance(t, -1);

    const docRef = doc(firestore, 'users', user.uid, 'transactions', id);
    deleteDocumentNonBlocking(docRef);
  };

  // Account Mutations
  const addAccount = (data: Omit<Account, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !firestore) return;
    const colRef = collection(firestore, 'users', user.uid, 'accounts');
    addDocumentNonBlocking(colRef, {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const deleteAccount = (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'accounts', id);
    deleteDocumentNonBlocking(docRef);
  };

  // Budget Mutations
  const updateBudget = (category: string, amount: number, month: string) => {
    if (!user || !firestore) return;
    const existing = budgets.find(b => b.category === category && b.month === month);
    if (existing) {
      const docRef = doc(firestore, 'users', user.uid, 'budgets', existing.id);
      updateDocumentNonBlocking(docRef, { amount });
    } else {
      const colRef = collection(firestore, 'users', user.uid, 'budgets');
      addDocumentNonBlocking(colRef, {
        userId: user.uid,
        category,
        amount,
        month,
        spentAmount: 0,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Savings Goal Mutations
  const addSavingsGoal = (data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!user || !firestore) return;
    const colRef = collection(firestore, 'users', user.uid, 'savingsGoals');
    addDocumentNonBlocking(colRef, {
      ...data,
      userId: user.uid,
      status: 'active',
      createdAt: new Date().toISOString()
    });
  };

  const updateSavingsGoal = (id: string, data: Partial<SavingsGoal>) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'savingsGoals', id);
    updateDocumentNonBlocking(docRef, data);
  };

  const deleteSavingsGoal = (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'savingsGoals', id);
    deleteDocumentNonBlocking(docRef);
  };

  return {
    user,
    accounts,
    transactions,
    budgets,
    savingsGoals,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    deleteAccount,
    updateBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal
  };
}
