'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Plus,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Transaction, TransactionType, CategoryInfo } from '@/lib/types';
import {
  getCategoriesByType,
  saveCategory,
  PAYMENT_METHODS,
} from '@/lib/categories';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from './CategoryIcon';
import { ManageCategoriesModal } from './ManageCategoriesModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'created_at'>, id?: string) => Promise<void>;
  editItem?: Transaction | null;
  onCategoriesChanged?: () => void;
}

const PRESET_COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#eab308', // Yellow
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export function TransactionFormModal({
  isOpen,
  onClose,
  onSave,
  editItem,
  onCategoriesChanged,
}: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('transfer');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category Management & Quick Add state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Coffee');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [currentCategories, setCurrentCategories] = useState<CategoryInfo[]>([]);

  const reloadCategories = () => {
    const list = getCategoriesByType(type);
    setCurrentCategories(list);
    return list;
  };

  useEffect(() => {
    if (isOpen) {
      const list = reloadCategories();
      setIsAddingCategory(false);
      setNewCatName('');

      if (editItem) {
        setType(editItem.type);
        setAmount(String(editItem.amount));
        setCategory(editItem.category);
        setPaymentMethod(editItem.payment_method || 'transfer');
        setDate(editItem.date);
        setNote(editItem.note || '');
      } else {
        const today = new Date().toISOString().split('T')[0];
        setType('expense');
        setAmount('');
        if (list.length > 0) setCategory(list[0].id);
        setPaymentMethod('transfer');
        setDate(today);
        setNote('');
      }
    }
  }, [isOpen, editItem]);

  // When type changes, load that type's categories
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const list = getCategoriesByType(newType);
    setCurrentCategories(list);
    if (!editItem || editItem.type !== newType) {
      if (list.length > 0) setCategory(list[0].id);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCat: CategoryInfo = {
      id: newId,
      name: newCatName.trim(),
      type,
      icon: newCatIcon,
      color: newCatColor,
      bgColor: `${newCatColor}20`,
    };

    saveCategory(newCat);
    const updated = reloadCategories();
    setCategory(newId);
    setIsAddingCategory(false);
    setNewCatName('');
    if (onCategoriesChanged) onCategoriesChanged();
  };

  const handleCategoriesUpdatedFromModal = () => {
    const updated = reloadCategories();
    if (updated.length > 0 && !updated.find((c) => c.id === category)) {
      setCategory(updated[0].id);
    }
    if (onCategoriesChanged) onCategoriesChanged();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          type,
          amount: Math.round(numAmount * 100) / 100,
          category,
          payment_method: paymentMethod,
          date: date || new Date().toISOString().split('T')[0],
          note: note.trim() || undefined,
        },
        editItem?.id
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'Banknote':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'Wallet':
        return <Wallet className="w-3.5 h-3.5" />;
      default:
        return <Smartphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {editItem ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {/* Type Segment Control (Expense / Income) */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                รายจ่าย
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                รายรับ
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">จำนวนเงิน (บาท)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">
                  ฿
                </span>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-950 border rounded-xl text-2xl font-extrabold focus:outline-none transition-colors ${
                    type === 'expense'
                      ? 'border-rose-900/60 focus:border-rose-500 text-rose-400'
                      : 'border-emerald-900/60 focus:border-emerald-500 text-emerald-400'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                ช่องทางการชำระ / รับเงิน
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {renderPaymentIcon(pm.icon)}
                      <span className="truncate">{pm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Grid & Actions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400">เลือกหมวดหมู่</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isAddingCategory ? 'ปิด' : 'เพิ่ม'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    title="แก้ไข ลบ หรือจัดลำดับหมวดหมู่"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    จัดการ
                  </button>
                </div>
              </div>

              {/* Inline Quick Category Creator */}
              {isAddingCategory && (
                <div className="mb-3 p-3 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-3 animate-in fade-in">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    สร้างหมวดหมู่{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}ใหม่
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="เช่น ค่ากาแฟ, ชานม, เติมเกม..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!newCatName.trim()}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      บันทึก
                    </button>
                  </div>

                  {/* Color choices */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    <span className="text-[11px] text-slate-400 shrink-0 mr-1">สี:</span>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`w-6 h-6 rounded-full shrink-0 transition-transform ${
                          newCatColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Icon choices */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    <span className="text-[11px] text-slate-400 shrink-0 mr-1">ไอคอน:</span>
                    {AVAILABLE_CATEGORY_ICONS.slice(0, 12).map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setNewCatIcon(iconName)}
                        className={`p-1.5 rounded-lg shrink-0 border transition-all ${
                          newCatIcon === iconName
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <CategoryIcon name={iconName} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {currentCategories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium leading-tight truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                วันที่ทำรายการ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                บันทึกช่วยจำ (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เช่น ข้าวกะเพราหมูกรอบ, กาแฟสตาบัคส์, รูดการ์ด KTC"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 pb-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 font-semibold rounded-xl text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                } disabled:opacity-50`}
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'กำลังบันทึก...' : editItem ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Full Categories Management Modal */}
      <ManageCategoriesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onCategoriesChanged={handleCategoriesUpdatedFromModal}
      />
    </>
  );
}
