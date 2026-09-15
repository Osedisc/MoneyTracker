'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Cloud, Database, Calendar } from 'lucide-react';

interface HeaderProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isCloud: boolean;
  onOpenSettings: () => void;
}

export function Header({ currentMonth, onMonthChange, isCloud, onOpenSettings }: HeaderProps) {
  const monthNamesThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const yearThai = currentMonth.getFullYear() + 543; // พ.ศ.
  const monthLabel = `${monthNamesThai[currentMonth.getMonth()]} ${yearThai}`;

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(next);
  };

  const handleCurrentMonth = () => {
    onMonthChange(new Date());
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand & Sync Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
            ฿
          </div>
          <div>
            <h1 className="text-base font-semibold text-white leading-tight flex items-center gap-1.5">
              กระเป๋าตังค์
            </h1>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              {isCloud ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Cloud className="w-3 h-3" /> ซิงค์ Supabase
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Database className="w-3 h-3" /> เก็บในเครื่อง
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Month Navigation */}
        <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/60 shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCurrentMonth}
            className="px-2.5 py-1 text-xs sm:text-sm font-medium text-slate-200 hover:text-white flex items-center gap-1.5"
            title="คลิกเพื่อกลับมาเดือนปัจจุบัน"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
            <span>{monthLabel}</span>
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          title="การตั้งค่าและฐานข้อมูล"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
