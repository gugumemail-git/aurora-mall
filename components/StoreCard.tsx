'use client';
import { Star, MapPin, Clock, Heart, Tag } from 'lucide-react';
import type { Store } from '@/lib/types';
import { isOpen } from '@/lib/store';

type Props = { store: Store; fav: boolean; onToggleFav: () => void; onClick: () => void };

export default function StoreCard({ store, fav, onToggleFav, onClick }: Props) {
  const open = isOpen(store);
  
  // URL Gambar Cadangan (Placeholder) jika gambar asli error/kosong
  const fallbackCover = 'https://placehold.co/600x300/e2e8f0/64748b?text=Cover+Toko';
  const fallbackLogo = 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';

  return (
    <div onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer">
      
      {/* Bagian Cover Toko */}
      <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
        <img 
          src={store.cover || fallbackCover} 
          onError={(e) => { e.currentTarget.src = fallbackCover; }} 
          alt={store.nama} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        
        <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${open ? 'bg-emerald-500 text-white' : 'bg-slate-700/80 text-white'}`}>
          {open ? '● Buka' : '● Tutup'}
        </span>
        
        {store.promo && (
          <span className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">PROMO</span>
        )}
        
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(); }}
          className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur flex items-center justify-center shadow-md transition ${
            fav ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300'
          }`}>
          <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Bagian Info Toko */}
      <div className="p-3.5 flex gap-3">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 -mt-8 border-4 border-white dark:border-slate-900 shadow-md bg-white">
          <img 
            src={store.logo || fallbackLogo} 
            onError={(e) => { e.currentTarget.src = fallbackLogo; }} 
            alt={store.nama} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{store.nama}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{store.kategori}</p>
          <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <b className="text-slate-800 dark:text-white">{store.rating}</b>
            </span>
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{store.jarak} km</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{store.eta}</span>
          </div>
          {store.promo && (
            <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-1.5 line-clamp-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />{store.promo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}