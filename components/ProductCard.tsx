'use client';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { Product, CartItem } from '@/lib/types';
import { rp } from '@/lib/format';

type Props = {
  product: Product;
  inCart?: CartItem;
  onAdd: (delta: number) => void;
};

export default function ProductCard({ product, inCart, onAdd }: Props) {
  const qty = inCart?.jumlah || 0;
  // Cek status ketersediaan (jika undefined, anggap tersedia)
  const isAvailable = product.is_available !== false; 

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition hover:shadow-md ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
      <div>
        <div className="relative w-full h-32 mb-2.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image src={product.foto} alt={product.nama} fill sizes="300px" className="object-cover" />
          <span className="absolute top-1.5 left-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[9px] font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {product.kategori}
          </span>
          {/* Label Habis */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-xs">HABIS</span>
            </div>
          )}
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-1">{product.nama}</h3>
        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{product.deskripsi}</p>
        <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{rp(product.harga)}</p>
      </div>
      <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-800">
        {/* Jika habis, tombol tidak muncul */}
        {!isAvailable ? (
          <div className="w-full py-1.5 text-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl">
            Stok Habis
          </div>
        ) : qty === 0 ? (
          <button onClick={() => onAdd(1)}
            className="w-full py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition">
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        ) : (
          <div className="flex items-center justify-between bg-emerald-600 text-white rounded-xl p-1">
            <button onClick={() => onAdd(-1)} className="w-6 h-6 flex items-center justify-center font-bold text-sm hover:bg-emerald-700 rounded-lg">−</button>
            <span className="text-xs font-bold">
              {qty} {product.stok !== undefined && <span className="text-[10px] font-normal opacity-80">/ {product.stok}</span>}
            </span>
            <button onClick={() => onAdd(1)} disabled={qty >= (product.stok || 0)} className="w-6 h-6 flex items-center justify-center font-bold text-sm hover:bg-emerald-700 rounded-lg disabled:opacity-50">+</button>
          </div>
        )}
      </div>
    </div>
  );
}