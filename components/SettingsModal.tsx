'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Check,
  AlertCircle,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Smartphone,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  syncLocalToCloud,
  getLocalTransactions,
  saveLocalTransactions,
} from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';
import { ManageCategoriesModal } from './ManageCategoriesModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export function SettingsModal({ isOpen, onClose, onConfigUpdated }: Props) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isManageCatOpen, setIsManageCatOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      if (current) {
        setUrl(current.url);
        setAnonKey(current.anonKey);
      }
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      saveSupabaseConfig(null);
      setStatusMsg({ type: 'success', text: 'ยกเลิกการเชื่อมต่อแล้ว กลับมาใช้โหมดเก็บข้อมูลในเครื่อง' });
      onConfigUpdated();
      return;
    }

    setIsTesting(true);
    setStatusMsg(null);

    const config = { url: url.trim(), anonKey: anonKey.trim() };
    const res = await testSupabaseConnection(config);

    setIsTesting(false);
    if (res.success) {
      saveSupabaseConfig(config);
      setStatusMsg({ type: 'success', text: res.message });
      onConfigUpdated();
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    const res = await syncLocalToCloud();
    setIsSyncing(false);
    if (res.error) {
      alert(`ซิงค์ไม่สำเร็จ: ${res.error}`);
    } else {
      alert(`ซิงค์ข้อมูลขึ้น Supabase สำเร็จเรียบร้อย (${res.count} รายการ)`);
      onConfigUpdated();
    }
  };

  const handleExportCSV = () => {
    const items = getLocalTransactions();
    if (items.length === 0) {
      alert('ยังไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = ['id', 'date', 'type', 'category', 'category_name', 'payment_method', 'amount', 'note'];
    const rows = items.map((t) => {
      const cat = getCategoryById(t.category);
      return [
        t.id,
        t.date,
        t.type,
        t.category,
        `"${cat.name.replace(/"/g, '""')}"`,
        `"${t.payment_method || 'transfer'}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expense_tracker_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleClearAll = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมดในเครื่อง? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      saveLocalTransactions([]);
      onConfigUpdated();
      alert('ล้างข้อมูลเรียบร้อยแล้ว');
    }
  };

  const sqlSchemaCode = `-- คัดลอกโค้ดนี้ไปรันใน Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for personal" ON public.transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tx_date ON public.transactions(date DESC);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">ตั้งค่าระบบ & Cloud Sync</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* iOS / iPad PWA Tip */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-800/40 rounded-xl p-3.5 flex gap-3 text-emerald-200">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">วิธีติดตั้งบน iPhone / iPad</span>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                เปิดเว็บนี้บน Safari กดปุ่มแชร์ <strong>Share (ปุ่มสี่เหลี่ยมลูกศรชี้ขึ้น)</strong> แล้วเลือก{' '}
                <strong>&quot;เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)&quot;</strong> จะได้แอปเต็มจอสวยงาม ไร้แถบ Safari ทันที!
              </p>
            </div>
          </div>

          {/* Supabase Connection Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-200">เชื่อมต่อ Supabase (ซิงค์ข้ามเครื่อง)</label>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  เปิด Supabase <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                นำ Project URL และ Anon Key จากหน้า Settings &gt; API ของ Supabase มาใส่ที่นี่ เพื่อให้ข้อมูลบน Web, iPhone, iPad ซิงค์กันทันที
              </p>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Project URL</label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Anon Public Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isTesting ? 'กำลังตรวจสอบ...' : 'บันทึก & ทดสอบเชื่อมต่อ'}
              </button>

              <button
                type="button"
                onClick={handleSyncData}
                disabled={isSyncing}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="อัปโหลดข้อมูลจากเครื่องนี้ขึ้น Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                ซิงค์ข้อมูล
              </button>
            </div>
          </form>

          {/* SQL Schema helper */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 text-xs">SQL สำหรับสร้างตารางบน Supabase</span>
              <button
                onClick={handleCopySql}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedSql ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด SQL'}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 overflow-x-auto max-h-28">
              {sqlSchemaCode}
            </pre>
          </div>

          {/* Categories Management */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <span className="font-semibold text-slate-200 text-xs block">หมวดหมู่รายรับ-รายจ่าย</span>
            <button
              type="button"
              onClick={() => setIsManageCatOpen(true)}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              จัดการหมวดหมู่ (แก้ไข / ลบ / จัดลำดับ)
            </button>
          </div>

          {/* Export & Data Management */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <span className="font-semibold text-slate-200 text-xs block">จัดการข้อมูลสำรอง (Backup)</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExportCSV}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                ส่งออกเป็นไฟล์ CSV
              </button>
              <button
                onClick={handleClearAll}
                className="py-2.5 px-3 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-rose-900/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้างข้อมูลในเครื่อง
              </button>
            </div>
          </div>
        </div>
      </div>

      <ManageCategoriesModal
        isOpen={isManageCatOpen}
        onClose={() => setIsManageCatOpen(false)}
        onCategoriesChanged={() => {
          onConfigUpdated();
        }}
      />
    </div>
  );
}
