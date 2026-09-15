export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date format YYYY-MM-DD
  note?: string;
  payment_method?: string;
  created_at: string;
}

export interface PaymentMethodInfo {
  id: string;
  name: string;
  icon: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}
