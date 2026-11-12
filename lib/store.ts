import type { Store } from './types';

export const isOpen = (s: Store) => {
  const h = new Date().getHours();
  return h >= s.jam.buka && h < s.jam.tutup;
};