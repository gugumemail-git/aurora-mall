'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Toast = { id: number; msg: string; type: 'info' | 'success' | 'error' };
type Ctx = { show: (msg: string, type?: Toast['type']) => void };

const ToastCtx = createContext<Ctx>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const show = useCallback((msg: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setItems(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 2200);
  }, []);
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center">
        {items.map(t => (
          <div key={t.id} className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in ${
            t.type === 'error' ? 'bg-red-600 text-white' :
            t.type === 'success' ? 'bg-emerald-600 text-white' :
            'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
          }`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);