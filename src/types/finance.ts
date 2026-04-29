export type AccountType = 'Cash' | 'Bank' | 'Wallet' | 'Savings' | 'Credit Card' | 'Investment';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string
  description: string;
  toAccountId?: string; // For transfers
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category: string;
  amount: number;
  spentAmount: number;
  month: string; // YYYY-MM
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  startDate: string;
  status: 'active' | 'achieved' | 'cancelled';
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  isRecurring: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Rent & Utilities',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Health',
    'Education',
    'Travel',
    'Insurance',
    'Miscellaneous'
  ],
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
    'Refunds',
    'Other'
  ]
};
