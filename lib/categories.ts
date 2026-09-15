import { CategoryInfo, PaymentMethodInfo, TransactionType } from './types';

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  { id: 'transfer', name: 'โอนเงิน / สแกน', icon: 'Smartphone' },
  { id: 'credit_card', name: 'บัตรเครดิต', icon: 'CreditCard' },
  { id: 'cash', name: 'เงินสด', icon: 'Banknote' },
  { id: 'ewallet', name: 'E-Wallet', icon: 'Wallet' },
];

export function getPaymentMethodById(id?: string): PaymentMethodInfo {
  return (
    PAYMENT_METHODS.find((p) => p.id === id) || {
      id: id || 'transfer',
      name:
        id === 'credit_card'
          ? 'บัตรเครดิต'
          : id === 'cash'
          ? 'เงินสด'
          : id === 'ewallet'
          ? 'E-Wallet'
          : 'โอนเงิน / สแกน',
      icon: 'Smartphone',
    }
  );
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหาร & เครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', bgColor: '#ffedd5' },
  { id: 'transport', name: 'เดินทาง & รถยนต์', type: 'expense', icon: 'Car', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'shopping', name: 'ช้อปปิ้ง & เสื้อผ้า', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'bills', name: 'บิล & ค่าน้ำไฟ', type: 'expense', icon: 'Receipt', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'home', name: 'บ้าน & ของใช้', type: 'expense', icon: 'Home', color: '#14b8a6', bgColor: '#ccfbf1' },
  { id: 'health', name: 'สุขภาพ & ยา', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'entertainment', name: 'บันเทิง & ท่องเที่ยว', type: 'expense', icon: 'Gamepad2', color: '#eab308', bgColor: '#fef9c3' },
  { id: 'education', name: 'การศึกษา', type: 'expense', icon: 'GraduationCap', color: '#6366f1', bgColor: '#e0e7ff' },
  { id: 'other_expense', name: 'อื่นๆ', type: 'expense', icon: 'CircleEllipsis', color: '#64748b', bgColor: '#f1f5f9' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน & ค่าจ้าง', type: 'income', icon: 'Wallet', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'freelance', name: 'ฟรีแลนซ์ & จ๊อบเสริม', type: 'income', icon: 'Briefcase', color: '#06b6d4', bgColor: '#cffafe' },
  { id: 'investment', name: 'ลงทุน & ดอกเบี้ย', type: 'income', icon: 'TrendingUp', color: '#84cc16', bgColor: '#ecfccb' },
  { id: 'bonus', name: 'โบนัส & ของขวัญ', type: 'income', icon: 'Gift', color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'CircleEllipsis', color: '#64748b', bgColor: '#f1f5f9' },
];

const CATEGORIES_STORAGE_KEY = 'expense_tracker_categories_unified_v2';

export function getAllCategories(): CategoryInfo[] {
  if (typeof window === 'undefined') {
    return [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  }
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      const initial = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  } catch {
    return [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  }
}

export function saveAllCategories(list: CategoryInfo[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list));
}

export function getCategoriesByType(type: TransactionType): CategoryInfo[] {
  return getAllCategories().filter((c) => c.type === type);
}

export function saveCategory(cat: CategoryInfo): CategoryInfo[] {
  const list = getAllCategories();
  const index = list.findIndex((c) => c.id === cat.id);
  let updated: CategoryInfo[];
  if (index >= 0) {
    updated = list.map((c) => (c.id === cat.id ? cat : c));
  } else {
    updated = [...list, cat];
  }
  saveAllCategories(updated);
  return updated;
}

export function deleteCategory(id: string): CategoryInfo[] {
  const list = getAllCategories();
  const updated = list.filter((c) => c.id !== id);
  saveAllCategories(updated);
  return updated;
}

export function moveCategory(id: string, direction: 'up' | 'down'): CategoryInfo[] {
  const list = getAllCategories();
  const target = list.find((c) => c.id === id);
  if (!target) return list;

  // Filter only same type items to maintain relative order within type
  const sameTypeIndices: number[] = [];
  list.forEach((c, idx) => {
    if (c.type === target.type) sameTypeIndices.push(idx);
  });

  const currentSameTypePos = sameTypeIndices.findIndex((idx) => list[idx].id === id);
  if (currentSameTypePos < 0) return list;

  const targetSameTypePos = direction === 'up' ? currentSameTypePos - 1 : currentSameTypePos + 1;
  if (targetSameTypePos < 0 || targetSameTypePos >= sameTypeIndices.length) {
    return list; // Can't move beyond bounds
  }

  const indexA = sameTypeIndices[currentSameTypePos];
  const indexB = sameTypeIndices[targetSameTypePos];

  const updated = [...list];
  const temp = updated[indexA];
  updated[indexA] = updated[indexB];
  updated[indexB] = temp;

  saveAllCategories(updated);
  return updated;
}

export function resetCategoriesToDefault(): CategoryInfo[] {
  const initial = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  saveAllCategories(initial);
  return initial;
}

export function getCategoryById(id: string): CategoryInfo {
  const all = getAllCategories();
  return (
    all.find((c) => c.id === id) || {
      id,
      name: id,
      type: 'expense',
      icon: 'CircleEllipsis',
      color: '#64748b',
      bgColor: '#f1f5f9',
    }
  );
}

// Backward compatibility helper
export function getCustomCategories(): CategoryInfo[] {
  return getAllCategories();
}
export function saveCustomCategory(cat: CategoryInfo): CategoryInfo[] {
  return saveCategory(cat);
}
