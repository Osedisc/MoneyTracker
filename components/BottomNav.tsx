'use client';

import React from 'react';
import { LayoutDashboard, History, Plus, PieChart, Settings } from 'lucide-react';

export type TabType = 'overview' | 'history' | 'analytics';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
}

export function BottomNav({ activeTab, onTabChange, onOpenAddModal, onOpenSettings }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="flex items-center justify-around px-2 py-1.5 h-16 max-w-md mx-auto">
        {/* Overview Tab */}
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            activeTab === 'overview' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">ภาพรวม</span>
        </button>

        {/* History Tab */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            activeTab === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">ประวัติ</span>
        </button>

        {/* Floating Quick Add Button in Center */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform"
          title="บันทึกรายการใหม่"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors ${
            activeTab === 'analytics' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] font-medium">สถิติ</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center w-14 h-full gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">ตั้งค่า</span>
        </button>
      </div>
    </nav>
  );
}
