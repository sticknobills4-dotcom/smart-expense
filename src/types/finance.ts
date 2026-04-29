export type AccountType = 'Cash' | 'Bank' | 'Wallet' | 'Savings';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: number;
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
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
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