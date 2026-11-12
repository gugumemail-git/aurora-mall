export type Store = {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  cover: string;
  logo: string;
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
};

export type CartItem = Product & { jumlah: number };