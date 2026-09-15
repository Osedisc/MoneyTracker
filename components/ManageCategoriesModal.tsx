'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { CategoryInfo, TransactionType } from '@/lib/types';
import {
  getCategoriesByType,
  saveCategory,
  deleteCategory,
  moveCategory,
  resetCategoriesToDefault,
} from '@/lib/categories';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from './CategoryIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged: () => void;
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
  '#84cc16', // Lime
  '#64748b', // Slate
];

export function ManageCategoriesModal({ isOpen, onClose, onCategoriesChanged }: Props) {
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [editingCat, setEditingCat] = useState<CategoryInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for create/edit
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('Coffee');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const categories = getCategoriesByType(activeType);

  const handleStartCreate = () => {
    setEditingCat(null);
    setFormName('');
    setFormIcon('Coffee');
    setFormColor(PRESET_COLORS[0]);
    setIsCreating(true);
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setIsCreating(false);
    setEditingCat(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCat) {
      // Update existing
      saveCategory({
        ...editingCat,
        name: formName.trim(),
        icon: formIcon,
        color: formColor,
        bgColor: `${formColor}20`,
      });
      setEditingCat(null);
    } else {
      // Create new
      const newId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      saveCategory({
        id: newId,
        name: formName.trim(),
        type: activeType,
        icon: formIcon,
        color: formColor,
        bgColor: `${formColor}20`,
      });
      setIsCreating(false);
    }

    onCategoriesChanged();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`ต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) {
      deleteCategory(id);
      if (editingCat?.id === id) setEditingCat(null);
      onCategoriesChanged();
    }
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    moveCategory(id, direction);
    onCategoriesChanged();
  };

  const handleResetDefaults = () => {
    if (confirm('ต้องการรีเซ็ตหมวดหมู่ทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (หมวดหมู่ที่คุณสร้างเองจะถูกล้าง)')) {
      resetCategoriesToDefault();
      setEditingCat(null);
      setIsCreating(false);
      onCategoriesChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            ⚙️ จัดการหมวดหมู่
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Segment Control */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800">
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveType('expense');
                setIsCreating(false);
                setEditingCat(null);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeType === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              หมวดหมู่รายจ่าย ({getCategoriesByType('expense').length})
            </button>
            <button
              onClick={() => {
                setActiveType('income');
                setIsCreating(false);
                setEditingCat(null);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeType === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              หมวดหมู่รายรับ ({getCategoriesByType('income').length})
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Create or Edit Form */}
          {(isCreating || editingCat) && (
            <form
              onSubmit={handleSaveForm}
              className="p-3.5 bg-slate-950 border border-emerald-500/50 rounded-2xl space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {editingCat ? `แก้ไข: ${editingCat.name}` : 'เพิ่มหมวดหมู่ใหม่'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCat(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  placeholder="เช่น ค่าเน็ต, ชานมไข่มุก, เลี้ยงแมว"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* Color choices */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">เลือกสี</label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-6 h-6 rounded-full shrink-0 transition-transform ${
                        formColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon choices */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">เลือกไอคอน</label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormIcon(iconName)}
                      className={`p-1.5 rounded-lg shrink-0 border transition-all ${
                        formIcon === iconName
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <CategoryIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!formName.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {editingCat ? 'บันทึกการแก้ไข' : 'บันทึกหมวดหมู่'}
              </button>
            </form>
          )}

          {/* Add Category Trigger */}
          {!isCreating && !editingCat && (
            <button
              onClick={handleStartCreate}
              className="w-full py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 border border-dashed border-slate-700 rounded-xl text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มหมวดหมู่{activeType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ใหม่
            </button>
          )}

          {/* Categories List with Move / Edit / Delete */}
          <div className="space-y-1.5 pt-1">
            {categories.map((cat, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === categories.length - 1;

              return (
                <div
                  key={cat.id}
                  className="px-3 py-2 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                >
                  {/* Category Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-200 truncate">{cat.name}</span>
                  </div>

                  {/* Actions: Move Up / Down, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(cat.id, 'up')}
                      disabled={isFirst}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded hover:bg-slate-800 transition-colors"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(cat.id, 'down')}
                      disabled={isLast}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded hover:bg-slate-800 transition-colors"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Reset defaults button */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <button
            onClick={handleResetDefaults}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            รีเซ็ตเป็นค่าเริ่มต้น
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
