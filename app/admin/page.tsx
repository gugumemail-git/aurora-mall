'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ArrowLeft, Store, PlusCircle, Utensils, X, LayoutDashboard, 
  UploadCloud, Loader2, LogOut, Receipt, CheckCircle2, Edit, Trash2
} from 'lucide-react';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'stores' | 'products' | 'orders'>('stores');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [storeForm, setStoreForm] = useState({ 
    nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', 
    jam_buka: 8, jam_tutup: 22, eta: '15-20 mnt', ongkir: 5000, min_order: 10000, promo: '',
    rating: 5.0, reviews: 0, jarak: 0 
  });
  const [productForm, setProductForm] = useState({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data: storesData } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (storesData) setStores(storesData);
    if (productsData) setProducts(productsData);
    if (ordersData) setOrders(ordersData);
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Gagal Login: ' + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: 'store_cover' | 'store_logo' | 'product_foto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    
    if (error) setMessage('Gagal upload: ' + error.message);
    else {
      const { data } = await supabase.storage.from('images').getPublicUrl(fileName);
      if (target === 'store_cover') setStoreForm({...storeForm, cover: data.publicUrl});
      if (target === 'store_logo') setStoreForm({...storeForm, logo: data.publicUrl});
      if (target === 'product_foto') setProductForm({...productForm, foto: data.publicUrl});
    }
    setIsUploading(false);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...storeForm,
      slug: storeForm.nama.toLowerCase().replace(/ /g, '-'),
    };
    if (payload.whatsapp.startsWith('0')) payload.whatsapp = '62' + payload.whatsapp.slice(1);
    if (payload.whatsapp.startsWith('+62')) payload.whatsapp = payload.whatsapp.slice(1);

    let error;
    if (editId) {
      const res = await supabase.from('stores').update(payload).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('stores').insert([{
        ...payload, populer: 0
      }]);
      error = res.error;
    }

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage(editId ? 'Toko diupdate!' : 'Toko ditambahkan!');
      setShowStoreForm(false);
      setEditId(null);
      setStoreForm({ 
        nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', 
        jam_buka: 8, jam_tutup: 22, eta: '15-20 mnt', ongkir: 5000, min_order: 10000, promo: '',
        rating: 5.0, reviews: 0, jarak: 0 
      });
      fetchData();
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Yakin hapus toko ini? Semua menu dan pesanannya akan hilang.')) return;
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) setMessage('Gagal hapus: ' + error.message);
    else { setMessage('Toko dihapus.'); fetchData(); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      store_id: productForm.store_id, nama: productForm.nama, harga: parseInt(productForm.harga),
      kategori: productForm.kategori, deskripsi: productForm.deskripsi, foto: productForm.foto
    };
    let error;
    if (editId) {
      const res = await supabase.from('products').update(payload).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert([payload]);
      error = res.error;
    }

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage(editId ? 'Menu diupdate!' : 'Menu ditambahkan!');
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

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pesanan ini? Data yang dihapus tidak bisa dikembalikan.')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) setMessage('Gagal hapus pesanan: ' + error.message);
    else { setMessage('Pesanan berhasil dihapus.'); fetchData(); }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Aurora Mall Login</h1>
          <input type="email" placeholder="Email Admin" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border p-3 rounded-xl mb-3 text-sm" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border p-3 rounded-xl mb-3 text-sm" />
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-bold flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-emerald-600"/> Dashboard Admin Aurora Mall</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {message}</div>
            <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          <button onClick={() => { setActiveTab('stores'); setShowStoreForm(false); setShowProductForm(false); }} 
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'stores' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm border'}`}>
            <Store className="w-4 h-4" /> Toko
          </button>
          <button onClick={() => { setActiveTab('products'); setShowStoreForm(false); setShowProductForm(false); }} 
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'products' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm border'}`}>
            <Utensils className="w-4 h-4" /> Menu
          </button>
          <button onClick={() => { setActiveTab('orders'); setShowStoreForm(false); setShowProductForm(false); }} 
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 shadow-sm border'}`}>
            <Receipt className="w-4 h-4" /> Pesanan
          </button>
        </div>

        {/* ================= TAB TOKO ================= */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            <button onClick={() => { 
              setEditId(null); 
              setStoreForm({ 
                nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', 
                jam_buka: 8, jam_tutup: 22, eta: '15-20 mnt', ongkir: 5000, min_order: 10000, promo: '',
                rating: 5.0, reviews: 0, jarak: 0 
              }); 
              setShowStoreForm(true); 
            }} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 transition">
              <PlusCircle className="w-5 h-5"/> Tambah Toko Baru
            </button>

            {showStoreForm && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                <form onSubmit={handleSaveStore} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">{editId ? 'Edit Toko' : 'Toko Baru'}</h2>
                    <button type="button" onClick={() => setShowStoreForm(false)}><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="text-xs font-bold">Nama Toko</label>
                      <input required value={storeForm.nama} onChange={e => setStoreForm({...storeForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Kategori</label>
                      <input required value={storeForm.kategori} onChange={e => setStoreForm({...storeForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Deskripsi</label>
                      <textarea required value={storeForm.deskripsi} onChange={e => setStoreForm({...storeForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-emerald-700">Nomor WhatsApp Toko</label>
                      <input required value={storeForm.whatsapp} onChange={e => setStoreForm({...storeForm, whatsapp: e.target.value})} className="w-full border p-2 rounded-lg mt-1 border-emerald-300" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-bold">Rating (1-5)</label>
                        <input type="number" step="0.1" min="1" max="5" required value={storeForm.rating} onChange={e => setStoreForm({...storeForm, rating: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Jml Ulasan</label>
                        <input type="number" required value={storeForm.reviews} onChange={e => setStoreForm({...storeForm, reviews: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Jarak (km)</label>
                        <input type="number" step="0.1" required value={storeForm.jarak} onChange={e => setStoreForm({...storeForm, jarak: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold">Jam Buka</label>
                        <input type="number" required value={storeForm.jam_buka} onChange={e => setStoreForm({...storeForm, jam_buka: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Jam Tutup</label>
                        <input type="number" required value={storeForm.jam_tutup} onChange={e => setStoreForm({...storeForm, jam_tutup: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold">Estimasi Waktu</label>
                      <input required value={storeForm.eta} onChange={e => setStoreForm({...storeForm, eta: e.target.value})} className="w-full border p-2 rounded-lg mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold">Ongkir</label>
                        <input type="number" required value={storeForm.ongkir} onChange={e => setStoreForm({...storeForm, ongkir: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Min. Order</label>
                        <input type="number" required value={storeForm.min_order} onChange={e => setStoreForm({...storeForm, min_order: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-orange-600">Promo (Kosongkan jika tidak ada)</label>
                      <input value={storeForm.promo} onChange={e => setStoreForm({...storeForm, promo: e.target.value})} className="w-full border p-2 rounded-lg mt-1 border-orange-300" />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Foto Cover</label>
                      {storeForm.cover && <img src={storeForm.cover} className="h-20 w-full object-cover rounded-lg mb-2" alt="Preview" />}
                      <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-300 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'store_cover')} disabled={isUploading} />
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <span className="text-slate-500 text-xs font-semibold flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Pilih File Cover</span>}
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Foto Logo</label>
                      {storeForm.logo && <img src={storeForm.logo} className="h-16 w-16 object-cover rounded-lg mb-2" alt="Preview" />}
                      <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-300 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'store_logo')} disabled={isUploading} />
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <span className="text-slate-500 text-xs font-semibold flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Pilih File Logo</span>}
                      </label>
                    </div>
                    <button type="submit" disabled={isUploading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 mt-4 disabled:opacity-50">Simpan Toko</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="p-3">Nama Toko</th><th className="p-3">Kategori</th><th className="p-3 text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2">
                        <img src={s.logo || 'https://placehold.co/100x100?text=L'} className="w-8 h-8 rounded object-cover bg-slate-200" alt="" />
                        <span className="font-semibold">{s.nama}</span>
                      </td>
                      <td className="p-3 text-slate-500">{s.kategori}</td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => { setEditId(s.id); setStoreForm({...s, whatsapp: s.whatsapp || ''}); setShowStoreForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteStore(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB MENU ================= */}
        {activeTab === 'products' && (
           <div className="space-y-4">
           <button onClick={() => { setEditId(null); setProductForm({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' }); setShowProductForm(true); }}
             className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 transition">
             <PlusCircle className="w-5 h-5"/> Tambah Menu Baru
           </button>

           {showProductForm && (
             <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
               <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                 <div className="flex justify-between items-center mb-4">
                   <h2 className="font-bold text-lg">{editId ? 'Edit Menu' : 'Menu Baru'}</h2>
                   <button type="button" onClick={() => setShowProductForm(false)}><X className="w-5 h-5"/></button>
                 </div>
                 <div className="space-y-4 text-sm">
                   <div>
                     <label className="text-xs font-bold">Pilih Toko</label>
                     <select required value={productForm.store_id} onChange={e => setProductForm({...productForm, store_id: e.target.value})} className="w-full border p-2 rounded-lg mt-1">
                       <option value="">-- Pilih Toko --</option>
                       {stores.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                     </select>
                   </div>
                   <div><label className="text-xs font-bold">Nama Menu</label><input required value={productForm.nama} onChange={e => setProductForm({...productForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1" /></div>
                   <div><label className="text-xs font-bold">Harga (Angka)</label><input required type="number" value={productForm.harga} onChange={e => setProductForm({...productForm, harga: e.target.value})} className="w-full border p-2 rounded-lg mt-1" /></div>
                   <div><label className="text-xs font-bold">Kategori Menu</label><input required value={productForm.kategori} onChange={e => setProductForm({...productForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1" /></div>
                   <div><label className="text-xs font-bold">Deskripsi</label><textarea required value={productForm.deskripsi} onChange={e => setProductForm({...productForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1" /></div>
                   
                   <div>
                     <label className="text-xs font-bold block mb-1">Foto Menu</label>
                     {productForm.foto && <img src={productForm.foto} className="h-24 w-full object-cover rounded-lg mb-2" alt="Preview" />}
                     <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-300 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'product_foto')} disabled={isUploading} />
                       {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <span className="text-slate-500 text-xs font-semibold flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Pilih File Foto Menu</span>}
                     </label>
                   </div>

                   <button type="submit" disabled={isUploading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 mt-4 disabled:opacity-50">Simpan Menu</button>
                 </div>
               </form>
             </div>
           )}

           <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[600px]">
               <thead className="bg-slate-50 border-b">
                 <tr><th className="p-3">Menu & Toko</th><th className="p-3">Harga</th><th className="p-3 text-right">Aksi</th></tr>
               </thead>
               <tbody>
                 {products.map(p => {
                   const toko = stores.find(s => s.id === p.store_id)?.nama || 'Toko Terhapus';
                   return (
                     <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                       <td className="p-3 flex items-center gap-3">
                         <img src={p.foto || 'https://placehold.co/100x100?text=Foto'} className="w-10 h-10 rounded-lg object-cover bg-slate-200" alt="" />
                         <div>
                           <p className="font-bold text-slate-800">{p.nama}</p>
                           <p className="text-[11px] text-slate-500">{toko} • {p.kategori}</p>
                         </div>
                       </td>
                       <td className="p-3 text-emerald-600 font-bold">Rp {p.harga.toLocaleString('id-ID')}</td>
                       <td className="p-3 text-right space-x-2">
                         <button onClick={() => { setEditId(p.id); setProductForm({...p, harga: p.harga.toString()}); setShowProductForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                         <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         </div>
        )}

        {/* ================= TAB PESANAN ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Omzet Toko</p>
                <p className="text-xl font-black text-emerald-700">
                  Rp {orders.reduce((sum, o) => sum + (o.subtotal || 0), 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Pendapatan Aplikasi (Fee)</p>
                <p className="text-xl font-black text-blue-700">
                  Rp {orders.reduce((sum, o) => sum + (o.tax || 0), 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Total Transaksi</p>
                <p className="text-xl font-black text-slate-700">{orders.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Belum ada pesanan masuk</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map(o => {
                    const toko = stores.find(s => s.id === o.store_id)?.nama || 'Toko Terhapus';
                    return (
                      <div key={o.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-800">{o.customer_name}</p>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-semibold">{o.order_type}</span>
                          </div>
                          <p className="text-[11px] font-semibold text-emerald-600 mb-1">
                            📱 {o.customer_wa ? o.customer_wa : '-'}
                          </p>
                          <p className="text-[10px] text-slate-400">{new Date(o.created_at).toLocaleString('id-ID')}</p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-emerald-600 mb-1">{toko}</p>
                          {o.items.map((item: any, i: number) => (
                            <p key={i} className="text-[11px] text-slate-600">{item.jumlah}x {item.nama}</p>
                          ))}
                          {o.notes && <p className="text-[10px] text-slate-400 mt-1 italic">"{o.notes}"</p>}
                          
                          <p className="text-[10px] text-slate-500 mt-2 border-t border-slate-100 pt-1">
                            Subtotal: Rp {(o.subtotal || 0).toLocaleString('id-ID')} <br/>
                            Fee App: Rp {(o.tax || 0).toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                          <p className="font-bold text-slate-800 text-sm">Rp {o.total.toLocaleString('id-ID')}</p>
                          <button 
                            onClick={() => handleDeleteOrder(o.id)} 
                            className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition shadow-md"
                          >
                            <Trash2 className="w-4 h-4" /> HAPUS
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}