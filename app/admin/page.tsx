'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ArrowLeft, Store, PlusCircle, Utensils, CheckCircle2, 
  Trash2, Edit, X, LayoutDashboard 
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');
  const [message, setMessage] = useState('');
  
  // State untuk Modal Form (Tambah/Edit)
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form States
  const [storeForm, setStoreForm] = useState({ nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', jam_buka: 8, jam_tutup: 22 });
  const [productForm, setProductForm] = useState({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' });

  // Fungsi Ambil Data
  const fetchData = async () => {
    const { data: storesData } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (storesData) setStores(storesData);
    if (productsData) setProducts(productsData);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Password salah!');
  };

  // --- HANDLERS TOKO ---
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    let error;
    
    if (editId) {
      // Proses Edit
      const res = await supabase.from('stores').update(storeForm).eq('id', editId);
      error = res.error;
    } else {
      // Proses Tambah
      const res = await supabase.from('stores').insert([{
        ...storeForm,
        slug: storeForm.nama.toLowerCase().replace(/ /g, '-'),
        rating: 5.0, reviews: 0, jarak: 0, eta: '15-20 mnt', ongkir: 5000, min_order: 10000, populer: 0
      }]);
      error = res.error;
    }

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage(editId ? 'Toko berhasil diupdate!' : 'Toko berhasil ditambahkan!');
      setShowStoreForm(false);
      setEditId(null);
      setStoreForm({ nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', jam_buka: 8, jam_tutup: 22 });
      fetchData();
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Yakin ingin menghapus toko ini? Semua menu di dalamnya juga akan terhapus.')) return;
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) setMessage('Gagal hapus: ' + error.message);
    else { setMessage('Toko dihapus.'); fetchData(); }
  };

  // --- HANDLERS PRODUK ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let error;
    
    if (editId) {
      const res = await supabase.from('products').update({
        store_id: productForm.store_id,
        nama: productForm.nama,
        harga: parseInt(productForm.harga),
        kategori: productForm.kategori,
        deskripsi: productForm.deskripsi,
        foto: productForm.foto
      }).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert([{
        store_id: productForm.store_id,
        nama: productForm.nama,
        harga: parseInt(productForm.harga),
        kategori: productForm.kategori,
        deskripsi: productForm.deskripsi,
        foto: productForm.foto
      }]);
      error = res.error;
    }

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage(editId ? 'Menu berhasil diupdate!' : 'Menu berhasil ditambahkan!');
      setShowProductForm(false);
      setEditId(null);
      setProductForm({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' });
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) setMessage('Gagal hapus: ' + error.message);
    else { setMessage('Menu dihapus.'); fetchData(); }
  };

  // --- LOGIN UI ---
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

  // --- DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-white rounded-lg shadow hover:bg-slate-100 transition"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-emerald-600"/> Dashboard Admin</h1>
          </div>
        </div>

        {/* Notifikasi */}
        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {message}</div>
            <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Tab Menu */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setActiveTab('stores'); setShowStoreForm(false); }} 
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'stores' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            <Store className="w-5 h-5" /> Kelola Toko
          </button>
          <button onClick={() => { setActiveTab('products'); setShowProductForm(false); }} 
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'products' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            <Utensils className="w-5 h-5" /> Kelola Menu
          </button>
        </div>

        {/* ================= TAB TOKO ================= */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            <button onClick={() => { setEditId(null); setStoreForm({ nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', jam_buka: 8, jam_tutup: 22 }); setShowStoreForm(true); }}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 transition">
              <PlusCircle className="w-5 h-5"/> Tambah Toko Baru
            </button>

            {/* Form Toko (Modal) */}
            {showStoreForm && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                <form onSubmit={handleSaveStore} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">{editId ? 'Edit Toko' : 'Toko Baru'}</h2>
                    <button type="button" onClick={() => setShowStoreForm(false)}><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div><label className="text-xs font-bold">Nama Toko</label><input required value={storeForm.nama} onChange={e => setStoreForm({...storeForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Bakso Pak Kumis" /></div>
                    <div><label className="text-xs font-bold">Kategori</label><input required value={storeForm.kategori} onChange={e => setStoreForm({...storeForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Makanan" /></div>
                    <div><label className="text-xs font-bold">Deskripsi</label><textarea required value={storeForm.deskripsi} onChange={e => setStoreForm({...storeForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Deskripsi..." /></div>
                    <div><label className="text-xs font-bold">URL Foto Cover (Landscape)</label><input required value={storeForm.cover} onChange={e => setStoreForm({...storeForm, cover: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="https://..." /></div>
                    <div><label className="text-xs font-bold">URL Foto Logo (Kotak)</label><input required value={storeForm.logo} onChange={e => setStoreForm({...storeForm, logo: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="https://..." /></div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 mt-4">Simpan Toko</button>
                  </div>
                </form>
              </div>
            )}

            {/* List Toko */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Nama Toko</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2">
                        <img src={s.logo} className="w-8 h-8 rounded object-cover" alt="" />
                        <span className="font-semibold">{s.nama}</span>
                      </td>
                      <td className="p-3 text-slate-500">{s.kategori}</td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => { setEditId(s.id); setStoreForm(s); setShowStoreForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteStore(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB PRODUK ================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <button onClick={() => { setEditId(null); setProductForm({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' }); setShowProductForm(true); }}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 transition">
              <PlusCircle className="w-5 h-5"/> Tambah Menu Baru
            </button>

            {/* Form Produk (Modal) */}
            {showProductForm && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">{editId ? 'Edit Menu' : 'Menu Baru'}</h2>
                    <button type="button" onClick={() => setShowProductForm(false)}><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-xs font-bold">Pilih Toko</label>
                      <select required value={productForm.store_id} onChange={e => setProductForm({...productForm, store_id: e.target.value})} className="w-full border p-2 rounded-lg mt-1">
                        <option value="">-- Pilih Toko --</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-bold">Nama Menu</label><input required value={productForm.nama} onChange={e => setProductForm({...productForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Bakso Urat" /></div>
                    <div><label className="text-xs font-bold">Harga (Angka)</label><input required type="number" value={productForm.harga} onChange={e => setProductForm({...productForm, harga: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="15000" /></div>
                    <div><label className="text-xs font-bold">Kategori Menu</label><input required value={productForm.kategori} onChange={e => setProductForm({...productForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Makanan" /></div>
                    <div><label className="text-xs font-bold">Deskripsi</label><textarea required value={productForm.deskripsi} onChange={e => setProductForm({...productForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Deskripsi..." /></div>
                    <div><label className="text-xs font-bold">URL Foto Menu</label><input required value={productForm.foto} onChange={e => setProductForm({...productForm, foto: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="https://..." /></div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 mt-4">Simpan Menu</button>
                  </div>
                </form>
              </div>
            )}

            {/* List Menu */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Menu</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Toko</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const toko = stores.find(s => s.id === p.store_id)?.nama || 'Toko Terhapus';
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-3 flex items-center gap-2">
                          <img src={p.foto} className="w-8 h-8 rounded object-cover" alt="" />
                          <span className="font-semibold">{p.nama}</span>
                        </td>
                        <td className="p-3 text-emerald-600 font-bold">Rp {p.harga.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-slate-500">{toko}</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => { setEditId(p.id); setProductForm({...p, harga: p.harga.toString()}); setShowProductForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}