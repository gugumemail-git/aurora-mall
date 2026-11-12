'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  ArrowLeft, Store, PlusCircle, Utensils, CheckCircle2, 
  Trash2, Edit, X, LayoutDashboard, UploadCloud, Loader2, LogOut
} from 'lucide-react';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [storeForm, setStoreForm] = useState({ nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', jam_buka: 8, jam_tutup: 22 });
  const [productForm, setProductForm] = useState({ store_id: '', nama: '', harga: '', kategori: 'Makanan', deskripsi: '', foto: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data: storesData } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (storesData) setStores(storesData);
    if (productsData) setProducts(productsData);
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
    
    // Otomatis ubah 08xx menjadi 628xx
    if (payload.whatsapp.startsWith('0')) payload.whatsapp = '62' + payload.whatsapp.slice(1);
    if (payload.whatsapp.startsWith('+62')) payload.whatsapp = payload.whatsapp.slice(1);

    let error;
    if (editId) {
      const res = await supabase.from('stores').update(payload).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('stores').insert([{
        ...payload, rating: 5.0, reviews: 0, jarak: 0, eta: '15-20 mnt', ongkir: 5000, min_order: 10000, populer: 0
      }]);
      error = res.error;
    }

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage(editId ? 'Toko diupdate!' : 'Toko ditambahkan!');
      setShowStoreForm(false);
      setEditId(null);
      setStoreForm({ nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', jam_buka: 8, jam_tutup: 22 });
      fetchData();
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Yakin hapus toko ini?')) return;
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>
          <input type="email" placeholder="Email Admin" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border p-3 rounded-xl mb-3 text-sm focus:outline-emerald-500" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border p-3 rounded-xl mb-3 text-sm focus:outline-emerald-500" />
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-white rounded-lg shadow hover:bg-slate-100 transition"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-emerald-600"/> Dashboard Admin</h1>
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

        {activeTab === 'stores' && (
          <div className="space-y-4">
            <button onClick={() => { setEditId(null); setStoreForm({ nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', jam_buka: 8, jam_tutup: 22 }); setShowStoreForm(true); }}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex justify-center items-center gap-2 transition">
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
                      <input required value={storeForm.nama} onChange={e => setStoreForm({...storeForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Bakso Pak Kumis" />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold">Kategori</label>
                      <input required value={storeForm.kategori} onChange={e => setStoreForm({...storeForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Makanan" />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold">Deskripsi</label>
                      <textarea required value={storeForm.deskripsi} onChange={e => setStoreForm({...storeForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Deskripsi..." />
                    </div>

                    {/* KOLOM WHATSAPP */}
                    <div>
                      <label className="text-xs font-bold text-emerald-700">Nomor WhatsApp Toko</label>
                      <input required value={storeForm.whatsapp} onChange={e => setStoreForm({...storeForm, whatsapp: e.target.value})} className="w-full border p-2 rounded-lg mt-1 border-emerald-300" placeholder="Contoh: 08123456789" />
                      <p className="text-[10px] text-slate-500 mt-1">*Ketik nomor WA aktif toko ini.</p>
                    </div>

                    <div>
                    <div>
                      <label className="text-xs font-bold text-emerald-700">Nomor WhatsApp Toko</label>
                      <input required value={storeForm.whatsapp} onChange={e => setStoreForm({...storeForm, whatsapp: e.target.value})} className="w-full border p-2 rounded-lg mt-1 border-emerald-300" placeholder="Contoh: 08123456789" />
                      <p className="text-[10px] text-slate-500 mt-1">*Ketik nomor WA aktif toko ini.</p>
                    </div>
                      <label className="text-xs font-bold block mb-1">Foto Cover (Landscape)</label>
                      {storeForm.cover && <img src={storeForm.cover} className="h-20 w-full object-cover rounded-lg mb-2" alt="Preview" />}
                      <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-300 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, 'store_cover')} disabled={isUploading} />
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <span className="text-slate-500 text-xs font-semibold flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Pilih File Cover</span>}
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Foto Logo (Kotak)</label>
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
                   <div><label className="text-xs font-bold">Nama Menu</label><input required value={productForm.nama} onChange={e => setProductForm({...productForm, nama: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Bakso Urat" /></div>
                   <div><label className="text-xs font-bold">Harga (Angka)</label><input required type="number" value={productForm.harga} onChange={e => setProductForm({...productForm, harga: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="15000" /></div>
                   <div><label className="text-xs font-bold">Kategori Menu</label><input required value={productForm.kategori} onChange={e => setProductForm({...productForm, kategori: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Makanan" /></div>
                   <div><label className="text-xs font-bold">Deskripsi</label><textarea required value={productForm.deskripsi} onChange={e => setProductForm({...productForm, deskripsi: e.target.value})} className="w-full border p-2 rounded-lg mt-1" placeholder="Deskripsi..." /></div>
                   
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
             <table className="w-full text-left text-sm min-w-[500px]">
               <thead className="bg-slate-50 border-b">
                 <tr><th className="p-3">Menu</th><th className="p-3">Harga</th><th className="p-3">Toko</th><th className="p-3 text-right">Aksi</th></tr>
               </thead>
               <tbody>
                 {products.map(p => {
                   const toko = stores.find(s => s.id === p.store_id)?.nama || 'Toko Terhapus';
                   return (
                     <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                       <td className="p-3 flex items-center gap-2">
                         <img src={p.foto || 'https://placehold.co/100x100?text=Foto'} className="w-8 h-8 rounded object-cover bg-slate-200" alt="" />
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