'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Ctx = { dark: boolean; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('pasar_theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const d = saved ? saved === 'dark' : prefers;
    setDark(d);
    document.documentElement.classList.toggle('dark', d);
  }, []);
  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('pasar_theme', next ? 'dark' : 'light');
      return next;
    });
  };
  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);