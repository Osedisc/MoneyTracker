'use client';

import React, { useState } from 'react';
import { PieChart, TrendingDown, CreditCard, Layers } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { getCategoryById, getPaymentMethodById } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  transactions: Transaction[];
}

export function AnalyticsView({ transactions }: Props) {
  const [viewMode, setViewMode] = useState<'category' | 'payment'>('category');

  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryTotals: { [catId: string]: number } = {};
  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.keys(categoryTotals)
    .map((catId) => ({
      catId,
      amount: categoryTotals[catId],
      percent: totalExpense > 0 ? Math.round((categoryTotals[catId] / totalExpense) * 100) : 0,
      info: getCategoryById(catId),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Group by payment method
  const paymentTotals: { [pmId: string]: number } = {};
  expenses.forEach((t) => {
    const pm = t.payment_method || 'transfer';
    paymentTotals[pm] = (paymentTotals[pm] || 0) + t.amount;
  });

  const sortedPayments = Object.keys(paymentTotals)
    .map((pmId) => ({
      pmId,
      amount: paymentTotals[pmId],
      percent: totalExpense > 0 ? Math.round((paymentTotals[pmId] / totalExpense) * 100) : 0,
      info: getPaymentMethodById(pmId),
    }))
    .sort((a, b) => b.amount - a.amount);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">วิเคราะห์การใช้จ่าย</h3>
        </div>

        {/* Switcher Tab */}
        <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('category')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              viewMode === 'category'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            หมวดหมู่
          </button>
          <button
            onClick={() => setViewMode('payment')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              viewMode === 'payment'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            ช่องทางจ่าย
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{viewMode === 'category' ? 'แบ่งตามหมวดหมู่' : 'แบ่งตามช่องทางชำระเงิน'}</span>
        <span className="text-rose-400 font-semibold flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          รายจ่ายรวม ฿{formatMoney(totalExpense)}
        </span>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'category' ? (
        sortedCategories.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">ยังไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map((item) => (
              <div key={item.catId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.info.color}20`, color: item.info.color }}
                    >
                      <CategoryIcon name={item.info.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-200 font-medium truncate">{item.info.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 font-medium">{item.percent}%</span>
                    <span className="text-white font-bold">฿{formatMoney(item.amount)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.info.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      ) : sortedPayments.length === 0 ? (
        <p className="text-center text-xs text-slate-500 py-6">ยังไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
      ) : (
        <div className="space-y-3">
          {sortedPayments.map((item) => {
            const isCard = item.pmId === 'credit_card';
            const barColor = isCard ? '#c084fc' : item.pmId === 'cash' ? '#f59e0b' : '#38bdf8';

            return (
              <div key={item.pmId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    {item.info.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 font-medium">{item.percent}%</span>
                    <span className="text-white font-bold">฿{formatMoney(item.amount)}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
