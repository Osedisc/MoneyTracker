-- ==========================================================
-- Supabase Schema สำหรับแอปบันทึกรายรับ-รายจ่าย (Expense Tracker)
-- วิธีใช้: นำโค้ดนี้ไปวางในเมนู SQL Editor ของ Supabase แล้วกด RUN
-- ==========================================================

-- 1. สร้างตาราง transactions (มีคอลัมน์ payment_method รองรับ บัตรเครดิต, โอนเงิน, เงินสด)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT DEFAULT 'transfer',
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- หากเคยสร้างตารางไว้ก่อนหน้า คำสั่งนี้จะเพิ่มคอลัมน์ payment_method ให้อัตโนมัติ:
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'transfer';

-- 2. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. กำหนด Policy อนุญาตให้อ่าน/เขียนข้อมูลได้ (สำหรับใช้งานส่วนตัว)
DROP POLICY IF EXISTS "Allow all operations for personal use" ON public.transactions;
CREATE POLICY "Allow all operations for personal use" ON public.transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. สร้าง Index เพื่อความรวดเร็วในการโหลดข้อมูล
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment ON public.transactions(payment_method);

-- สำเร็จ! ตารางพร้อมรับข้อมูลจาก Web, iPhone และ iPad แล้ว
