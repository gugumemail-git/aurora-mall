'use client';
import { useMemo, useState, useEffect } from 'react';
import { Search, Sparkles, Flame, Heart, MapPin } from 'lucide-react';
import { STORES } from '@/lib/data';
import { isOpen } from '@/lib/store';
import StoreCard from '@/components/StoreCard';
import StoreModal from '@/components/StoreModal';
import ThemeToggle from '@/components/ThemeToggle';

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'open', label: '🟢 Buka' },
  { key: 'promo', label: '🏷️ Promo' },
  { key: 'top', label: '⭐ Rating 4.5+' },
  { key: 'near', label: '📍 Terdekat' }
] as const;

const QUICK = [
  { q: 'kopi', label: '☕ Kopi' },
  { q: 'nasi', label: '🍚 Nasi' },
  { q: 'snack', label: '🍟 Snack' },
  { q: 'dessert', label: '🍰 Dessert' }
];

type FilterKey = typeof FILTERS[number]['key'];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<'populer' | 'rating' | 'near' | 'promo'>('populer');
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pasar_fav');
      if (saved) setFavs(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleFav = (id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('pasar_fav', JSON.stringify(next));
      return next;
    });
  };

  const categories = useMemo(() => ['all', ...new Set(STORES.map(s => s.kategori))], []);

  const filtered = useMemo(() => {
    let list = [...STORES];
    if (category !== 'all') list = list.filter(s => s.kategori === category);
    if (filter === 'open') list = list.filter(isOpen);
    if (filter === 'promo') list = list.filter(s => s.promo);
    if (filter === 'top') list = list.filter(s => s.rating >= 4.5);
    if (filter === 'near') list = list.filter(s => s.jarak <= 1);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.nama.toLowerCase().includes(q) ||
        s.kategori.toLowerCase().includes(q) ||
        s.deskripsi.toLowerCase().includes(q)
      );
    }
    if (favOnly) list = list.filter(s => favs.includes(s.id));
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'near') list.sort((a, b) => a.jarak - b.jarak);
    else if (sort === 'promo') list.sort((a, b) => (b.promo ? 1 : 0) - (a.promo ? 1 : 0));
    else list.sort((a, b) => b.populer - a.populer);
    return list;
  }, [category, filter, search, sort, favOnly, favs]);

  const promos = STORES.filter(s => s.promo);
  const activeStore = activeId ? STORES.find(s => s.id === activeId) : null;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/30">P</div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Pasar Kita</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Jakarta Selatan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFavOnly(v => !v)} aria-label="Favorit"
              className={`relative p-2.5 rounded-xl transition ${
                favOnly ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
              <Heart className={`w-5 h-5 ${favOnly ? 'fill-white' : ''}`} />
              {favs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {favs.length}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 pb-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 mb-5 shadow-xl shadow-emerald-600/20">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <p className="text-emerald-100 text-xs font-semibold mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Selamat datang di pasar digital
            </p>
            <h2 className="text-white text-2xl font-extrabold leading-tight mb-4">Mau cari apa<br />hari ini?</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari toko, makanan, minuman..."
                className="w-full pl-10 pr-4 py-3 text-xs bg-white dark:bg-slate-900 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg" />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK.map(q => (
                <button key={q.q} onClick={() => setSearch(q.q)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold rounded-full backdrop-blur transition">
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* KATEGORI */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Kategori</h3>
            <button onClick={() => { setCategory('all'); setFilter('all'); setSearch(''); setSort('populer'); setFavOnly(false); }}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Reset</button>
          </div>
          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 flex gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition ${
                  c === category ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}>
                {c === 'all' ? '🌟 Semua' : c}
              </button>
            ))}
          </div>
        </section>

        {/* PROMO */}
        {promos.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" /> Lagi Promo
              </h3>
            </div>
            <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 flex gap-3 pb-1">
              {promos.map(s => (
                <div key={s.id} onClick={() => setActiveId(s.id)}
                  className="shrink-0 w-56 bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                    <img src={s.cover} alt={s.nama} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">PROMO</span>
                  </div>
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-white line-clamp-1">{s.nama}</h4>
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 line-clamp-1 mt-0.5">{s.promo}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILTER CHIPS */}
        <section className="mb-4 flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`filter-chip ${filter === f.key ? 'active' : ''}`}>
              {f.label}
            </button>
          ))}
        </section>

        {/* LIST TOKO */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              {favOnly ? 'Favorit Saya' : (filter === 'all' && category === 'all' && !search ? 'Semua Toko' : 'Hasil Pencarian')}
            </h3>
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              className="px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm font-semibold text-slate-600 dark:text-slate-300">
              <option value="populer">Populer</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="near">Terdekat</option>
              <option value="promo">Promo</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400">Tidak ada toko yang cocok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(s => (
                <StoreCard key={s.id} store={s} fav={favs.includes(s.id)}
                  onToggleFav={() => toggleFav(s.id)}
                  onClick={() => setActiveId(s.id)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {activeStore && (
        <StoreModal store={activeStore} open={!!activeStore}
          onClose={() => setActiveId(null)}
          fav={favs.includes(activeStore.id)}
          onToggleFav={() => toggleFav(activeStore.id)} />
      )}
    </>
  );
}