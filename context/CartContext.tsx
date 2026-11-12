'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';

type Ctx = {
  cart: Record<string, CartItem>;
  add: (p: Product, delta?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  items: CartItem[];
  qty: number;
  subtotal: number;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = 'pasar_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart, ready]);

  const add = (p: Product, delta = 1) => {
    setCart(prev => {
      const cur = prev[p.id] ? { ...prev[p.id] } : { ...p, jumlah: 0 };
      cur.jumlah += delta;
      const next = { ...prev };
      if (cur.jumlah <= 0) delete next[p.id];
      else next[p.id] = cur;
      return next;
    });
  };

  const remove = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clear = () => setCart({});

  const items = Object.values(cart);
  const qty = items.reduce((s, i) => s + i.jumlah, 0);
  const subtotal = items.reduce((s, i) => s + i.harga * i.jumlah, 0);

  return (
    <CartCtx.Provider value={{ cart, add, remove, clear, items, qty, subtotal }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};