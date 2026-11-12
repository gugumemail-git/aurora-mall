'use client';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { rp } from '@/lib/format';

type Props = { storeId: string; onOpen: () => void };

export default function FloatingCart({ storeId, onOpen }: Props) {
  const { items } = useCart();
  const storeItems = items.filter(i => i.storeId === storeId);
  const qty = storeItems.reduce((s, i) => s + i.jumlah, 0);
  const total = storeItems.reduce((s, i) => s + i.harga * i.jumlah, 0);

  if (qty === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-md mx-auto">
      <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-slate-800 dark:border-slate-700 backdrop-blur-md animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="relative bg-emerald-500 p-2.5 rounded-xl text-white">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-white text-emerald-700 text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center">{qty}</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Estimasi</p>
            <p className="text-sm font-bold text-emerald-400">{rp(total)}</p>
          </div>
        </div>
        <button onClick={onOpen} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition">
          <span>Lihat Pesanan</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}