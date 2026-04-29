"use client"

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp, 
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Account, Transaction, Budget } from '@/types/finance';

export function useFinance() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const qAccounts = query(collection(db, 'accounts'), where('userId', '==', user.uid));
    const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
    });

    const qTransactions = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    const qBudgets = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
      setLoading(false);
    });

    return () => {
      unsubAccounts();
      unsubTransactions();
      unsubBudgets();
    };
  }, [user]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;

    try {
      await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, 'accounts', data.accountId);
        const accountSnap = await transaction.get(accountRef);

        if (!accountSnap.exists()) throw new Error("Account does not exist!");

        const currentBalance = accountSnap.data().balance;
        let newBalance = currentBalance;

        if (data.type === 'expense') newBalance -= data.amount;
        if (data.type === 'income') newBalance += data.amount;
        if (data.type === 'transfer' && data.toAccountId) {
            newBalance -= data.amount;
            const toAccountRef = doc(db, 'accounts', data.toAccountId);
            const toAccountSnap = await transaction.get(toAccountRef);
            if (toAccountSnap.exists()) {
                const toNewBalance = toAccountSnap.data().balance + data.amount;
                transaction.update(toAccountRef, { balance: toNewBalance });
            }
        }

        transaction.update(accountRef, { balance: newBalance });
        await addDoc(collection(db, 'transactions'), {
          ...data,
          userId: user.uid,
          createdAt: Timestamp.now()
        });
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
      throw e;
    }
  };

  const addAccount = async (data: Omit<Account, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'accounts'), {
      ...data,
      userId: user.uid,
      createdAt: Date.now()
    });
  };

  const updateBudget = async (category: string, amount: number, month: string) => {
    if (!user) return;
    const existing = budgets.find(b => b.category === category && b.month === month);
    if (existing) {
        await updateDoc(doc(db, 'budgets', existing.id), { amount });
    } else {
        await addDoc(collection(db, 'budgets'), {
            userId: user.uid,
            category,
            amount,
            month
        });
    }
  };

  return {
    user,
    accounts,
    transactions,
    budgets,
    loading,
    addTransaction,
    addAccount,
    updateBudget
  };
}