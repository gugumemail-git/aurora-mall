'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Store, PlusCircle, Utensils, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [stores, setStores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'store' | 'product'>('store');
  const [message, setMessage] = useState('');

  // Form States
  const [storeForm, setStoreForm] = useState({ nama: '', slug: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', jam_buka: 8, jam_tutup: 22 });
  const [productForm, setProductForm] = useState({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' });

  // Ambil daftar toko untuk dropdown
  useEffect(() => {
    if (isAuthenticated) {
      supabase.from('stores').select('id, nama').then(({ data }) => {
        if (data) setStores(data);
      });
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Ganti password di sini jika mau
      setIsAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('stores').insert([{
      ...storeForm,
      slug: storeForm.nama.toLowerCase().replace(/ /g, '-'),
      rating: 5.0, reviews: 0, jarak: 0, eta: '15-20 mnt', ongkir: 5000, min_order: 10000, populer: 0
    }]);
    
    if (error) {
      setMessage('Gagal menambah toko: ' + error.message);
    } else {
      setMessage('Toko berhasil ditambahkan!');
      setStoreForm({ nama: '', slug: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', jam_buka: 8, jam_tutup: 22 });
      // Refresh dropdown
      supabase.from('stores').select('id, nama').then(({ data }) => { if (data) setStores(data); });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([{
      store_id: productForm.store_id,
      nama: productForm.nama,
      harga: parseInt(productForm.harga),
      kategori: productForm.kategori,
      deskripsi: productForm.deskripsi,
      foto: productForm.foto
    }]);
    
    if (error) {
      setMessage('Gagal menambah produk: ' + error.message);
    } else {
      setMessage('Produk berhasil ditambahkan!');
      setProductForm({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>
          <input type="password" placeholder="Masukkan Password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border p-3 rounded-xl mb-3 text-sm focus:outline-emerald-500" />
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-white rounded-lg shadow hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-xl font-bold">Dashboard Admin</h1>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" /> {message}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('store')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'store' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            <Store className="w-5 h-5" /> Tambah Toko
          </button>
          <button onClick={() => setActiveTab('product')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'product' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            <Utensils className="w-5 h-5" /> Tambah Menu
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          {activeTab === 'store' ? (
            <form onSubmit={handleAddStore} className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Form Toko Baru</h2>
              <div><label className="text-xs font-bold">Nama Toko</label><input required value={storeForm.nama} onChange={e => setStoreForm({...storeForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="Contoh: Bakso Pak Kumis" /></div>
              <div><label className="text-xs font-bold">Kategori</label><input required value={storeForm.kategori} onChange={e => setStoreForm({...storeForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="Makanan / Minuman" /></div>
              <div><label className="text-xs font-bold">Deskripsi</label><textarea required value={storeForm.deskripsi} onChange={e => setStoreForm({...storeForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="Deskripsi singkat toko" /></div>
              <div><label className="text-xs font-bold">URL Foto Cover (Gunakan Unsplash)</label><input required value={storeForm.cover} onChange={e => setStoreForm({...storeForm, cover: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="https://..." /></div>
              <div><label className="text-xs font-bold">URL Foto Logo</label><input required value={storeForm.logo} onChange={e => setStoreForm({...storeForm, logo: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="https://..." /></div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 mt-4"><PlusCircle className="w-5 h-5"/> Simpan Toko</button>
            </form>
          ) : (
            <form onSubmit={handleAddProduct} className="space-y-4">
              <h2 className="font-bold text-lg mb-4">Form Menu Baru</h2>
              <div>
                <label className="text-xs font-bold">Pilih Toko</label>
                <select required value={productForm.store_id} onChange={e => setProductForm({...productForm, store_id: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm">
                  <option value="">-- Pilih Toko --</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold">Nama Menu</label><input required value={productForm.nama} onChange={e => setProductForm({...productForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="Contoh: Bakso Urat" /></div>
              <div><label className="text-xs font-bold">Harga (Angka saja)</label><input required type="number" value={productForm.harga} onChange={e => setProductForm({...productForm, harga: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="15000" /></div>
              <div><label className="text-xs font-bold">Kategori Menu</label><input required value={productForm.kategori} onChange={e => setProductForm({...productForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="Makanan / Minuman / Snack" /></div>
              <div><label className="text-xs font-bold">Deskripsi</label><textarea required value={productForm.deskripsi} onChange={e => setProductForm({...productForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="Deskripsi singkat menu" /></div>
              <div><label className="text-xs font-bold">URL Foto Menu</label><input required value={productForm.foto} onChange={e => setProductForm({...productForm, foto: e.target.value})} className="w-full border p-2 rounded-lg mt-1 text-sm" placeholder="https://..." /></div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 mt-4"><PlusCircle className="w-5 h-5"/> Simpan Menu</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}