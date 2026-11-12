import type { Store, Product } from './types';

export const STORES: Store[] = [
  {
    id: 's1', slug: 'kopi-kita', nama: 'Kopi Kita', kategori: 'Kopi & Minuman',
    deskripsi: 'Kopi susu gula aren, matcha, dan aneka minuman segar kekinian.',
    cover: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=200&q=80',
    rating: 4.8, reviews: 1240, jarak: 0.4, eta: '15-25 mnt', ongkir: 6000, minOrder: 15000,
    jam: { buka: 8, tutup: 22 }, promo: 'Diskon 20% menu kopi s.d. jam 12', populer: 96
  },
  {
    id: 's2', slug: 'nasi-bakar-mantap', nama: 'Nasi Bakar Mantap', kategori: 'Makanan',
    deskripsi: 'Nasi bakar ayam, ikan, cumi dengan sambal khas rumahan.',
    cover: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=200&q=80',
    rating: 4.6, reviews: 876, jarak: 0.9, eta: '20-30 mnt', ongkir: 8000, minOrder: 20000,
    jam: { buka: 10, tutup: 21 }, promo: '', populer: 88
  },
  {
    id: 's3', slug: 'croissant-lab', nama: 'Croissant Lab', kategori: 'Dessert & Snack',
    deskripsi: 'Croissant butter, pastry renyah, dan dessert premium fresh tiap hari.',
    cover: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    rating: 4.9, reviews: 512, jarak: 1.6, eta: '25-40 mnt', ongkir: 10000, minOrder: 25000,
    jam: { buka: 7, tutup: 20 }, promo: 'Beli 3 gratis 1 croissant', populer: 74
  },
  {
    id: 's4', slug: 'warung-snack-gurih', nama: 'Warung Snack Gurih', kategori: 'Snack',
    deskripsi: 'French fries, pisang goreng, singkong, dan cemilan gurih lainnya.',
    cover: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80',
    rating: 4.4, reviews: 320, jarak: 0.3, eta: '10-20 mnt', ongkir: 5000, minOrder: 10000,
    jam: { buka: 9, tutup: 23 }, promo: '', populer: 60
  },
  {
    id: 's5', slug: 'matcha-house', nama: 'Matcha House', kategori: 'Kopi & Minuman',
    deskripsi: 'Matcha jepang asli, houjicha, dan minuman sehat tanpa gula berlebih.',
    cover: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=200&q=80',
    rating: 4.7, reviews: 654, jarak: 2.1, eta: '25-35 mnt', ongkir: 12000, minOrder: 20000,
    jam: { buka: 8, tutup: 21 }, promo: 'Gratis topping matcha tiap pembelian 2 cup', populer: 82
  },
  {
    id: 's6', slug: 'brownies-ibu', nama: 'Brownies Ibu', kategori: 'Dessert & Snack',
    deskripsi: 'Brownies fudgy homemade, cookies, dan cake lembut untuk oleh-oleh.',
    cover: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80',
    rating: 4.5, reviews: 210, jarak: 1.2, eta: '20-30 mnt', ongkir: 9000, minOrder: 18000,
    jam: { buka: 9, tutup: 20 }, promo: '', populer: 55
  },
  {
    id: 's7', slug: 'ayam-geprek-pakde', nama: 'Ayam Geprek Pakde', kategori: 'Makanan',
    deskripsi: 'Ayam geprek level 1-5, sambal bawang, nasi anget, dan lalapan segar.',
    cover: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=200&q=80',
    rating: 4.6, reviews: 1502, jarak: 1.4, eta: '20-30 mnt', ongkir: 8000, minOrder: 15000,
    jam: { buka: 10, tutup: 22 }, promo: 'Paket ayam + es teh cuma 25rb', populer: 94
  }
];

export const PRODUCTS: Product[] = [
  { id: 'p1', storeId: 's1', nama: 'Es Kopi Aren', harga: 18000, kategori: 'Minuman', deskripsi: 'Kopi susu dengan gula aren murni, manis pas.', foto: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80' },
  { id: 'p2', storeId: 's1', nama: 'Matcha Cream Latte', harga: 22000, kategori: 'Minuman', deskripsi: 'Matcha jepang asli dengan susu creamy.', foto: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80' },
  { id: 'p3', storeId: 's1', nama: 'Americano Ice', harga: 16000, kategori: 'Minuman', deskripsi: 'Espresso dengan es, segar dan kuat.', foto: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80' },

  { id: 'p4', storeId: 's2', nama: 'Nasi Bakar Ayam', harga: 22000, kategori: 'Makanan', deskripsi: 'Nasi bakar isi ayam suwir dengan sambal khas.', foto: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' },
  { id: 'p5', storeId: 's2', nama: 'Nasi Bakar Cumi', harga: 28000, kategori: 'Makanan', deskripsi: 'Nasi bakar cumi pedas gurih.', foto: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80' },

  { id: 'p6', storeId: 's3', nama: 'Croissant Butter', harga: 20000, kategori: 'Snack', deskripsi: 'Croissant butter renyah, dipanggang fresh.', foto: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
  { id: 'p7', storeId: 's3', nama: 'Pain au Chocolat', harga: 24000, kategori: 'Snack', deskripsi: 'Pastry isi cokelat premium.', foto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },

  { id: 'p8', storeId: 's4', nama: 'French Fries', harga: 17000, kategori: 'Snack', deskripsi: 'Kentang goreng gurih dengan saus.', foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80' },
  { id: 'p9', storeId: 's4', nama: 'Pisang Goreng Keju', harga: 15000, kategori: 'Snack', deskripsi: 'Pisang goreng crispy topping keju.', foto: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80' },

  { id: 'p10', storeId: 's5', nama: 'Matcha Latte', harga: 24000, kategori: 'Minuman', deskripsi: 'Matcha latte creamy tanpa gula berlebih.', foto: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80' },
  { id: 'p11', storeId: 's5', nama: 'Houjicha Ice', harga: 22000, kategori: 'Minuman', deskripsi: 'Teh houjicha roasted, aroma khas.', foto: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80' },

  { id: 'p12', storeId: 's6', nama: 'Chocolate Brownie', harga: 21000, kategori: 'Dessert', deskripsi: 'Brownie cokelat fudgy, disajikan hangat.', foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' },
  { id: 'p13', storeId: 's6', nama: 'Cookies Almond', harga: 18000, kategori: 'Dessert', deskripsi: 'Cookies renyah dengan almond slice.', foto: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80' },

  { id: 'p14', storeId: 's7', nama: 'Ayam Geprek Level 3', harga: 20000, kategori: 'Makanan', deskripsi: 'Ayam crispy digeprek sambal bawang level 3.', foto: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80' },
  { id: 'p15', storeId: 's7', nama: 'Paket Geprek + Es Teh', harga: 25000, kategori: 'Makanan', deskripsi: 'Ayam geprek, nasi, lalapan, dan es teh.', foto: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80' }
];

export const getStoreBySlug = (slug: string) => STORES.find(s => s.slug === slug);
export const getStoreById = (id: string) => STORES.find(s => s.id === id);
export const getProductsByStore = (storeId: string) => PRODUCTS.filter(p => p.storeId === storeId);