export type Store = {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  cover: string;
  logo: string;
  whatsapp: string; // <-- TAMBAHKAN BARIS INI
  rating: number;
  reviews: number;
  jarak: number;
  eta: string;
  ongkir: number;
  minOrder: number;
  jam: { buka: number; tutup: number };
  promo: string;
  populer: number;
};

export type Product = {
  id: string;
  storeId: string;
  nama: string;
  harga: number;
  kategori: string;
  deskripsi: string;
  foto: string;
  is_available?: boolean; // <-- Tambahkan ini
};

export type CartItem = Product & { jumlah: number };