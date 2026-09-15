import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction } from './types';

const STORAGE_KEY = 'expense_tracker_transactions';
const CONFIG_KEY = 'expense_tracker_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  if (typeof window === 'undefined') return null;

  // 1. Check local storage override first (allows user to enter via UI)
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    } catch {
      // ignore
    }
  }

  // 2. Check process.env fallback
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (typeof window === 'undefined') return;
  if (!config || !config.url || !config.anonKey) {
    localStorage.removeItem(CONFIG_KEY);
  } else {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfigHash = '';

export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  const hash = `${config.url}:::${config.anonKey}`;
  if (supabaseInstance && currentConfigHash === hash) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey);
    currentConfigHash = hash;
    return supabaseInstance;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(config.url, config.anonKey);
    const { error } = await client.from('transactions').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { success: false, message: 'เชื่อมต่อสำเร็จ แต่ยังไม่มีตาราง "transactions" กรุณารัน SQL schema ก่อนครับ' };
      }
      return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` };
    }
    return { success: true, message: 'เชื่อมต่อ Supabase สำเร็จ พร้อมใช้งาน!' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `เชื่อมต่อไม่สำเร็จ: ${message}` };
  }
}

// Local Storage helpers
export function getLocalTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return [];
  }
}

export function saveLocalTransactions(items: Transaction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error writing localStorage:', e);
  }
}

// Unified Data API (Syncs with Supabase if configured, falls back to local)
export async function loadTransactions(): Promise<{ data: Transaction[]; isCloud: boolean }> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Cache to local as backup
        saveLocalTransactions(data);
        return { data, isCloud: true };
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  return { data: getLocalTransactions(), isCloud: false };
}

export async function addTransaction(t: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const newTx: Transaction = {
    ...t,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('transactions').insert([newTx]).select().single();
      if (!error && data) {
        const local = getLocalTransactions();
        saveLocalTransactions([data, ...local.filter((item) => item.id !== data.id)]);
        return data;
      }
    } catch (e) {
      console.warn('Supabase insert failed, saving locally:', e);
    }
  }

  // Local fallback
  const local = getLocalTransactions();
  const updated = [newTx, ...local];
  saveLocalTransactions(updated);
  return newTx;
}

export async function updateTransaction(tx: Transaction): Promise<Transaction> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('transactions').update(tx).eq('id', tx.id).select().single();
      if (!error && data) {
        const local = getLocalTransactions();
        saveLocalTransactions(local.map((item) => (item.id === tx.id ? data : item)));
        return data;
      }
    } catch (e) {
      console.warn('Supabase update failed, updating locally:', e);
    }
  }

  const local = getLocalTransactions();
  const updated = local.map((item) => (item.id === tx.id ? tx : item));
  saveLocalTransactions(updated);
  return tx;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('transactions').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  const local = getLocalTransactions();
  const updated = local.filter((item) => item.id !== id);
  saveLocalTransactions(updated);
  return true;
}

// Sync all local transactions up to Supabase
export async function syncLocalToCloud(): Promise<{ count: number; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { count: 0, error: 'ยังไม่ได้ตั้งค่า Supabase' };

  const local = getLocalTransactions();
  if (local.length === 0) return { count: 0 };

  try {
    const { error } = await supabase.from('transactions').upsert(local, { onConflict: 'id' });
    if (error) throw error;
    return { count: local.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { count: 0, error: message };
  }
}
