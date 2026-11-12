'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Search, Star, MapPin, Clock } from 'lucide-react';
import { getStoreBySlug, getProductsByStore } from '@/lib/data';
import { isOpen } from '@/lib/store';
import { rp } from '@/lib/format';
import { CartProvider, useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import CartModal from '@/components/CartModal';
import FloatingCart from '@/components/FloatingCart';
import ThemeToggle from '@/components/ThemeToggle';

export default function StorePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const store = getStoreBySlug(slug);

  if (!store) return notFound();
  const products = getProductsByStore(store.id);

  return (
    <CartProvider>
      <StoreView store={store} products={products} />
    </CartProvider>
  );
}

function StoreView({ store, products }: { store: ReturnType<typeof getStoreBySlug>; products: ReturnType<typeof getProductsByStore> }) {
  if (!store) return null;
  const { cart, add, items } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);

  const storeItems = items.filter(i => i.storeId === store.id);
  const qty = storeItems.reduce((s, i) => s + i.jumlah, 0);

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.kategori))], [products]);

  const filtered = products.filter(p => {
    const okCat = category === 'all' || p.kategori === category;
    const okQ = p.nama.toLowerCase().includes(search.toLowerCase());
    return okCat && okQ;
  });

  const open = isOpen(store);

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <Image src={store.logo} alt={store.nama} fill sizes="40px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1">{store.nama}</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-slate-400'} inline-block`} />
                {open ? 'Buka' : 'Tutup'} • {store.eta}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition">
              <ShoppingBag className="w-5 h-5" />
              {qty > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {qty}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 pb-32">
        {/* Cover */}
        <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
          <Image src={store.cover} alt={store.nama} fill sizes="600px" className="object-cover" />
        </div>

        {/* Info toko */}
        <div className="mb-4">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">{store.nama}</h2>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">{store.kategori}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <b className="text-slate-800 dark:text-white">{store.rating}</b> ({store.reviews})
            </span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{store.jarak} km</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{store.eta}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{store.deskripsi}</p>

          {store.promo && (
            <div className="mt-2.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl p-2.5 text-[11px] font-bold text-orange-600 dark:text-orange-400">
              🏷️ {store.promo}
            </div>
          )}
        </div>

        {/* Search + kategori */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm" />
        </div>

        <div className="mb-4 overflow-x-auto hide-scrollbar -mx-4 px-4 flex gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition ${
                c === category ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}>
              {c === 'all' ? 'Semua' : c}
            </button>
          ))}
        </div>

        {/* Produk grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">Tidak ada menu yang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} inCart={cart[p.id]}
                onAdd={(delta) => add(p, delta)} />
            ))}
          </div>
        )}
      </main>

      <FloatingCart storeId={store.id} onOpen={() => setCartOpen(true)} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
    </>
  );
}