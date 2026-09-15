'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { MonthSummary } from '@/lib/types';

interface Props {
  summary: MonthSummary;
}

export function SummaryCard({ summary }: Props) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const expensePercent =
    summary.income > 0 ? Math.min(Math.round((summary.expense / summary.income) * 100), 100) : 0;

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Top: Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700/60">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            เงินคงเหลือสุทธิ
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
            ฿{formatMoney(summary.balance)}
          </div>
        </div>

        {summary.income > 0 && (
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">ใช้จ่ายไปแล้ว</span>
            <div className="text-xs font-semibold text-slate-200 mt-0.5">
              {expensePercent}% ของรายรับ
            </div>
            <div className="w-32 sm:w-28 h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  expensePercent > 80 ? 'bg-rose-500' : expensePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${expensePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Income and Expense stats */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        {/* Income Card */}
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-emerald-300/80 block truncate">รายรับ</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 truncate block">
              +฿{formatMoney(summary.income)}
            </span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-rose-300/80 block truncate">รายจ่าย</span>
            <span className="text-sm sm:text-base font-bold text-rose-400 truncate block">
              -฿{formatMoney(summary.expense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
