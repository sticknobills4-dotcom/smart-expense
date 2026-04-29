"use client"

import { useMemo } from 'react';
import { collection, query, orderBy, doc } from 'firebase/firestore';
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

  const remindersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'reminders');
  }, [firestore, user?.uid]);

  const { data: accounts = [], isLoading: accountsLoading } = useCollection<Account>(accountsQuery);
  const { data: transactions = [], isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);
  const { data: budgets = [], isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);
  const { data: savingsGoals = [], isLoading: goalsLoading } = useCollection<SavingsGoal>(savingsGoalsQuery);
  const { data: reminders = [], isLoading: remindersLoading } = useCollection<Reminder>(remindersQuery);

  const loading = isUserLoading || accountsLoading || transactionsLoading || budgetsLoading || goalsLoading || remindersLoading;

  // Transaction Mutations
  const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !firestore) return;
    const colRef = collection(firestore, 'users', user.uid, 'transactions');
    addDocumentNonBlocking(colRef, {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });

    // Update account balance
    const account = accounts?.find(a => a.id === data.accountId);
    if (account) {
      const accountRef = doc(firestore, 'users', user.uid, 'accounts', data.accountId);
      let newBalance = account.balance;
      if (data.type === 'expense') newBalance -= data.amount;
      if (data.type === 'income') newBalance += data.amount;
      if (data.type === 'transfer') {
        newBalance -= data.amount;
        if (data.toAccountId) {
          const toAcc = accounts?.find(a => a.id === data.toAccountId);
          if (toAcc) {
            const toRef = doc(firestore, 'users', user.uid, 'accounts', data.toAccountId);
            updateDocumentNonBlocking(toRef, { balance: toAcc.balance + data.amount });
          }
        }
      }
      updateDocumentNonBlocking(accountRef, { balance: newBalance });
    }
  };

  const deleteTransaction = (id: string) => {
    if (!user || !firestore) return;
    const t = transactions?.find(item => item.id === id);
    if (!t) return;

    // Reverse balance update
    const account = accounts?.find(a => a.id === t.accountId);
    if (account) {
      const accountRef = doc(firestore, 'users', user.uid, 'accounts', t.accountId);
      let newBalance = account.balance;
      if (t.type === 'expense') newBalance += t.amount;
      if (t.type === 'income') newBalance -= t.amount;
      if (t.type === 'transfer') {
        newBalance += t.amount;
        if (t.toAccountId) {
          const toAcc = accounts?.find(a => a.id === t.toAccountId);
          if (toAcc) {
            const toRef = doc(firestore, 'users', user.uid, 'accounts', t.toAccountId);
            updateDocumentNonBlocking(toRef, { balance: toAcc.balance - t.amount });
          }
        }
      }
      updateDocumentNonBlocking(accountRef, { balance: newBalance });
    }

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
    const existing = budgets?.find(b => b.category === category && b.month === month);
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

  const updateSavingsGoal = (id: string, currentAmount: number) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'savingsGoals', id);
    updateDocumentNonBlocking(docRef, { currentAmount });
  };

  return {
    user,
    accounts,
    transactions,
    budgets,
    savingsGoals,
    reminders,
    loading,
    addTransaction,
    deleteTransaction,
    addAccount,
    deleteAccount,
    updateBudget,
    addSavingsGoal,
    updateSavingsGoal
  };
}
