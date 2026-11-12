'use client';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { X, ShoppingBag, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import type { Store } from '@/lib/types';
import { rp } from '@/lib/format';
import { supabase } from '@/lib/supabase'; // <-- Import Supabase

const SERVICE_FEE = 1000; // Biaya layanan Aurora Mall

type Props = { open: boolean; onClose: () => void; store: Store };

export default function CartModal({ open, onClose, store }: Props) {
  const { items, add, remove, clear, subtotal } = useCart();
  const { show } = useToast();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [customerWa, setCustomerWa] = useState('');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | 'Delivery'>('Dine-in');
  const [isLoading, setIsLoading] = useState(false);

  const storeItems = useMemo(() => items.filter(i => i.storeId === store.id), [items, store.id]);
  const storeSubtotal = storeItems.reduce((s, i) => s + i.harga * i.jumlah, 0);
  const storeServiceFee = storeItems.length > 0 ? SERVICE_FEE : 0;
  const storeTotal = storeSubtotal + storeServiceFee;

  if (!open) return null;

  // Ini fungsi yang kita perbarui
  const sendWhatsAppOrder = async () => {
    if (!name.trim()) { show('Mohon isi nama pemesan', 'error'); return; }
    if (!customerWa.trim()) { show('Mohon isi nomor WhatsApp', 'error'); return; } // Validasi WA
    if (storeItems.length === 0) { show('Keranjang kosong', 'error'); return; }

    setIsLoading(true);

        // 1. SIMPAN KE DATABASE SUPABASE
    const { error: dbError } = await supabase.from('orders').insert([{
      store_id: store.id,
      customer_name: name,
      customer_wa: customerWa,
      order_type: orderType,
      notes: notes,
      items: storeItems,
      subtotal: storeSubtotal,
      tax: storeServiceFee, // Kita simpan biaya layanan di kolom tax
      total: storeTotal
    }]);

    if (dbError) {
      show('Gagal menyimpan pesanan ke database', 'error');
      console.error(dbError);
    } else {
      // --- POTONG STOK OTOMATIS ---
      for (const item of storeItems) {
        if (item.stok !== undefined) {
          const sisaStok = item.stok - item.jumlah;
          await supabase.from('products').update({ 
            stok: sisaStok,
            is_available: sisaStok > 0 // Jika stok habis, otomatis set tidak tersedia
          }).eq('id', item.id);
        }
      }
    }

    // 2. KIRIM KE WHATSAPP
    let text = `*PESANAN BARU - ${store.nama}*\n`;
    text += `──────────────────\n`;
    text += `👤 Nama: ${name}\n`;
    text += `📱 WA Pemesan: ${customerWa}\n`; // <-- Tampilkan juga di pesan WA
    text += `🍽️ Tipe: ${orderType}\n`;
    text += `📝 Catatan: ${notes || '-'}\n`;
    text += `──────────────────\n\n*RINCIAN:*\n`;
    storeItems.forEach(i => {
      text += `• ${i.nama} (${i.jumlah}x) = ${rp(i.harga * i.jumlah)}\n`;
    });
    text += `\n──────────────────\n`;
    text += `Subtotal: ${rp(storeSubtotal)}\n`;
    text += `Biaya Layanan: ${rp(storeServiceFee)}\n`; // <-- Ganti teks pajak
    text += `*TOTAL BAYAR: ${rp(storeTotal)}*\n`;
    text += `──────────────────\n`;
    text += `_Mohon segera diproses. Terima kasih!_`;

    const targetWA = store.whatsapp || '628192003025'; 
    window.open(`https://wa.me/${targetWA}?text=${encodeURIComponent(text)}`, '_blank');
    
    show('Pesanan disimpan & membuka WhatsApp...', 'success');
    setIsLoading(false);
    clear(); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">Rincian Pesanan</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {storeItems.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-8">Keranjang Anda masih kosong</p>
          ) : (
            storeItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <Image src={item.foto} alt={item.nama} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1">{item.nama}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{rp(item.harga)} × {item.jumlah}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button onClick={() => add(item, -1)} className="w-6 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">−</button>
                    <span className="text-[11px] font-bold w-5 text-center">{item.jumlah}</span>
                    <button onClick={() => add(item, 1)} className="w-6 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">+</button>
                  </div>
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 w-16 text-right">{rp(item.harga * item.jumlah)}</span>
                  <button onClick={() => remove(item.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Tipe Pesanan</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Dine-in', 'Takeaway', 'Delivery'] as const).map(t => (
                <button key={t} onClick={() => setOrderType(t)}
                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                    orderType === t ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nama Pemesan *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan nama lengkap"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nomor WhatsApp Pemesan *</label>
            <input required value={customerWa} onChange={e => setCustomerWa(e.target.value)} placeholder="Contoh: 08123456789"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Alamat / No. Ruangan / No. Meja / Catatan</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: Meja 04 / Es dibanyakin"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-emerald-500" />
          </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Subtotal</span><span>{rp(storeSubtotal)}</span></div>
            {/* GANTI BAGIAN PAJAK INI */}
            <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Biaya Layanan</span><span>{rp(storeServiceFee)}</span></div>
            <div className="flex justify-between font-bold text-slate-800 dark:text-white text-sm pt-1"><span>Total Bayar</span><span className="text-emerald-600 dark:text-emerald-400">{rp(storeTotal)}</span></div>
          </div>

          <button onClick={sendWhatsAppOrder} disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition text-xs disabled:opacity-50">
            <MessageCircle className="w-4 h-4" /> {isLoading ? 'Memproses...' : 'Kirim Pesanan via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}