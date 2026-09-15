'use client';

import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Edit3,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { getCategoryById, getPaymentMethodById } from '@/lib/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  transactions: Transaction[];
  onEdit: (item: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function TransactionList({ transactions, onEdit, onDelete, onAddNew }: Props) {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterPayment !== 'all' && (t.payment_method || 'transfer') !== filterPayment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cat = getCategoryById(t.category);
      const noteMatch = (t.note || '').toLowerCase().includes(q);
      const catMatch = cat.name.toLowerCase().includes(q);
      return noteMatch || catMatch;
    }
    return true;
  });

  // Group by date
  const groupedByDate: { [date: string]: Transaction[] } = {};
  filtered.forEach((t) => {
    if (!groupedByDate[t.date]) {
      groupedByDate[t.date] = [];
    }
    groupedByDate[t.date].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const formatted = `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear() + 543}`;

      if (dateStr === today) return `วันนี้ (${formatted})`;
      if (dateStr === yesterday) return `เมื่อวาน (${formatted})`;
      return formatted;
    } catch {
      return dateStr;
    }
  };

  const renderPaymentBadge = (methodId?: string) => {
    const pm = getPaymentMethodById(methodId);
    let colorClass = 'bg-sky-950/50 text-sky-400 border-sky-800/40';
    let IconComp = Smartphone;

    if (pm.id === 'credit_card') {
      colorClass = 'bg-purple-950/50 text-purple-300 border-purple-800/40';
      IconComp = CreditCard;
    } else if (pm.id === 'cash') {
      colorClass = 'bg-amber-950/50 text-amber-300 border-amber-800/40';
      IconComp = Banknote;
    } else if (pm.id === 'ewallet') {
      colorClass = 'bg-pink-950/50 text-pink-300 border-pink-800/40';
      IconComp = Wallet;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${colorClass}`}
      >
        <IconComp className="w-2.5 h-2.5 shrink-0" />
        <span>{pm.name}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === 'expense'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === 'income'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            รายรับ
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่ หรือโน้ต..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* Transaction List or Empty State */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">ยังไม่มีรายการในเดือนนี้</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            แตะปุ่มด้านล่างเพื่อเริ่มจดบันทึกรายรับหรือรายจ่ายรายการแรกของคุณได้ทันที
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการแรก
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const items = groupedByDate[dateStr];
            const dayExpense = items
              .filter((i) => i.type === 'expense')
              .reduce((sum, i) => sum + i.amount, 0);
            const dayIncome = items
              .filter((i) => i.type === 'income')
              .reduce((sum, i) => sum + i.amount, 0);

            return (
              <div key={dateStr} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
                {/* Date Header & Daily Subtotal */}
                <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{formatDateHeader(dateStr)}</span>
                  <div className="flex items-center gap-2 text-[11px] font-medium">
                    {dayIncome > 0 && <span className="text-emerald-400">+฿{formatMoney(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-rose-400">-฿{formatMoney(dayExpense)}</span>}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-800/50">
                  {items.map((item) => {
                    const cat = getCategoryById(item.category);
                    const isExpense = item.type === 'expense';

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* Category Icon & Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                                {cat.name}
                              </span>
                              {renderPaymentBadge(item.payment_method)}
                            </div>
                            {item.note && (
                              <span className="text-xs text-slate-400 block truncate mt-0.5">
                                {item.note}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <div className="text-right">
                            <span
                              className={`text-sm sm:text-base font-bold flex items-center justify-end gap-0.5 ${
                                isExpense ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {isExpense ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                              ฿{formatMoney(item.amount)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                              title="แก้ไขรายการ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`ต้องการลบรายการ "${cat.name} ฿${formatMoney(item.amount)}" ใช่หรือไม่?`)) {
                                  onDelete(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
