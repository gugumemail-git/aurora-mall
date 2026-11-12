'use client';
import Link from 'next/link';
import { X, Star, MapPin, Store as StoreIcon, Heart } from 'lucide-react';
import type { Store } from '@/lib/types';
import { isOpen } from '@/lib/store';
import { rp } from '@/lib/format';

type Props = { store: Store; open: boolean; onClose: () => void; fav: boolean; onToggleFav: () => void };

export default function StoreModal({ store, open, onClose, fav, onToggleFav }: Props) {
  if (!open) return null;
  const buka = isOpen(store);

  // URL Gambar Cadangan (Placeholder)
  const fallbackCover = 'https://placehold.co/600x300/e2e8f0/64748b?text=Cover+Toko';
  const fallbackLogo = 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Bagian Cover Modal */}
        <div className="relative">
          <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-800">
            <img 
              src={store.cover || fallbackCover} 
              onError={(e) => { e.currentTarget.src = fallbackCover; }} 
              alt={store.nama} 
              className="w-full h-full object-cover" 
            />
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md">
            <X className="w-4 h-4" />
          </button>
          
          {/* Bagian Logo Modal */}
          <div className="absolute -bottom-7 left-5 w-14 h-14 rounded-2xl overflow-hidden bg-white border-4 border-white dark:border-slate-900 shadow-lg">
            <img 
              src={store.logo || fallbackLogo} 
              onError={(e) => { e.currentTarget.src = fallbackLogo; }} 
              alt={store.nama} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        <div className="p-5 pt-9 flex-1 overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">{store.nama}</h2>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">{store.kategori}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${
              buka ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>{buka ? 'Buka' : 'Tutup'}</span>
          </div>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <b className="text-slate-800 dark:text-white">{store.rating}</b>
            </span>
            <span>({store.reviews} ulasan)</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{store.jarak} km</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">{store.deskripsi}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            {[
              ['Jam Buka', `${String(store.jam.buka).padStart(2,'0')}:00 - ${String(store.jam.tutup).padStart(2,'0')}:00`],
              ['Estimasi', store.eta],
              ['Ongkir', rp(store.ongkir)],
              ['Min. Order', rp(store.minOrder)]
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5">
                <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800 dark:text-white">{val}</p>
              </div>
            ))}
          </div>

          {store.promo && (
            <p className="mt-3 text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl p-2.5">
              🏷️ {store.promo}
            </p>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2">
          <button onClick={onToggleFav} className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center transition ${
            fav ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500'
          }`}>
            <Heart className={`w-5 h-5 ${fav ? 'fill-white' : ''}`} />
          </button>
          <Link href={`/toko/${store.slug}`}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm">
            <StoreIcon className="w-4 h-4" /> Kunjungi Toko
          </Link>
        </div>
      </div>
    </div>
  );
}