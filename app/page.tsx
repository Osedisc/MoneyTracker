'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  History,
  PieChart,
} from 'lucide-react';
import { Transaction, MonthSummary } from '@/lib/types';
import {
  loadTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  saveLocalTransactions,
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionList } from '@/components/TransactionList';
import { AnalyticsView } from '@/components/AnalyticsView';
import { TransactionFormModal } from '@/components/TransactionFormModal';
import { SettingsModal } from '@/components/SettingsModal';
import { BottomNav, TabType } from '@/components/BottomNav';

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load transactions on mount
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const { data, isCloud: cloudActive } = await loadTransactions();
      setTransactions(data);
      setIsCloud(cloudActive);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter transactions by selected month (YYYY-MM)
  const currentMonthKey = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, [currentMonth]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthKey));
  }, [transactions, currentMonthKey]);

  // Compute month summary
  const summary: MonthSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    monthTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [monthTransactions]);

  // Handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'created_at'>,
    id?: string
  ) => {
    if (id) {
      const original = transactions.find((t) => t.id === id);
      if (original) {
        const updated = await updateTransaction({
          ...original,
          ...data,
        });
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } else {
      const created = await addTransaction(data);
      setTransactions((prev) => [created, ...prev]);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEdit = (item: Transaction) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  // Add Demo Sample Data for instant delight
  const handleLoadDemoData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    const demoItems: Transaction[] = [
      {
        id: 'demo_1',
        type: 'income',
        amount: 35000,
        category: 'salary',
        payment_method: 'transfer',
        date: twoDaysAgo,
        note: 'เงินเดือนประจำงวด',
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo_2',
        type: 'expense',
        amount: 150,
        category: 'food',
        payment_method: 'transfer',
        date: today,
        note: 'กะเพราไข่ดาว + กาแฟอเมริกาโน่',
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo_3',
        type: 'expense',
        amount: 45,
        category: 'transport',
        payment_method: 'transfer',
        date: today,
        note: 'ค่ารถไฟฟ้า BTS',
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo_4',
        type: 'expense',
        amount: 1200,
        category: 'shopping',
        payment_method: 'credit_card',
        date: yesterday,
        note: 'เสื้อยืด Uniqlo',
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo_5',
        type: 'expense',
        amount: 850,
        category: 'bills',
        payment_method: 'credit_card',
        date: yesterday,
        note: 'ค่าเน็ตบ้าน AIS Fibre',
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo_6',
        type: 'income',
        amount: 3000,
        category: 'freelance',
        payment_method: 'transfer',
        date: yesterday,
        note: 'เขียนโปรแกรมระบบย่อย',
        created_at: new Date().toISOString(),
      },
    ];

    saveLocalTransactions(demoItems);
    setTransactions(demoItems);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        isCloud={isCloud}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Empty database helper banner */}
        {transactions.length === 0 && !isLoading && (
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ยินดีต้อนรับสู่แอปรายรับ-รายจ่าย</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  เริ่มต้นบันทึกได้ทันที หรือคลิกปุ่มนี้เพื่อลองใส่ข้อมูลจำลองดูตัวอย่างหน้าตาแอป
                </p>
              </div>
            </div>
            <button
              onClick={handleLoadDemoData}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
            >
              <span>ใส่ข้อมูลตัวอย่าง</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Summary Card (Always Visible on Web & iPad, and on Overview tab on Mobile) */}
        <SummaryCard summary={summary} />

        {/* Desktop / iPad View (Side-by-side or stacked cleanly) */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-6 items-start">
          {/* Left Column: Transaction List (7 cols) */}
          <div className="sm:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                รายการในเดือนนี้
              </h2>
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                เพิ่มรายการ
              </button>
            </div>

            <TransactionList
              transactions={monthTransactions}
              onEdit={handleEdit}
              onDelete={handleDeleteTransaction}
              onAddNew={handleOpenAdd}
            />
          </div>

          {/* Right Column: Analytics & Quick info (5 cols) */}
          <div className="sm:col-span-5 space-y-4">
            <AnalyticsView transactions={monthTransactions} />
          </div>
        </div>

        {/* Mobile View (iPhone): Tab-based UI */}
        <div className="sm:hidden space-y-4">
          {activeTab === 'overview' && (
            <>
              {/* Quick Action Button */}
              <button
                onClick={handleOpenAdd}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-transform active:scale-[0.98]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                บันทึกรายรับ / รายจ่าย ด่วน
              </button>

              {/* Analytics preview on mobile */}
              <AnalyticsView transactions={monthTransactions} />

              {/* Recent transactions preview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    รายการล่าสุด
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-emerald-400 font-semibold flex items-center gap-1"
                  >
                    ดูทั้งหมด ({monthTransactions.length}) <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <TransactionList
                  transactions={monthTransactions.slice(0, 5)}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTransaction}
                  onAddNew={handleOpenAdd}
                />
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  ประวัติทั้งหมดในเดือนนี้
                </h2>
              </div>
              <TransactionList
                transactions={monthTransactions}
                onEdit={handleEdit}
                onDelete={handleDeleteTransaction}
                onAddNew={handleOpenAdd}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <AnalyticsView transactions={monthTransactions} />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Transaction Add/Edit Modal */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTransaction}
        editItem={editingItem}
      />

      {/* Settings & Cloud Sync Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={refreshData}
      />
    </div>
  );
}
