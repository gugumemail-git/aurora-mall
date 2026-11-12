'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Store, PlusCircle, Utensils, X, UploadCloud, Loader2, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [stores, setStores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State Form Toko
  const [storeForm, setStoreForm] = useState({ 
    id: '', nama: '', kategori: 'Makanan', deskripsi: '', cover: '', logo: '', whatsapp: '', jam_buka: 8, jam_tutup: 22 
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    if (data) setStores(data);
  };

  useEffect(() => { if (session) fetchData(); }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Gagal Login: ' + error.message);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      setStoreForm(prev => ({ ...prev, [target]: data.publicUrl }));
    }
    setIsUploading(false);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any = { ...storeForm, slug: storeForm.nama.toLowerCase().replace(/ /g, '-') };
    delete payload.id;

    if (storeForm.id) {
      await supabase.from('stores').update(payload).eq('id', storeForm.id);
    } else {
      await supabase.from('stores').insert([{ ...payload, rating: 5, reviews: 0, jarak: 0, eta: '20 mnt', ongkir: 5000, min_order: 10000, populer: 0 }]);
    }
    setShowStoreForm(false);
    fetchData();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm border">
          <h1 className="font-bold mb-4 text-center">Login Admin</h1>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border p-2 mb-3 rounded" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border p-2 mb-3 rounded" />
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold p-2 rounded">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border">
        <div className="flex gap-3 items-center">
          <Link href="/" className="p-2 bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/></Link>
          <h1 className="font-bold">Admin Panel</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-red-600 text-sm font-bold flex items-center gap-1"><LogOut className="w-4 h-4"/> Logout</button>
      </div>

      <button onClick={() => { setStoreForm({ id: '', nama: '', kategori: '', deskripsi: '', cover: '', logo: '', whatsapp: '', jam_buka: 8, jam_tutup: 22 }); setShowStoreForm(true); }} 
        className="w-full bg-slate-900 text-white font-bold p-3 rounded-xl flex justify-center gap-2">
        <PlusCircle className="w-5 h-5"/> Tambah Toko Baru
      </button>

      {showStoreForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveStore} className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">{storeForm.id ? 'Edit Toko' : 'Toko Baru'}</h2>
              <button type="button" onClick={() => setShowStoreForm(false)}><X className="w-5 h-5"/></button>
            </div>
            
            <div>
              <label className="text-xs font-bold">Nama Toko</label>
              <input required value={storeForm.nama} onChange={e => setStoreForm({...storeForm, nama: e.target.value})} className="w-full border p-2 rounded mt-1" />
            </div>

            <div>
              <label className="text-xs font-bold">Kategori</label>
              <input required value={storeForm.kategori} onChange={e => setStoreForm({...storeForm, kategori: e.target.value})} className="w-full border p-2 rounded mt-1" />
            </div>

            <div>
              <label className="text-xs font-bold">Deskripsi</label>
              <textarea required value={storeForm.deskripsi} onChange={e => setStoreForm({...storeForm, deskripsi: e.target.value})} className="w-full border p-2 rounded mt-1" />
            </div>

            {/* INI DIA KOLOM WHATSAPP YANG KITA CARI */}
            <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
              <label className="text-xs font-bold text-emerald-800">Nomor WhatsApp Toko</label>
              <input required value={storeForm.whatsapp} onChange={e => setStoreForm({...storeForm, whatsapp: e.target.value})} className="w-full border p-2 rounded mt-1" placeholder="Contoh: 08123456789" />
            </div>

            <div>
              <label className="text-xs font-bold">Foto Cover</label>
              {storeForm.cover && <img src={storeForm.cover} className="h-16 object-cover rounded mt-1 mb-1" />}
              <input type="file" onChange={e => handleUploadImage(e, 'cover')} className="text-xs" />
            </div>

            <div>
              <label className="text-xs font-bold">Foto Logo</label>
              {storeForm.logo && <img src={storeForm.logo} className="h-16 object-cover rounded mt-1 mb-1" />}
              <input type="file" onChange={e => handleUploadImage(e, 'logo')} className="text-xs" />
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-emerald-600 text-white font-bold p-3 rounded mt-2">
              {isUploading ? 'Uploading...' : 'Simpan Toko'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr><th className="p-3">Toko</th><th className="p-3 text-right">Aksi</th></tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{s.nama}</td>
                <td className="p-3 text-right">
                  <button onClick={() => { setStoreForm(s); setShowStoreForm(true); }} className="text-blue-600 text-xs font-bold mr-2">Edit</button>
                  <button onClick={async () => { if(confirm('Hapus?')) { await supabase.from('stores').delete().eq('id', s.id); fetchData(); } }} className="text-red-600 text-xs font-bold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}